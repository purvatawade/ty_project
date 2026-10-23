'use client';

import React from 'react';
import Link from 'next/link';
import { useQueue } from '@/lib/QueueContext';

export default function AnalyticsPage() {
  const { tokens, resetQueue } = useQueue();

  const totalTokens = tokens.length;
  const consultedCount = tokens.filter((t) => t.stage === 'Consulted').length;
  const activeQueueCount = tokens.filter((t) => t.stage === 'Waiting' || t.stage === 'In Room').length;
  const completionRate = totalTokens > 0 ? Math.round((consultedCount / totalTokens) * 100) : 0;

  const normalCount = tokens.filter((t) => t.triageLevel === 'Normal').length;
  const priorityCount = tokens.filter((t) => t.triageLevel === 'Priority').length;
  const emergencyCount = tokens.filter((t) => t.triageLevel === 'Emergency').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER CARD */}
        <div className="bg-[#FFFDF9] border-2 border-emerald-200/80 rounded-3xl p-8 shadow-xl shadow-emerald-950/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-extrabold text-3xl shrink-0">
              📊
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                OPD &amp; Triage Analytics Dashboard
              </h1>
              <p className="text-slate-600 font-semibold text-base mt-1">
                Dhanwantri Clinic • Real-time Outpatient Insights &amp; Live Throughput
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetQueue}
              className="px-4 py-3 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-sm text-slate-700 font-bold text-xs"
              title="Reset Queue to Default"
            >
              🔄 Reset Demo Queue
            </button>
            <Link
              href="/reception"
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-black px-6 py-3.5 rounded-xl transition shadow-md flex items-center gap-2 text-sm tracking-wide"
            >
              <span>← Reception Desk</span>
            </Link>
          </div>
        </div>

        {/* TOP METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Total Tokens
              </span>
              <span className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-lg font-bold">
                👥
              </span>
            </div>
            <div className="text-4xl font-black text-slate-900 tracking-tight pt-1">{totalTokens}</div>
            <p className="text-xs font-bold text-slate-500">Total appointments booked today</p>
          </div>

          <div className="bg-emerald-50/60 border-2 border-emerald-200 p-6 rounded-3xl shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                Completion Rate
              </span>
              <span className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 text-lg font-bold">
                ✓
              </span>
            </div>
            <div className="text-4xl font-black text-emerald-900 tracking-tight pt-1">{completionRate}%</div>
            <p className="text-xs font-bold text-emerald-700">{consultedCount} consultations completed</p>
          </div>

          <div className="bg-amber-50/60 border-2 border-amber-200 p-6 rounded-3xl shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                Active Queue
              </span>
              <span className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 text-lg font-bold">
                ⏱️
              </span>
            </div>
            <div className="text-4xl font-black text-amber-900 tracking-tight pt-1">{activeQueueCount}</div>
            <p className="text-xs font-bold text-amber-800">Currently in waiting/consultation</p>
          </div>

          <div className="bg-sky-50/60 border-2 border-sky-200 p-6 rounded-3xl shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider text-sky-900">
                Prescriptions Issued
              </span>
              <span className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700 text-lg font-bold">
                💊
              </span>
            </div>
            <div className="text-4xl font-black text-sky-900 tracking-tight pt-1">{consultedCount}</div>
            <p className="text-xs font-bold text-sky-800">Digital Rx slips generated</p>
          </div>
        </div>

        {/* DETAILED DATA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border-2 border-slate-200 p-8 rounded-3xl shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>⏱️</span>
                <span>Triage Urgency Breakdown</span>
              </h2>
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Total: {totalTokens}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="font-extrabold text-slate-800 text-base">Normal Priority</span>
                <span className="font-black text-slate-900 text-base">{normalCount} Patients</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <span className="font-extrabold text-amber-900 text-base">Priority Triage</span>
                <span className="font-black text-amber-950 text-base">{priorityCount} Patients</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                <span className="font-extrabold text-rose-900 text-base">Emergency Cases</span>
                <span className="font-black text-rose-950 text-base">{emergencyCount} Patients</span>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 p-8 rounded-3xl shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>📈</span>
                <span>OPD Queue Stage Distribution</span>
              </h2>
              <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Real-time Sync
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl text-center space-y-1">
                <div className="text-xs font-black text-amber-900 uppercase tracking-wider">
                  Waiting / Checked In
                </div>
                <div className="text-3xl font-black text-amber-950">
                  {tokens.filter((t) => t.stage === 'Waiting').length}
                </div>
              </div>

              <div className="p-5 bg-sky-50/80 border border-sky-200 rounded-2xl text-center space-y-1">
                <div className="text-xs font-black text-sky-900 uppercase tracking-wider">
                  In Room
                </div>
                <div className="text-3xl font-black text-sky-950">
                  {tokens.filter((t) => t.stage === 'In Room').length}
                </div>
              </div>

              <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-center space-y-1">
                <div className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                  Consultation Done
                </div>
                <div className="text-3xl font-black text-emerald-950">{consultedCount}</div>
              </div>

              <div className="p-5 bg-purple-50/80 border border-purple-200 rounded-2xl text-center space-y-1">
                <div className="text-xs font-black text-purple-900 uppercase tracking-wider">
                  Prescriptions Issued
                </div>
                <div className="text-3xl font-black text-purple-950">{consultedCount}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}