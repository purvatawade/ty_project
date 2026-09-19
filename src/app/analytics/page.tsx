'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Calendar,
  ArrowLeft,
  RefreshCw,
  PieChart,
  Stethoscope
} from 'lucide-react';

interface AnalyticsData {
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  checkedInAppointments: number;
  normalUrgencyCount: number;
  priorityUrgencyCount: number;
  emergencyUrgencyCount: number;
  totalPrescriptions: number;
}

export default function AnalyticsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AnalyticsData>({
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    checkedInAppointments: 0,
    normalUrgencyCount: 0,
    priorityUrgencyCount: 0,
    emergencyUrgencyCount: 0,
    totalPrescriptions: 0,
  });

  const fetchAnalytics = async () => {
    setLoading(true);

    try {
      // 1. Fetch Appointments Data
      const { data: appointments, error: appError } = await supabase
        .from('appointments')
        .select('*');

      // 2. Fetch Prescriptions Data
      const { data: prescriptions, error: rxError } = await supabase
        .from('prescriptions')
        .select('id');

      if (!appError && appointments) {
        const total = appointments.length;
        const completed = appointments.filter(a => a.status === 'Completed').length;
        const pending = appointments.filter(a => a.status === 'Pending').length;
        const checkedIn = appointments.filter(a => a.status === 'Checked-In' || a.status === 'In-Consultation').length;

        const normal = appointments.filter(a => a.urgency_level === 'Normal').length;
        const priority = appointments.filter(a => a.urgency_level === 'Priority').length;
        const emergency = appointments.filter(a => a.urgency_level === 'Emergency').length;

        setMetrics({
          totalAppointments: total,
          completedAppointments: completed,
          pendingAppointments: pending,
          checkedInAppointments: checkedIn,
          normalUrgencyCount: normal,
          priorityUrgencyCount: priority,
          emergencyUrgencyCount: emergency,
          totalPrescriptions: prescriptions?.length || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const completionRate = metrics.totalAppointments > 0
    ? Math.round((metrics.completedAppointments / metrics.totalAppointments) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 font-sans">
      {/* HEADER STRIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0B4632] flex items-center justify-center text-white shadow-md">
            <BarChart3 className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">OPD & Triage Analytics Dashboard</h1>
            <p className="text-xs text-stone-500">Dhanwantri Clinic • Outpatient Insights & Throughput</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0B4632]' : ''}`} />
          </button>

          <Link
            href="/reception"
            className="px-4 py-2.5 bg-[#0B4632] hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Reception Desk</span>
          </Link>
        </div>
      </div>

      {/* KEY PERFORMANCE INDICATORS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Tokens</span>
            <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-stone-900">{metrics.totalAppointments}</span>
            <p className="text-[11px] text-stone-500 mt-1">Total appointments booked</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-emerald-200/90 shadow-xs space-y-3 bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Completion Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-emerald-900">{completionRate}%</span>
            <p className="text-[11px] text-emerald-700 mt-1">{metrics.completedAppointments} consultations done</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-amber-200/90 shadow-xs space-y-3 bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Active Queue</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-amber-900">{metrics.checkedInAppointments}</span>
            <p className="text-[11px] text-amber-700 mt-1">Currently in waiting area</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Prescriptions Issued</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-stone-900">{metrics.totalPrescriptions}</span>
            <p className="text-[11px] text-stone-500 mt-1">Digital Rx slips generated</p>
          </div>
        </div>
      </div>

      {/* DETAILED BREAKDOWN CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TRIAGE URGENCY DISTRIBUTION */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#0B4632]" />
              <h2 className="text-base font-bold text-stone-900">Triage Urgency Breakdown</h2>
            </div>
            <span className="text-xs font-bold text-stone-400">Total: {metrics.totalAppointments}</span>
          </div>

          <div className="space-y-4">
            {/* Normal */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-stone-700">Normal Priority</span>
                <span className="text-stone-900">{metrics.normalUrgencyCount} Patients</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-700 transition-all duration-500"
                  style={{ width: metrics.totalAppointments > 0 ? `${(metrics.normalUrgencyCount / metrics.totalAppointments) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-700">Priority Triage</span>
                <span className="text-amber-900">{metrics.priorityUrgencyCount} Patients</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: metrics.totalAppointments > 0 ? `${(metrics.priorityUrgencyCount / metrics.totalAppointments) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* Emergency */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-700">Emergency Cases</span>
                <span className="text-rose-900">{metrics.emergencyUrgencyCount} Patients</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-600 transition-all duration-500"
                  style={{ width: metrics.totalAppointments > 0 ? `${(metrics.emergencyUrgencyCount / metrics.totalAppointments) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* WORKFLOW STATUS SUMMARY */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#0B4632]" />
              <h2 className="text-base font-bold text-stone-900">OPD Queue Stage Distribution</h2>
            </div>
            <span className="text-xs font-bold text-stone-400">Real-time Sync</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#F6F4EE] border border-stone-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-stone-500">Pending Arrival</span>
              <span className="text-2xl font-black text-stone-900 block">{metrics.pendingAppointments}</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-800">Checked In / Waiting</span>
              <span className="text-2xl font-black text-emerald-900 block">{metrics.checkedInAppointments}</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-100/60 border border-emerald-300 space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-900">Consultation Done</span>
              <span className="text-2xl font-black text-emerald-950 block">{metrics.completedAppointments}</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-800">Prescriptions Issued</span>
              <span className="text-2xl font-black text-amber-900 block">{metrics.totalPrescriptions}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}