'use client';

import React, { useState } from 'react';
import { useQueue } from '@/lib/QueueContext';

export default function DoctorWorkspacePage() {
  const { tokens, activeToken, callNextToken, completeConsultation, holdToken } = useQueue();
  const [rxNotes, setRxNotes] = useState('');

  const waitingTokens = tokens.filter((t) => t.stage === 'Waiting');
  const completedCount = tokens.filter((t) => t.stage === 'Consulted').length;

  const handleComplete = () => {
    if (activeToken) {
      completeConsultation(activeToken.id, rxNotes);
      setRxNotes('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              LIVE CLINIC CONSOLE
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">
              Doctor Workspace &amp; Voice Dictation Desk
            </h1>
            <p className="text-slate-600 font-medium text-sm mt-1">
              Welcome, Dr. Sarika B. Singh. Manage live consultations and queue tokens.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={callNextToken}
              disabled={waitingTokens.length === 0}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-5 py-3 rounded-xl text-sm transition shadow-sm disabled:opacity-50"
            >
              + Call Next Token ({waitingTokens.length} Waiting)
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase">Total OPD Patients</div>
            <div className="text-3xl font-black text-slate-900 mt-2">{tokens.length}</div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="text-xs font-bold text-amber-600 uppercase">Waiting in Queue</div>
            <div className="text-3xl font-black text-amber-700 mt-2">{waitingTokens.length}</div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="text-xs font-bold text-emerald-600 uppercase">Completed Consultations</div>
            <div className="text-3xl font-black text-emerald-700 mt-2">{completedCount}</div>
          </div>
        </div>

        {/* MAIN DESK CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ACTIVE CONSULTATION ROOM */}
          <div className="lg:col-span-2 bg-[#FFFDF9] border-2 border-emerald-200 p-8 rounded-3xl shadow-lg space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <h2 className="text-xl font-extrabold text-slate-900">
                Active Consultation Room
              </h2>
              {activeToken ? (
                <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg animate-pulse">
                  CURRENT TOKEN: #{activeToken.tokenNumber}
                </span>
              ) : (
                <span className="px-3 py-1 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg">
                  ROOM VACANT
                </span>
              )}
            </div>

            {activeToken ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xl font-black text-slate-900">{activeToken.fullName}</div>
                    <div className="text-xs font-semibold text-slate-500">
                      {activeToken.gender} • {activeToken.age} Yrs • Phone: +91 {activeToken.mobileNumber}
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded ${
                    activeToken.triageLevel === 'Emergency' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {activeToken.triageLevel} Priority
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-700 uppercase mb-1">Chief Symptoms</div>
                  <div className="p-3 bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl">
                    {activeToken.symptoms}
                  </div>
                </div>

                {activeToken.allergies && (
                  <div>
                    <div className="text-xs font-bold text-rose-700 uppercase mb-1">Known Allergies</div>
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 text-sm font-medium rounded-xl">
                      {activeToken.allergies}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold text-slate-700 uppercase mb-1">Prescription &amp; Clinical Notes</div>
                  <textarea
                    rows={4}
                    value={rxNotes}
                    onChange={(e) => setRxNotes(e.target.value)}
                    placeholder="Type diagnosis, dosage, or instructions..."
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-semibold p-4 rounded-xl focus:outline-none focus:border-emerald-600 text-sm transition resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => holdToken(activeToken.id)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-xl text-sm transition"
                  >
                    Hold Token
                  </button>
                  <button
                    onClick={handleComplete}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl text-sm transition shadow-sm"
                  >
                    Complete &amp; Issue Rx
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white space-y-3">
                <div className="text-3xl">🩺</div>
                <div className="font-bold text-slate-700 text-base">No active patient in cabin</div>
                <p className="text-xs text-slate-500">
                  Click <strong>"+ Call Next Token"</strong> to bring the next waiting patient into the consultation room.
                </p>
              </div>
            )}
          </div>

          {/* UPCOMING QUEUE */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Upcoming Queue ({waitingTokens.length})
            </h3>

            <div className="space-y-3">
              {waitingTokens.length > 0 ? (
                waitingTokens.map((t, idx) => (
                  <div key={t.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">#{t.tokenNumber} • {t.fullName}</div>
                      <div className="text-xs text-slate-500 font-medium">Age {t.age} • {t.triageLevel}</div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      idx === 0 ? 'text-amber-700 bg-amber-100' : 'text-slate-600 bg-slate-200'
                    }`}>
                      {idx === 0 ? 'Next' : 'Waiting'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 font-medium p-4 text-center">Queue is empty</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}