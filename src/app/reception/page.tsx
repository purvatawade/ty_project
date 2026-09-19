'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  UserPlus, 
  Activity, 
  ShieldAlert
} from 'lucide-react';

interface QueueAppointment {
  id: string;
  token_number: number;
  urgency_level: 'Normal' | 'Priority' | 'Emergency';
  status: 'Pending' | 'Checked-In' | 'In-Consultation' | 'Completed' | 'Cancelled';
  symptoms?: string;
  appointment_date: string;
  patients: {
    id: string;
    full_name: string;
    phone: string;
    gender: string;
    allergies?: string;
  };
}

export default function ReceptionConsolePage() {
  const [appointments, setAppointments] = useState<QueueAppointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');

  // Fetch today's queue
  const fetchTodayQueue = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('appointments')
      .select('*, patients(*)')
      .eq('appointment_date', today)
      .order('token_number', { ascending: true });

    if (!error && data) {
      setAppointments(data as unknown as QueueAppointment[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTodayQueue();

    // Realtime subscription for reception queue
    const channel = supabase
      .channel('reception_realtime_queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchTodayQueue();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', id);

    fetchTodayQueue();
  };

  // Step 17 Analytics Metrics Calculations
  const totalBooked = appointments.length;
  const pendingArrival = appointments.filter(a => a.status === 'Pending').length;
  const waitingRoom = appointments.filter(a => a.status === 'Checked-In' || a.status === 'In-Consultation').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;
  const emergencyCount = appointments.filter(a => a.urgency_level === 'Emergency' && a.status !== 'Completed').length;

  // Filtered Queue List
  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = 
      app.patients?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.patients?.phone.includes(searchQuery) ||
      String(app.token_number).includes(searchQuery);

    const matchesUrgency = filterUrgency === 'ALL' || app.urgency_level === filterUrgency;

    return matchesSearch && matchesUrgency;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* HEADER STRIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0B4632] flex items-center justify-center text-white shadow-md">
            <Users className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Reception Triage & Queue Console</h1>
            <p className="text-xs text-stone-500">Dhanwantri Clinic • Live Outpatient Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTodayQueue}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition cursor-pointer"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0B4632]' : ''}`} />
          </button>

          <Link
            href="/"
            className="px-4 py-2.5 bg-[#0B4632] hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 text-emerald-300" />
            <span>Add Walk-In</span>
          </Link>
        </div>
      </div>

      {/* STEP 17: RECEPTION ANALYTICS & RUSH METRICS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider block">Total Booked</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-stone-900">{totalBooked}</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/90 shadow-xs space-y-1 bg-amber-50/20">
          <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider block">Pending Arrival</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-700">{pendingArrival}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/90 shadow-xs space-y-1 bg-emerald-50/20">
          <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider block">Checked-In (Waiting)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-800">{waitingRoom}</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider block">Completed</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-stone-900">{completedCount}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200/90 shadow-xs space-y-1 bg-rose-50/20 col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold uppercase text-rose-600 tracking-wider block">Emergency Rush</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-700">{emergencyCount}</span>
            <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter today's queue by patient name, phone, or token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F6F4EE] border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4632]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0">Filter Urgency:</span>
          {['ALL', 'Normal', 'Priority', 'Emergency'].map((urgency) => (
            <button
              key={urgency}
              onClick={() => setFilterUrgency(urgency)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 ${
                filterUrgency === urgency
                  ? 'bg-[#0B4632] text-white shadow-xs'
                  : 'bg-[#F6F4EE] text-stone-600 hover:bg-stone-200'
              }`}
            >
              {urgency}
            </button>
          ))}
        </div>
      </div>

      {/* QUEUE CARDS LIST */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-2">
            <Users className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-xs font-bold text-stone-500">No matching tokens found in today's OPD queue.</p>
          </div>
        ) : (
          filteredAppointments.map((app) => (
            <div
              key={app.id}
              className={`bg-white p-5 rounded-2xl border transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                app.urgency_level === 'Emergency'
                  ? 'border-rose-300 bg-rose-50/10'
                  : app.status === 'Checked-In'
                  ? 'border-emerald-300 bg-emerald-50/10'
                  : 'border-stone-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-lg ${
                  app.urgency_level === 'Emergency'
                    ? 'bg-rose-600 text-white shadow-md'
                    : app.urgency_level === 'Priority'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-[#0B4632] text-white'
                }`}>
                  #{String(app.token_number).padStart(2, '0')}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-stone-900">{app.patients?.full_name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                      app.urgency_level === 'Emergency'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : app.urgency_level === 'Priority'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {app.urgency_level}
                    </span>
                  </div>

                  <div className="text-xs text-stone-500 flex flex-wrap items-center gap-3">
                    <span>Phone: {app.patients?.phone}</span>
                    <span>•</span>
                    <span>Gender: {app.patients?.gender}</span>
                    {app.patients?.allergies && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-rose-700">Allergies: {app.patients.allergies}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* STATUS ACTION TOGGLES */}
              <div className="flex items-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  className="px-3 py-2 bg-[#F6F4EE] border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none cursor-pointer"
                >
                  <option value="Pending">Pending Arrival</option>
                  <option value="Checked-In">Checked-In (Waiting)</option>
                  <option value="In-Consultation">In-Consultation</option>
                  <option value="Completed">Consultation Done</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                {app.status === 'Pending' && (
                  <button
                    onClick={() => handleStatusChange(app.id, 'Checked-In')}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Check-In Patient
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}