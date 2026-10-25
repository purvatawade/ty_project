'use client';
import { supabase } from '@/lib/supabase';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getQueue, updateTokenStatus, addToken, QueueItem } from '@/utils/queueStore';

export default function ReceptionConsolePage() {
  const [patients, setPatients] = useState<QueueItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Walk-in Registration Form State
  const [patientName, setPatientName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState('Male');
  const [urgency, setUrgency] = useState('Standard');
  const [showAddModal, setShowAddModal] = useState(false);

  // Load and sync shared database queue
  const reloadQueue = () => {
    const q = getQueue();
    setPatients(q);
  };

  useEffect(() => {
    reloadQueue();
    const interval = setInterval(reloadQueue, 1000);
    window.addEventListener('storage', reloadQueue);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', reloadQueue);
    };
  }, []);

 const handleCheckIn = async (tokenNumber: number) => {
  // 1. Update shared local storage queue
  updateTokenStatus(tokenNumber, 'Checked-In');

  // 2. Update Supabase database so Doctor Desk fetches the checked-in patient immediately
  try {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'Checked-In' })
      .eq('appointment_date', today)
      .eq('token_number', tokenNumber);

    if (error) {
      console.error('Supabase status update error:', error);
    }
  } catch (err) {
    console.error('Error updating status in Supabase:', err);
  }

  reloadQueue();
};

  // 2. Handle Add Walk-in Patient Action
  const handleAddWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || mobile.length !== 10) return;

    addToken(patientName.trim(), mobile, gender, urgency);
    setPatientName('');
    setMobile('');
    setShowAddModal(false);
    reloadQueue();
  };

  // Filtered queue search
  const filteredPatients = patients.filter(
    (p) =>
      p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mobile.includes(searchQuery) ||
      p.tokenNumber.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50/50 px-4 py-8 max-w-6xl mx-auto space-y-6">
      {/* Top Banner matched to dark forest green theme (#0B4632) */}
      <div className="rounded-3xl bg-[#0B4632] text-white p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-emerald-900">
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-900/80 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 border border-emerald-700/50">
            RECEPTION & QUEUE DESK
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
            Reception Console & Patient Check-In
          </h1>
          <p className="text-emerald-200/80 text-sm">
            Dhanwantri Clinic • Live Walk-in Registration & Cabin Queue Controller
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-extrabold text-sm rounded-2xl transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            + New Walk-in Registration
          </button>
          <Link
            href="/doctor"
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl transition-all border border-white/20"
          >
            Doctor Workspace 🩺
          </Link>
        </div>
      </div>

      {/* Main Queue Management Container */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 ring-1 ring-black/5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="relative flex-1 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search token #, patient name, or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl bg-[#F6F4EE] border border-slate-200 px-4 py-2.5 pl-10 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#0B4632] focus:outline-none focus:ring-2 focus:ring-[#0B4632]/20 transition-all"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              Total Queue: <strong className="text-slate-800">{patients.length} Patients</strong>
            </span>
          </div>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">TOKEN #</th>
                <th className="py-3 px-4">PATIENT DETAILS</th>
                <th className="py-3 px-4">URGENCY</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 text-sm font-semibold">
                    No active patients found in queue.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const s = p.status?.toLowerCase() || '';
                  const isCheckedIn =
                    s === 'checked-in' ||
                    s === 'in-cabin' ||
                    s === 'in consultation' ||
                    s === 'in consult';
                  const isCompleted = s === 'completed';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-black text-[#0B4632] text-base font-mono">
                        #{p.tokenNumber < 10 ? `0${p.tokenNumber}` : p.tokenNumber}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800">{p.patientName}</div>
                        <div className="text-xs text-slate-500">
                          {p.gender} • Ph: {p.mobile}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border ${
                            p.urgency === 'Emergency'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : p.urgency === 'Priority'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {p.urgency || 'Standard'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-[11px] font-extrabold px-3 py-1 rounded-full ${
                            isCompleted
                              ? 'bg-slate-200 text-slate-600'
                              : isCheckedIn
                              ? 'bg-emerald-100 text-[#0B4632] border border-emerald-300'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isCheckedIn ? 'Checked-In' : p.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {!isCheckedIn && !isCompleted ? (
                          <button
                            onClick={() => handleCheckIn(p.tokenNumber)}
                            className="px-4 py-2 bg-[#0B4632] hover:bg-emerald-950 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95"
                          >
                            Check-In Patient
                          </button>
                        ) : isCheckedIn ? (
                          <span className="text-xs font-bold text-[#0B4632] flex items-center justify-end gap-1">
                            <span>✓</span> In Cabin / Checked-In
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">
                            Consultation Finished
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Walk-in Registration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-extrabold text-slate-800">New Walk-In Patient</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddWalkIn} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm bg-[#F6F4EE] focus:bg-white focus:border-[#0B4632] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Mobile Number (10 Digits) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="e.g. 9820012345"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm bg-[#F6F4EE] focus:bg-white focus:border-[#0B4632] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm bg-[#F6F4EE] focus:bg-white focus:border-[#0B4632] focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Urgency
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm bg-[#F6F4EE] focus:bg-white focus:border-[#0B4632] focus:outline-none"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Priority">Priority</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-2xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-[#0B4632] hover:bg-emerald-950 rounded-2xl"
                >
                  Issue Token & Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}