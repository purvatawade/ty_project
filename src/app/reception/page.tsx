'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  Stethoscope, 
  BarChart3, 
  UserCheck
} from 'lucide-react';

interface PatientQueueItem {
  id: string;
  token_number: number;
  urgency_level: 'Normal' | 'Priority' | 'Emergency';
  status: 'Pending' | 'Checked-In' | 'In-Consultation' | 'Completed';
  patients: {
    full_name: string;
    phone: string;
    gender: string;
    date_of_birth: string;
  };
}

export default function ReceptionConsolePage() {
  const [queue, setQueue] = useState<PatientQueueItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('appointments')
      .select('*, patients(*)')
      .eq('appointment_date', today)
      .order('token_number', { ascending: true });

    if (!error && data) {
      setQueue(data as unknown as PatientQueueItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQueue();

    const channel = supabase
      .channel('reception_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchQueue();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', id);

    fetchQueue();
  };

  const filteredQueue = queue.filter(item =>
    item.patients?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.patients?.phone.includes(searchQuery) ||
    String(item.token_number).includes(searchQuery)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 font-sans">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0B4632] flex items-center justify-center text-white shadow-md">
            <Users className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Reception Desk & Queue Control</h1>
            <p className="text-xs text-stone-500">Dhanwantri Clinic • Live Walk-in Management</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/doctor"
            className="px-3.5 py-2 bg-[#0B4632] hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <Stethoscope className="w-3.5 h-3.5 text-amber-300" />
            <span>Doctor Workspace</span>
          </Link>

          <Link
            href="/analytics"
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#0B4632]" />
            <span>Analytics</span>
          </Link>
        </div>
      </div>

      {/* QUEUE CONTROL TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search token #, patient name, or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F6F4EE] border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#0B4632]"
            />
          </div>

          <span className="text-xs font-bold text-stone-500">
            Total Queue: <strong className="text-stone-900">{queue.length} Patients</strong>
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-stone-500 animate-pulse">
            Syncing Live OPD Queue...
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="py-12 text-center text-stone-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 opacity-50" />
            <p className="text-xs font-semibold">No patients found in today's queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-[11px] font-bold uppercase text-stone-500">
                  <th className="py-3 px-2">Token #</th>
                  <th className="py-3 px-2">Patient Details</th>
                  <th className="py-3 px-2">Urgency</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {filteredQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3 px-2 font-black text-base text-[#0B4632] font-mono">
                      #{String(item.token_number).padStart(2, '0')}
                    </td>

                    <td className="py-3 px-2 space-y-0.5">
                      <p className="font-bold text-stone-900">{item.patients?.full_name}</p>
                      <p className="text-[11px] text-stone-500">
                        {item.patients?.gender} • Ph: {item.patients?.phone}
                      </p>
                    </td>

                    <td className="py-3 px-2">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                        item.urgency_level === 'Emergency'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : item.urgency_level === 'Priority'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {item.urgency_level}
                      </span>
                    </td>

                    <td className="py-3 px-2 font-bold">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] ${
                        item.status === 'Completed'
                          ? 'bg-stone-100 text-stone-700'
                          : item.status === 'In-Consultation'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                          : item.status === 'Checked-In'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-right">
                      {item.status === 'Pending' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'Checked-In')}
                          className="px-3.5 py-1.5 bg-[#0B4632] hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs ml-auto"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Check-In Patient</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}