'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Stethoscope, 
  User, 
  Clock, 
  AlertTriangle, 
  Flame, 
  Leaf, 
  Activity, 
  HeartPulse, 
  Thermometer, 
  Weight, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  Pill, 
  Send, 
  Search,
  History,
  X,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react';

interface WaitingPatient {
  id: string; // appointment_id
  patient_id: string;
  token_number: number;
  urgency_level: 'Normal' | 'Priority' | 'Emergency';
  status: string;
  symptoms?: string;
  patients: {
    full_name: string;
    phone: string;
    gender: string;
    date_of_birth: string;
    allergies: string;
  };
}

interface MedicineRow {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PastConsultation {
  id: string;
  created_at: string;
  diagnosis: string;
  symptoms: string;
  vitals: {
    bp?: string;
    pulse?: string;
    temp?: string;
    weight?: string;
  };
  prescriptions: Array<{
    id: string;
    prescription_items: Array<{
      medicine_name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
  }>;
}

export default function DoctorWorkspacePage() {
  const [queue, setQueue] = useState<WaitingPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<WaitingPatient | null>(null);
  const [loading, setLoading] = useState(false);
  const [completedRxId, setCompletedRxId] = useState<string | null>(null);
  const [queueSearchQuery, setQueueSearchQuery] = useState('');

  // Past History State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [pastConsultations, setPastConsultations] = useState<PastConsultation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Clinical Vitals State
  const [vitals, setVitals] = useState({
    bp: '120/80',
    pulse: '72 bpm',
    temp: '98.6 °F',
    weight: '65 kg',
  });

  // Clinical Diagnosis
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState('');
  const [clinicalSymptoms, setClinicalSymptoms] = useState('');

  // Prescription Items Array
  const [medicines, setMedicines] = useState<MedicineRow[]>([
    { name: 'Tab Paracetamol 650mg', dosage: '1 Tab', frequency: '1-0-1', duration: '5 Days', instructions: 'After food' }
  ]);

  // Quick Prescription Preset Chips
  const quickChips = [
    { name: 'Tab Paracetamol 650mg', dosage: '1 Tab', frequency: '1-1-1', duration: '3 Days', instructions: 'After food for fever' },
    { name: 'Cap Pantoprazole 40mg', dosage: '1 Cap', frequency: '1-0-0', duration: '7 Days', instructions: '30 mins before breakfast' },
    { name: 'Tab Cetirizine 10mg', dosage: '1 Tab', frequency: '0-0-1', duration: '5 Days', instructions: 'At bedtime' },
    { name: 'Tab Amoxicillin 500mg', dosage: '1 Tab', frequency: '1-0-1', duration: '5 Days', instructions: 'After food' }
  ];

  // Fetch Checked-In Queue
  const fetchQueue = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('appointments')
      .select('*, patients(*)')
      .eq('appointment_date', today)
      .in('status', ['Checked-In', 'In-Consultation'])
      .order('token_number', { ascending: true });

    if (!error && data) {
      const rank = { Emergency: 1, Priority: 2, Normal: 3 };
      const sorted = (data as unknown as WaitingPatient[]).sort((a, b) => {
        if (rank[a.urgency_level] !== rank[b.urgency_level]) {
          return rank[a.urgency_level] - rank[b.urgency_level];
        }
        return a.token_number - b.token_number;
      });

      setQueue(sorted);
      if (!selectedPatient && sorted.length > 0) {
        setSelectedPatient(sorted[0]);
      }
    }
  };

  useEffect(() => {
    fetchQueue();

    const channel = supabase
      .channel('doctor_queue_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchQueue();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      setClinicalSymptoms(selectedPatient.symptoms || 'General Malaise / Regular Checkup');
    }
  }, [selectedPatient]);

  const addMedicineRow = () => {
    setMedicines([...medicines, { name: '', dosage: '1 Tab', frequency: '1-0-1', duration: '5 Days', instructions: 'After food' }]);
  };

