'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function PatientQueuePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [searchToken, setSearchToken] = useState('15');
  const [patientToken, setPatientToken] = useState<number | null>(15);

  // REDIRECT DOCTOR/ADMIN AWAY FROM PATIENT-ONLY PAGE
  useEffect(() => {
    if (user?.role === 'admin') {
      router.push('/doctor-workspace');
    }
  }, [user, router]);

  const currentCallingToken = 12;
  const estimatedTimePerPatient = 10;

  const tokensAhead = patientToken ? Math.max(0, patientToken - currentCallingToken) : 0;
  const estimatedWaitMinutes = tokensAhead * estimatedTimePerPatient;

  const handleTrackToken = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(searchToken.replace(/\D/g, ''), 10);
    if (!isNaN(num)) {
      setPatientToken(num);
    }
  };

  if (user?.role === 'admin') {
    return null; // Render nothing while redirecting
  }

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
                Enter Your OPD Token Number or Registered Phone
              </label>
              <input
                type="text"
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                placeholder="e.g. 15 or 9820098200"
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

        {/* LIVE TURN DASHBOARD */}
        {patientToken && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CURRENT CALLING TOKEN */}
            <div className="bg-emerald-50/80 border-2 border-emerald-300 p-8 rounded-3xl shadow-sm text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-800">
                NOW IN CABIN
              </span>
              <div className="text-5xl font-black text-emerald-900 pt-2">
                #{currentCallingToken}
              </div>
              <p className="text-xs font-bold text-emerald-700">Dr. Sarika B. Singh</p>
            </div>

            {/* PATIENT'S TOKEN */}
            <div className="bg-white border-2 border-slate-200 p-8 rounded-3xl shadow-sm text-center space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                YOUR TOKEN PASS
              </span>
              <div className="text-5xl font-black text-slate-900 pt-2">
                #{patientToken}
              </div>
              <p className="text-xs font-bold text-slate-600">Rahul Sharma</p>
            </div>

            {/* ESTIMATED WAIT TIME */}
            <div className="bg-amber-50/80 border-2 border-amber-300 p-8 rounded-3xl shadow-sm text-center space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-900">
                ESTIMATED WAIT TIME
              </span>
              <div className="text-4xl font-black text-amber-950 pt-2">
                ~{estimatedWaitMinutes} Mins
              </div>
              <p className="text-xs font-bold text-amber-800">
                {tokensAhead} Patients ahead of you
              </p>
            </div>

          </div>
        )}

        {/* VISUAL QUEUE PROGRESS CARD */}
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
            
            <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-black flex items-center justify-center text-sm">
                  #12
                </span>
                <div>
                  <div className="font-extrabold text-slate-900 text-base">Current Patient In Room</div>
                  <div className="text-xs font-semibold text-emerald-800">Consultation in progress</div>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-700 text-white font-black text-xs rounded-lg animate-pulse">
                IN ROOM
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-extrabold flex items-center justify-center text-sm">
                  #13
                </span>
                <div>
                  <div className="font-extrabold text-slate-900 text-base">Next Turn</div>
                  <div className="text-xs font-semibold text-slate-500">Waiting in Reception</div>
                </div>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-lg">
                1st Ahead
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 font-extrabold flex items-center justify-center text-sm">
                  #14
                </span>
                <div>
                  <div className="font-extrabold text-slate-900 text-base">Upcoming Token</div>
                  <div className="text-xs font-semibold text-slate-500">Waiting in Reception</div>
                </div>
              </div>
              <span className="px-3 py-1 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg">
                2nd Ahead
              </span>
            </div>

            <div className="p-4 bg-[#FFFDF9] border-2 border-emerald-400 rounded-2xl flex justify-between items-center shadow-md">
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-emerald-800 text-white font-black flex items-center justify-center text-sm">
                  #15
                </span>
                <div>
                  <div className="font-black text-slate-900 text-base">Your Turn Pass (Rahul Sharma)</div>
                  <div className="text-xs font-bold text-emerald-800">You are 3rd in line</div>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-800 text-white font-black text-xs rounded-lg">
                YOUR TURN NEXT
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}