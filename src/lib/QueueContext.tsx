'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type TriageUrgency = 'Normal' | 'Priority' | 'Emergency';
export type QueueStage = 'Waiting' | 'In Room' | 'Consulted' | 'On Hold';

export interface PatientToken {
  id: string;
  tokenNumber: number;
  fullName: string;
  mobileNumber: string;
  gender: string;
  age: number;
  allergies?: string;
  symptoms: string;
  triageLevel: TriageUrgency;
  stage: QueueStage;
  timestamp: string;
  prescriptionNotes?: string;
}

interface QueueContextType {
  tokens: PatientToken[];
  activeToken: PatientToken | null;
  addPatientToken: (patientData: Omit<PatientToken, 'id' | 'tokenNumber' | 'stage' | 'timestamp'>) => PatientToken;
  callNextToken: () => void;
  completeConsultation: (tokenId: string, notes?: string) => void;
  holdToken: (tokenId: string) => void;
  resetQueue: () => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

const INITIAL_TOKENS: PatientToken[] = [
  {
    id: 'token-12',
    tokenNumber: 12,
    fullName: 'Rahul Sharma',
    mobileNumber: '9820098200',
    gender: 'Male',
    age: 28,
    allergies: 'Penicillin',
    symptoms: 'Acute fever since 2 days, mild sore throat, headache',
    triageLevel: 'Normal',
    stage: 'In Room',
    timestamp: '10:15 AM',
  },
  {
    id: 'token-13',
    tokenNumber: 13,
    fullName: 'Priya Patel',
    mobileNumber: '9820198201',
    gender: 'Female',
    age: 34,
    symptoms: 'High fever (102°F) and severe body ache',
    triageLevel: 'Priority',
    stage: 'Waiting',
    timestamp: '10:25 AM',
  },
  {
    id: 'token-14',
    tokenNumber: 14,
    fullName: 'Amit Verma',
    mobileNumber: '9820298202',
    gender: 'Male',
    age: 52,
    symptoms: 'Chest discomfort and hypertension checkup',
    triageLevel: 'Emergency',
    stage: 'Waiting',
    timestamp: '10:30 AM',
  },
];

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<PatientToken[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arogya_live_queue');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fallback
        }
      }
    }
    return INITIAL_TOKENS;
  });

  useEffect(() => {
    localStorage.setItem('arogya_live_queue', JSON.stringify(tokens));
  }, [tokens]);

  const activeToken = tokens.find((t) => t.stage === 'In Room') || null;

  const addPatientToken = (patientData: Omit<PatientToken, 'id' | 'tokenNumber' | 'stage' | 'timestamp'>) => {
    const nextTokenNum = tokens.length > 0 ? Math.max(...tokens.map((t) => t.tokenNumber)) + 1 : 1;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newToken: PatientToken = {
      ...patientData,
      id: `token-${nextTokenNum}-${Date.now()}`,
      tokenNumber: nextTokenNum,
      stage: 'Waiting',
      timestamp: timeStr,
    };

    setTokens((prev) => [...prev, newToken]);
    return newToken;
  };

  const callNextToken = () => {
    setTokens((prev) => {
      const waitingTokens = prev.filter((t) => t.stage === 'Waiting');
      if (waitingTokens.length === 0) return prev;

      const nextToCall = waitingTokens[0];
      return prev.map((t) => {
        if (t.stage === 'In Room') return { ...t, stage: 'Consulted' };
        if (t.id === nextToCall.id) return { ...t, stage: 'In Room' };
        return t;
      });
    });
  };

  const completeConsultation = (tokenId: string, notes?: string) => {
    setTokens((prev) =>
      prev.map((t) =>
        t.id === tokenId
          ? { ...t, stage: 'Consulted', prescriptionNotes: notes || t.prescriptionNotes }
          : t
      )
    );
  };

  const holdToken = (tokenId: string) => {
    setTokens((prev) =>
      prev.map((t) => (t.id === tokenId ? { ...t, stage: 'On Hold' } : t))
    );
  };

  const resetQueue = () => {
    setTokens(INITIAL_TOKENS);
    localStorage.removeItem('arogya_live_queue');
  };

  return (
    <QueueContext.Provider
      value={{
        tokens,
        activeToken,
        addPatientToken,
        callNextToken,
        completeConsultation,
        holdToken,
        resetQueue,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}