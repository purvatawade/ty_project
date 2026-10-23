'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useQueue } from '@/lib/QueueContext';

export default function PatientQueuePage() {
  const { user } = useAuth();
  const { tokens, activeToken } = useQueue();
  const router = useRouter();

  const [searchToken, setSearchToken] = useState('15');
  const [patientTokenNum, setPatientTokenNum] = useState<number | null>(15);

  useEffect(() => {
    if (user?.role === 'admin') {
      router.push('/doctor-workspace');
      return;
    }

    const activePass = localStorage.getItem('last_opd_token');
    if (activePass) {
      try {
        const parsed = JSON.parse(activePass);
        if (parsed.token) {
          setPatientTokenNum(parsed.token);
          setSearchToken(String(parsed.token));
        }
      } catch {}
    }
  }, [user, router]);

  const currentCallingToken = activeToken ? activeToken.tokenNumber : 0;
  const userTokenObj = tokens.find((t) => t.tokenNumber === patientTokenNum) || null;

  const waitingAheadCount = tokens.filter(
    (t) => t.stage === 'Waiting' && t.tokenNumber < (patientTokenNum || 0)
  ).length;

  const estimatedWaitMinutes = waitingAheadCount * 10;

  const handleTrackToken = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(searchToken.replace(/\D/g, ''), 10);
    if (!isNaN(num)) {
      setPatientTokenNum(num);
    }
  };

  if (user?.role === 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="bg-[#064E3B] border border-emerald-800 rounded-3xl p-8 shadow-md text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-2xl shrink-0">
              ⏱️
            </div>
            <div>
              <span className="inline-block px-3 py-0.5 bg-emerald-800/80 border border-emerald-700 text-emerald-100 text-xs font-semibold rounded-full mb-1">
                LIVE OPD STATUS
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Patient Turn &amp; Live Queue Tracker
              </h1>
              <p className="text-emerald-100 text-sm mt-0.5">
                Dhanwantri Clinic • Check estimated wait time &amp; live doctor turn
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 rounded-xl transition shadow-sm text-sm whitespace-nowrap"
          >
            + Book New Token
          </Link>
        </div>

        {/* SEARCH / TRACK INPUT */}
        <div className="bg-[#FFFDF9] border-2 border-emerald-200 rounded-3xl p-6 shadow-xl shadow-emerald-950/5">
          <form onSubmit={handleTrackToken} className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Enter Your OPD Token Number
              </label>
              <input
                type="text"
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                placeholder="e.g. 15"
                className="w-full bg-white border border-slate-300 text-slate-900 font-bold px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-base shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#064E3B] hover:bg-emerald-800 text-white font-black px-8 py-3.5 rounded-xl transition shadow-md text-sm mt-auto"
            >
              Track Live Turn
            </button>
          </form>
        </div>

        {/* METRICS */}
        {patientTokenNum && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50/80 border-2 border-emerald-300 p-8 rounded-3xl shadow-sm text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-800">
                NOW IN CABIN
              </span>
              <div className="text-5xl font-black text-emerald-900 pt-2">
                {currentCallingToken ? `#${currentCallingToken}` : 'Vacant'}
              </div>
              <p className="text-xs font-bold text-emerald-700">Dr. Sarika B. Singh</p>
            </div>

            <div className="bg-white border-2 border-slate-200 p-8 rounded-3xl shadow-sm text-center space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                YOUR TOKEN PASS
              </span>
              <div className="text-5xl font-black text-slate-900 pt-2">
                #{patientTokenNum}
              </div>
              <p className="text-xs font-bold text-slate-600">
                {userTokenObj?.fullName || 'Registered Patient'}
              </p>
            </div>

            <div className="bg-amber-50/80 border-2 border-amber-300 p-8 rounded-3xl shadow-sm text-center space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-900">
                ESTIMATED WAIT TIME
              </span>
              <div className="text-4xl font-black text-amber-950 pt-2">
                ~{estimatedWaitMinutes} Mins
              </div>
              <p className="text-xs font-bold text-amber-800">
                {waitingAheadCount} Patients ahead of you
              </p>
            </div>
          </div>
        )}

        {/* VISUAL QUEUE */}
        <div className="bg-white border-2 border-slate-200 p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>📊</span>
              <span>Live Queue Visual Flow</span>
            </h2>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full">
              Real-time Syncing
            </span>
          </div>

          <div className="space-y-4">
            {tokens.map((t) => (
              <div
                key={t.id}
                className={`p-4 rounded-2xl flex justify-between items-center border ${
                  t.tokenNumber === patientTokenNum
                    ? 'bg-[#FFFDF9] border-2 border-emerald-400 shadow-md'
                    : t.stage === 'In Room'
                    ? 'bg-emerald-50 border-2 border-emerald-500 shadow-sm'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-10 h-10 rounded-xl font-black flex items-center justify-center text-sm ${
                    t.stage === 'In Room' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-800'
                  }`}>
                    #{t.tokenNumber}
                  </span>
                  <div>
                    <div className="font-extrabold text-slate-900 text-base">{t.fullName}</div>
                    <div className="text-xs font-semibold text-slate-500">
                      {t.stage === 'In Room' ? 'In Doctor Room' : `Status: ${t.stage}`}
                    </div>
                  </div>
                </div>

                <span className={`px-3 py-1 font-bold text-xs rounded-lg ${
                  t.stage === 'In Room'
                    ? 'bg-emerald-700 text-white animate-pulse'
                    : t.stage === 'Consulted'
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  {t.stage === 'In Room' ? 'IN ROOM' : t.stage}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}