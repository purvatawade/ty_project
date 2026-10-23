'use client';

import React from 'react';

export default function DoctorDeskPage() {
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
              Welcome, Dr. Sarika B. Singh. Manage live consultations, prescription dictations, and queue tokens.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-sm">
              + Call Next Token
            </button>
          </div>
        </div>

        {/* DASHBOARD STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase">Total OPD Patients Today</div>
            <div className="text-3xl font-black text-slate-900 mt-2">18</div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="text-xs font-bold text-amber-600 uppercase">Waiting in Queue</div>
            <div className="text-3xl font-black text-amber-700 mt-2">04</div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="text-xs font-bold text-emerald-600 uppercase">Completed Consultations</div>
            <div className="text-3xl font-black text-emerald-700 mt-2">14</div>
          </div>
        </div>

        {/* MAIN DESK & SKELETON CONTENT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 COLS: ACTIVE CONSULTATION CARD */}
          <div className="lg:col-span-2 bg-[#FFFDF9] border-2 border-emerald-200 p-8 rounded-3xl shadow-lg space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <h2 className="text-xl font-extrabold text-slate-900">
                Active Consultation Room
              </h2>
              <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg">
                CURRENT TOKEN: #12
              </span>
            </div>

            {/* ACTIVE PATIENT DATA */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-black text-slate-900">Rahul Sharma</div>
                  <div className="text-xs font-semibold text-slate-500">Male • 28 Yrs • Phone: +91 9820098200</div>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded">
                  Standard OPD
                </span>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-700 uppercase mb-1">Chief Symptoms</div>
                <div className="p-3 bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl">
                  Acute fever since 2 days, mild sore throat, headache.
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-700 uppercase mb-1">Voice Dictation Notes (Speech API)</div>
                <textarea
                  rows={4}
                  placeholder="Click mic to record medical notes or type prescription details..."
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-semibold p-4 rounded-xl focus:outline-none focus:border-emerald-600 text-sm transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-xl text-sm transition">
                  Hold Token
                </button>
                <button className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl text-sm transition shadow-sm">
                  Complete &amp; Issue Rx
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COL: QUEUE LIST */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Upcoming Queue
            </h3>

            {/* QUEUE ITEMS */}
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900 text-sm">#13 • Priya Patel</div>
                  <div className="text-xs text-slate-500 font-medium">Age 34 • Priority Triage</div>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">Next</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900 text-sm">#14 • Amit Verma</div>
                  <div className="text-xs text-slate-500 font-medium">Age 52 • Normal</div>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-1 rounded">Waiting</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900 text-sm">#15 • Sneha Gupta</div>
                  <div className="text-xs text-slate-500 font-medium">Age 22 • Normal</div>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-1 rounded">Waiting</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}