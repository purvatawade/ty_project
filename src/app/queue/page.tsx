'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getQueue, clearAllQueue, QueueItem } from '@/utils/queueStore';
import { supabase } from '@/lib/supabase';

export default function PatientQueueTrackerPage() {
  const [tokenInput, setTokenInput] = useState('');
  const [trackedTokenNumber, setTrackedTokenNumber] = useState<number | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);

    const loadAndSyncQueue = async () => {
      // 1. Fetch live appointments from Supabase for today
      const today = new Date().toISOString().split('T')[0];
      const { data: dbAppointments } = await supabase
        .from('appointments')
        .select(`
          id,
          token_number,
          status,
          urgency_level,
          created_at,
          patients (
            full_name,
            phone,
            gender
          )
        `)
        .eq('appointment_date', today)
        .order('token_number', { ascending: true });

      if (dbAppointments && dbAppointments.length > 0) {
        const mappedFromDb: QueueItem[] = dbAppointments.map((app: any) => ({
          id: app.id || String(app.token_number),
          tokenNumber: app.token_number,
          patientName: app.patients?.full_name || 'Patient',
          mobile: app.patients?.phone || '',
          gender: app.patients?.gender || 'Other',
          urgency: app.urgency_level || 'Standard',
          status: app.status === 'Pending' ? 'Waiting' : (app.status || 'Waiting'),
          createdAt: new Date(app.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));

        // Merge Supabase database records into shared local store
        localStorage.setItem('dh_patients', JSON.stringify(mappedFromDb));
        setQueue(mappedFromDb);
      } else {
        setQueue(getQueue());
      }
    };

    loadAndSyncQueue();
    const interval = setInterval(loadAndSyncQueue, 2000);
    window.addEventListener('storage', loadAndSyncQueue);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadAndSyncQueue);
    };
  }, []);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(tokenInput.replace('#', '').trim(), 10);
    if (!isNaN(num)) {
      setTrackedTokenNumber(num);
    }
  };

  const handleResetData = () => {
    clearAllQueue();
    setQueue([]);
    setTrackedTokenNumber(null);
    setTokenInput('');
  };

  // ACTIVE CABIN LOGIC
  let currentInCabin = queue.find((item) => {
    const s = item.status?.toLowerCase() || '';
    return (
      s === 'checked-in' ||
      s === 'in-cabin' ||
      s === 'in consultation' ||
      s === 'in consult' ||
      s === 'consulting'
    );
  });

  if (!currentInCabin && queue.length > 0) {
    currentInCabin = queue.find((item) => item.status?.toLowerCase() !== 'completed');
  }

  const trackedItem =
    trackedTokenNumber !== null
      ? queue.find((item) => item.tokenNumber === trackedTokenNumber)
      : null;

  const activeCabinTokenNum = currentInCabin ? currentInCabin.tokenNumber : 0;

  const patientsAheadCount =
    trackedTokenNumber !== null
      ? queue.filter((item) => {
          const isNotCompleted = item.status?.toLowerCase() !== 'completed';
          const isBeforeTracked = item.tokenNumber < trackedTokenNumber;
          const isNotActiveCabin = item.tokenNumber !== activeCabinTokenNum;
          return isNotCompleted && isBeforeTracked && isNotActiveCabin;
        }).length
      : 0;

  const estimatedWaitMins =
    (patientsAheadCount + (currentInCabin && trackedTokenNumber !== activeCabinTokenNum ? 1 : 0)) * 10;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50/50 px-4 py-8 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-[#005f42] text-white p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-block px-3 py-1 bg-emerald-700/60 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-emerald-100 border border-emerald-500/30">
            LIVE STATUS
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Patient Turn & Live Queue Tracker
          </h1>
          <p className="text-emerald-100/80 text-sm">
            Dhanwantri Clinic • Total Registered Appointments: {queue.length}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {userRole === 'doctor' && (
            <button
              onClick={handleResetData}
              className="px-4 py-3 bg-red-600/80 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-md"
            >
              Reset Fresh Queue
            </button>
          )}
          <Link
            href="/"
            className="px-5 py-3 bg-emerald-400 text-slate-900 font-extrabold text-sm rounded-xl hover:bg-emerald-300 transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            + Book New Appointment
          </Link>
        </div>
      </div>

      {/* Token Search Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-200/60 ring-1 ring-black/5">
        <form onSubmit={handleTrack} className="space-y-3">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
            ENTER YOUR TOKEN NUMBER
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="e.g. 8"
              className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-lg font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#005f42] focus:outline-none focus:ring-2 focus:ring-[#005f42]/20 transition-all"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-[#005f42] text-white font-extrabold text-sm rounded-xl hover:bg-[#004a33] transition-all shadow-md active:scale-95"
            >
              Track Live Turn
            </button>
          </div>
        </form>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-emerald-200/60 ring-1 ring-black/5 flex flex-col items-center justify-center text-center space-y-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
            NOW IN CABIN
          </span>
          <div className="text-3xl md:text-4xl font-extrabold text-[#005f42] py-2">
            {currentInCabin
              ? `Token #${currentInCabin.tokenNumber < 10 ? `0${currentInCabin.tokenNumber}` : currentInCabin.tokenNumber}`
              : 'Vacant'}
          </div>
          <p className="text-xs font-semibold text-slate-500">
            {currentInCabin ? currentInCabin.patientName : 'Dr. Sarika B. Singh'}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 ring-1 ring-black/5 flex flex-col items-center justify-center text-center space-y-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
            YOUR TOKEN PASS
          </span>
          <div className="text-3xl md:text-4xl font-extrabold text-slate-800 py-2">
            {trackedTokenNumber
              ? `#${trackedTokenNumber < 10 ? `0${trackedTokenNumber}` : trackedTokenNumber}`
              : '--'}
          </div>
          <p className="text-xs font-semibold text-slate-500">
            {trackedItem ? trackedItem.patientName : 'No Active Booking Found'}
          </p>
        </div>

        <div className="rounded-2xl bg-amber-50/50 p-6 shadow-sm border border-amber-200 ring-1 ring-black/5 flex flex-col items-center justify-center text-center space-y-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
            ESTIMATED WAIT TIME
          </span>
          <div className="text-3xl md:text-4xl font-extrabold text-amber-900 py-2">
            ~{estimatedWaitMins} Mins
          </div>
          <p className="text-xs font-bold text-amber-800">
            {patientsAheadCount} Patients ahead of you
          </p>
        </div>
      </div>

      {/* Live Queue Visual Flow (Up to 10 view limit, then scrollable) */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 ring-1 ring-black/5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-800">📊 Live Queue Records Flow</h2>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200">
              Showing All {queue.length} Records
            </span>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Real-time Syncing
          </span>
        </div>

        {queue.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm font-bold text-slate-600">No active patients in queue</p>
          </div>
        ) : (
          <div className="max-h-[380px] overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
              {queue.map((item) => {
                const isTracked = item.tokenNumber === trackedTokenNumber;
                const isActiveCabin = currentInCabin && currentInCabin.tokenNumber === item.tokenNumber;
                const s = item.status?.toLowerCase() || '';

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isTracked
                        ? 'bg-emerald-50/90 border-[#005f42] ring-2 ring-[#005f42]/20 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-extrabold text-slate-800 text-sm">
                        Token #{item.tokenNumber < 10 ? `0${item.tokenNumber}` : item.tokenNumber}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isActiveCabin
                            ? 'bg-emerald-700 text-white'
                            : s === 'completed'
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isActiveCabin ? 'In Cabin' : item.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 truncate">
                      {item.patientName}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}