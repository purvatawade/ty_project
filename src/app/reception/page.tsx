'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Flame,
  UserPlus,
  RefreshCw,
  Search,
  Phone,
  Calendar
} from 'lucide-react';

interface AppointmentQueueItem {
  id: string;
  token_number: number;
  status: string;
  urgency_level: string;
  appointment_date: string;
  patient_id: string;
  patients: {
    id: string;
    full_name: string;
    phone: string;
    allergies: string;
    gender: string;
  };
}

export default function ReceptionQueuePage() {
  const [queue, setQueue] = useState<AppointmentQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');

  // Quick walk-in modal state
  const [showModal, setShowModal] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinUrgency, setWalkinUrgency] = useState('Normal');
  const [walkinSubmitting, setWalkinSubmitting] = useState(false);

  // Fetch daily queue
  const fetchQueue = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        token_number,
        status,
        urgency_level,
        appointment_date,
        patient_id,
        patients (
          id,
          full_name,
          phone,
          allergies,
          gender
        )
      `)
      .eq('appointment_date', today)
      .order('token_number', { ascending: true });

    if (!error && data) {
      // Sort with triage priority: Emergency first, then Priority, then Normal
      const urgencyRank: Record<string, number> = { Emergency: 1, Priority: 2, Normal: 3 };
      const sorted = [...(data as any[])].sort((a, b) => {
        // If one is already completed, push to end
        if (a.status === 'Completed' && b.status !== 'Completed') return 1;
        if (b.status === 'Completed' && a.status !== 'Completed') return -1;

        // Priority weight
        const rankDiff = (urgencyRank[a.urgency_level] || 3) - (urgencyRank[b.urgency_level] || 3);
        if (rankDiff !== 0) return rankDiff;

        // Then by token number
        return a.token_number - b.token_number;
      });

      setQueue(sorted);
    }
    setLoading(false);
  };

  // Realtime subscription setup
  useEffect(() => {
    fetchQueue();

    const channel = supabase
      .channel('reception_queue_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update status (e.g. Pending -> Checked-In)
  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);

    if (!error) fetchQueue();
  };

  // Urgency elevation
  const handleUrgencyChange = async (appointmentId: string, newUrgency: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ urgency_level: newUrgency })
      .eq('id', appointmentId);

    if (!error) fetchQueue();
  };

  // Submit quick walk-in patient
  const handleAddWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalkinSubmitting(true);

    try {
      let patientId: string;
      const { data: existing } = await supabase
        .from('patients')
        .select('id')
        .eq('phone', walkinPhone.trim())
        .maybeSingle();

      if (existing) {
        patientId = existing.id;
      } else {
        const { data: created, error: pError } = await supabase
          .from('patients')
          .insert([
            {
              full_name: walkinName.trim(),
              phone: walkinPhone.trim(),
              date_of_birth: '2000-01-01',
              gender: 'Other',
              allergies: 'None',
            },
          ])
          .select('id')
          .single();

        if (pError) throw pError;
        patientId = created.id;
      }

      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today);

      const nextToken = (count || 0) + 1;

      const { error: apptError } = await supabase.from('appointments').insert([
        {
          patient_id: patientId,
          appointment_date: today,
          token_number: nextToken,
          urgency_level: walkinUrgency,
          status: 'Checked-In', // Walk-ins arrive physically, so directly Checked-In
        },
      ]);

      if (apptError) throw apptError;

      setShowModal(false);
      setWalkinName('');
      setWalkinPhone('');
      setWalkinUrgency('Normal');
      fetchQueue();
    } catch (err: any) {
      alert(err.message || 'Error creating walk-in token');
    } finally {
      setWalkinSubmitting(false);
    }
  };

  const filteredQueue = queue.filter(
    (item) =>
      item.patients?.full_name?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.patients?.phone?.includes(filterText) ||
      String(item.token_number).includes(filterText)
  );

  const stats = {
    total: queue.length,
    checkedIn: queue.filter((i) => i.status === 'Checked-In').length,
    waiting: queue.filter((i) => i.status === 'Pending').length,
    completed: queue.filter((i) => i.status === 'Completed').length,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER & TOP STATS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Reception Triage & Queue Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Dhanwantri Clinic • Live Outpatient Management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchQueue()}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition shadow-sm"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Walk-In</span>
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Booked</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Arrival</span>
          <p className="text-2xl font-bold text-amber-900 mt-1">{stats.waiting}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Checked-In (Waiting)</span>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.checkedIn}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
          <p className="text-2xl font-bold text-slate-700 mt-1">{stats.completed}</p>
        </div>
      </div>

      {/* FILTER SEARCH BAR */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Filter today's queue by patient name, phone number, or token..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition shadow-sm"
        />
      </div>

      {/* QUEUE TABLE / CARDS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && queue.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading today's queue...</div>
        ) : filteredQueue.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">No appointments found matching filter.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredQueue.map((item) => {
              const isEmergency = item.urgency_level === 'Emergency';
              const isPriority = item.urgency_level === 'Priority';

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${isEmergency ? 'bg-rose-50/40' : isPriority ? 'bg-amber-50/30' : 'hover:bg-slate-50/60'
                    }`}
                >
                  {/* TOKEN & PATIENT INFO */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${isEmergency
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                          : isPriority
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                    >
                      #{String(item.token_number).padStart(2, '0')}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-base">
                          {item.patients?.full_name || 'Walk-In Patient'}
                        </span>
                        {isEmergency && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-700 border border-rose-200">
                            <Flame className="w-3 h-3 text-rose-600 fill-rose-600" />
                            Emergency
                          </span>
                        )}
                        {isPriority && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Priority
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {item.patients?.phone}
                        </span>
                        <span>•</span>
                        <span>Allergies: <b className="text-slate-700">{item.patients?.allergies || 'None'}</b></span>
                      </div>
                    </div>
                  </div>

                  {/* CONTROLS (STATUS & TRIAGE URGENCY) */}
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                    {/* Urgency Selector */}
                    <select
                      value={item.urgency_level}
                      onChange={(e) => handleUrgencyChange(item.id, e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 text-xs font-medium rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Priority">Priority</option>
                      <option value="Emergency">Emergency</option>
                    </select>

                    {/* Status Toggle Buttons */}
                    {item.status === 'Pending' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'Checked-In')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition shadow-sm cursor-pointer"
                      >
                        Check-In Patient
                      </button>
                    )}

                    {item.status === 'Checked-In' && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200">
                        In Waiting Room
                      </span>
                    )}

                    {item.status === 'In-Consultation' && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 animate-pulse">
                        With Doctor
                      </span>
                    )}

                    {item.status === 'Completed' && (
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                        Consultation Done
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QUICK WALK-IN REGISTRATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              Direct Walk-In Intake
            </h2>
            <p className="text-xs text-slate-500">
              Generate an immediate queue token for an arrived walk-in patient.
            </p>

            <form onSubmit={handleAddWalkin} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Phone Number *</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Triage Urgency</label>
                <select
                  value={walkinUrgency}
                  onChange={(e) => setWalkinUrgency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                >
                  <option value="Normal">Normal Urgency</option>
                  <option value="Priority">Priority (Moderate)</option>
                  <option value="Emergency">Emergency (Immediate)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={walkinSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-50"
                >
                  {walkinSubmitting ? 'Creating Token...' : 'Issue Token'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}