  const removeMedicineRow = (index: number) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const applyQuickChip = (chip: typeof quickChips[0]) => {
    if (medicines.length === 1 && medicines[0].name === '') {
      setMedicines([chip]);
    } else {
      setMedicines([...medicines, chip]);
    }
  };

  const handleSelectPatient = async (patient: WaitingPatient) => {
    setSelectedPatient(patient);
    setCompletedRxId(null);

    await supabase
      .from('appointments')
      .update({ status: 'In-Consultation' })
      .eq('id', patient.id);

    fetchQueue();
  };

  // Step 21: Fetch Patient Medical History
  const fetchPatientHistory = async () => {
    if (!selectedPatient) return;
    setHistoryLoading(true);
    setShowHistoryModal(true);

    const { data, error } = await supabase
      .from('consultations')
      .select(`
        id,
        created_at,
        diagnosis,
        symptoms,
        vitals,
        prescriptions (
          id,
          prescription_items (
            medicine_name,
            dosage,
            frequency,
            duration
          )
        )
      `)
      .eq('patient_id', selectedPatient.patient_id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPastConsultations(data as unknown as PastConsultation[]);
    }
    setHistoryLoading(false);
  };

  const handleSubmitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    if (!clinicalDiagnosis.trim()) {
      alert('Please enter a clinical diagnosis before finalizing.');
      return;
    }

    setLoading(true);

    try {
      // 1. Insert Consultation Entry
      const { data: consultData, error: consultError } = await supabase
        .from('consultations')
        .insert([
          {
            appointment_id: selectedPatient.id,
            patient_id: selectedPatient.patient_id,
            symptoms: clinicalSymptoms,
            diagnosis: clinicalDiagnosis.trim(),
            vitals: vitals,
            notes: 'Completed in Dhanwantri Doctor Desk'
          }
        ])
        .select();

      if (consultError) throw consultError;
      const consultationId = consultData[0].id;

      // 2. Insert Prescription Entry
      const { data: rxData, error: rxError } = await supabase
        .from('prescriptions')
        .insert([
          {
            consultation_id: consultationId,
            patient_id: selectedPatient.patient_id,
            issue_date: new Date().toISOString().split('T')[0]
          }
        ])
        .select();

      if (rxError) throw rxError;
      const prescriptionId = rxData[0].id;

      // 3. Insert Prescription Items
      const validMedicines = medicines.filter(m => m.name.trim() !== '');
      if (validMedicines.length > 0 && prescriptionId) {
        const itemsToInsert = validMedicines.map(m => ({
          prescription_id: prescriptionId,
          medicine_name: m.name.trim(),
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions
        }));

        await supabase.from('prescription_items').insert(itemsToInsert);
      }

      // 4. Update Appointment Status to Completed
      await supabase
        .from('appointments')
        .update({ status: 'Completed' })
        .eq('id', selectedPatient.id);

      setCompletedRxId(prescriptionId);
      setClinicalDiagnosis('');
      setMedicines([{ name: '', dosage: '1 Tab', frequency: '1-0-1', duration: '5 Days', instructions: 'After food' }]);
      fetchQueue();

    } catch (err: any) {
      alert(`Unexpected Error: ${err.message || 'Failed to complete consultation'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredQueue = queue.filter(item => 
    item.patients?.full_name.toLowerCase().includes(queueSearchQuery.toLowerCase()) ||
    item.patients?.phone.includes(queueSearchQuery) ||
    String(item.token_number).includes(queueSearchQuery)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 font-sans">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0B4632] flex items-center justify-center text-white shadow-md">
            <Stethoscope className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Doctor Consultation Workspace</h1>
            <p className="text-xs text-stone-500">Dr. Sarika B. Singh (B.A.M.S.) • Dhanwantri Clinic</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/reception"
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-[#0B4632]" />
            <span>Reception</span>
          </Link>

          <Link
            href="/analytics"
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#0B4632]" />
            <span>Analytics</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Live Queue ({queue.length})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: QUEUE LIST */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#0B4632]" />
                Checked-In Queue
              </span>
              <span className="text-xs font-bold text-stone-400">{filteredQueue.length} Patients</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient name or phone..."
                value={queueSearchQuery}
                onChange={(e) => setQueueSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#F6F4EE] border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4632]"
              />
            </div>

            {filteredQueue.length === 0 ? (
              <div className="p-8 text-center text-stone-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 opacity-60" />
                <p className="text-xs font-semibold">No matching patients in queue.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
                {filteredQueue.map((item) => {
                  const isSelected = selectedPatient?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectPatient(item)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-50/90 border-[#0B4632] ring-2 ring-[#0B4632]/20 shadow-xs'
                          : 'bg-[#F6F4EE] border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-[#0B4632] font-mono">
                            #{String(item.token_number).padStart(2, '0')}
                          </span>
                          <span className="text-xs font-bold text-stone-900 truncate">
                            {item.patients?.full_name}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-2">
                          <span>{item.patients?.gender}</span>
                          <span>•</span>
                          <span>Phone: {item.patients?.phone}</span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                          item.urgency_level === 'Emergency'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : item.urgency_level === 'Priority'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {item.urgency_level}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CONSULTATION WORKSPACE */}
        <div className="lg:col-span-8 space-y-6">
          {completedRxId ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-emerald-950">Consultation Completed & Saved!</h2>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Patient record and digital prescription have been saved to Supabase cloud records.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={`/prescription/${completedRxId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#D97706] hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>View & Print Prescription Slip</span>
                </a>

                <button
                  onClick={() => {
                    setCompletedRxId(null);
                    setSelectedPatient(null);
                  }}
                  className="px-5 py-2.5 bg-[#0B4632] hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Examine Next Patient
                </button>
              </div>
            </div>
          ) : selectedPatient ? (
            <form onSubmit={handleSubmitConsultation} className="space-y-6">
              {/* PATIENT CHART CARD WITH STEP 21 HISTORY BUTTON */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-mono font-bold text-lg">
                      #{String(selectedPatient.token_number).padStart(2, '0')}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-stone-900">{selectedPatient.patients?.full_name}</h2>
                      <p className="text-xs text-stone-500">
                        {selectedPatient.patients?.gender} • Phone: {selectedPatient.patients?.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={fetchPatientHistory}
                      className="px-3.5 py-1.5 bg-[#0B4632] hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5 text-amber-300" />
                      <span>Medical History</span>
                    </button>

                    <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
                      Allergies: {selectedPatient.patients?.allergies || 'None'}
                    </span>
                  </div>
                </div>

                {/* CLINICAL VITALS STRIP */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-[#F6F4EE] rounded-2xl border border-stone-200 space-y-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-600" /> Blood Pressure
                    </span>
                    <input
                      type="text"
                      value={vitals.bp}
                      onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                      className="w-full bg-white px-2.5 py-1 text-xs font-bold text-stone-900 rounded-lg border border-stone-300 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-[#F6F4EE] rounded-2xl border border-stone-200 space-y-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-emerald-700" /> Pulse Rate
                    </span>
                    <input
                      type="text"
                      value={vitals.pulse}
                      onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                      className="w-full bg-white px-2.5 py-1 text-xs font-bold text-stone-900 rounded-lg border border-stone-300 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-[#F6F4EE] rounded-2xl border border-stone-200 space-y-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-amber-600" /> Temperature
                    </span>
                    <input
                      type="text"
                      value={vitals.temp}
                      onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                      className="w-full bg-white px-2.5 py-1 text-xs font-bold text-stone-900 rounded-lg border border-stone-300 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-[#F6F4EE] rounded-2xl border border-stone-200 space-y-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                      <Weight className="w-3.5 h-3.5 text-indigo-600" /> Body Weight
                    </span>
                    <input
                      type="text"
                      value={vitals.weight}
                      onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                      className="w-full bg-white px-2.5 py-1 text-xs font-bold text-stone-900 rounded-lg border border-stone-300 focus:outline-none"
                    />
                  </div>
                </div>

                {/* DIAGNOSIS INPUTS */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                      Chief Symptoms / Recorded Complaint
                    </label>
                    <textarea
                      rows={2}
                      value={clinicalSymptoms}
                      onChange={(e) => setClinicalSymptoms(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#F6F4EE] border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4632]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                      Doctor's Clinical Diagnosis *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acute Allergic Rhinitis / Hyperacidity"
                      value={clinicalDiagnosis}
                      onChange={(e) => setClinicalDiagnosis(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F6F4EE] border border-stone-200 rounded-xl text-xs sm:text-sm font-bold text-stone-900 focus:outline-none focus:border-[#0B4632]"
                    />
                  </div>
                </div>
              </div>

              {/* DYNAMIC RX PRESCRIPTION BUILDER */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-[#0B4632]" />
                    Prescription (Rx) Medication Builder
                  </span>
                  <button
                    type="button"
                    onClick={addMedicineRow}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Medicine Row
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Quick-Tap Medicine Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {quickChips.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyQuickChip(chip)}
                        className="px-2.5 py-1 bg-[#F6F4EE] hover:bg-stone-200 text-stone-700 text-[11px] font-semibold rounded-lg border border-stone-200 transition cursor-pointer"
                      >
                        + {chip.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Medicine Table Inputs */}
                <div className="space-y-3 pt-2">
                  {medicines.map((med, index) => (
                    <div key={index} className="p-3 bg-[#F6F4EE] rounded-2xl border border-stone-200 space-y-2 relative">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            placeholder="Medicine Name"
                            value={med.name}
                            onChange={(e) => {
                              const updated = [...medicines];
                              updated[index].name = e.target.value;
                              setMedicines(updated);
                            }}
                            className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Dosage"
                            value={med.dosage}
                            onChange={(e) => {
                              const updated = [...medicines];
                              updated[index].dosage = e.target.value;
                              setMedicines(updated);
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Frequency"
                            value={med.frequency}
                            onChange={(e) => {
                              const updated = [...medicines];
                              updated[index].frequency = e.target.value;
                              setMedicines(updated);
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Duration"
                            value={med.duration}
                            onChange={(e) => {
                              const updated = [...medicines];
                              updated[index].duration = e.target.value;
                              setMedicines(updated);
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="Instructions"
                            value={med.instructions}
                            onChange={(e) => {
                              const updated = [...medicines];
                              updated[index].instructions = e.target.value;
                              setMedicines(updated);
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none"
                          />

                          {medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMedicineRow(index)}
                              className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* COMMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#0B4632] hover:bg-emerald-900 active:scale-[0.99] text-white font-semibold rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
                >
                  {loading ? (
                    <span>Finalizing Clinical Record...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Complete Consultation & Save Rx Record</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>

      {/* STEP 21: PAST MEDICAL HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-5 bg-[#0B4632] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">
                  Medical History: {selectedPatient?.patients?.full_name}
                </h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 hover:bg-emerald-900 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {historyLoading ? (
                <div className="py-12 text-center text-xs font-bold text-stone-500 animate-pulse">
                  Loading patient consultations history...
                </div>
              ) : pastConsultations.length === 0 ? (
                <div className="py-12 text-center space-y-2 text-stone-400">
                  <Calendar className="w-8 h-8 mx-auto" />
                  <p className="text-xs font-bold">No past consultations found for this patient.</p>
                </div>
              ) : (
                pastConsultations.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-[#F6F4EE] border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between text-xs border-b border-stone-200 pb-2">
                      <span className="font-bold text-[#0B4632]">
                        {new Date(item.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-stone-500 font-medium">
                        BP: {item.vitals?.bp || 'N/A'} • Temp: {item.vitals?.temp || 'N/A'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-amber-700 block">Diagnosis</span>
                      <p className="text-xs font-bold text-stone-900">{item.diagnosis}</p>
                    </div>

                    {item.prescriptions?.length > 0 && item.prescriptions[0].prescription_items?.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-stone-200/60">
                        <span className="text-[10px] font-bold uppercase text-stone-500 block">Prescribed Medicines</span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.prescriptions[0].prescription_items.map((m, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-white text-stone-800 text-[10px] font-semibold rounded-md border border-stone-200">
                              {m.medicine_name} ({m.dosage} - {m.frequency})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}