'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Stethoscope,
    User,
    Phone,
    Calendar,
    Activity,
    FileText,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Clock,
    Pill,
    Printer
} from 'lucide-react';

interface WaitingAppointment {
    id: string;
    token_number: number;
    urgency_level: string;
    status: string;
    patient_id: string;
    patients: {
        id: string;
        full_name: string;
        phone: string;
        date_of_birth: string;
        gender: string;
        allergies: string;
    };
}

interface MedicineItem {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

export default function DoctorConsolePage() {
    const [waitingList, setWaitingList] = useState<WaitingAppointment[]>([]);
    const [selectedAppt, setSelectedAppt] = useState<WaitingAppointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [completedSuccess, setCompletedSuccess] = useState<string | null>(null);

    // Consultation clinical state
    const [symptoms, setSymptoms] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [vitals, setVitals] = useState({
        bp: '120/80',
        pulse: '72 bpm',
        temp: '98.6 °F',
        weight: '65 kg',
    });
    const [notes, setNotes] = useState('');

    // Prescription medicines state
    const [medicines, setMedicines] = useState<MedicineItem[]>([
        {
            id: '1',
            name: 'Paracetamol 650mg',
            dosage: '1 Tab',
            frequency: '1-0-1 (Twice daily)',
            duration: '3 Days',
            instructions: 'After food',
        },
    ]);

    // Fetch active queue
    const fetchActiveQueue = async () => {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('appointments')
            .select(`
        id,
        token_number,
        urgency_level,
        status,
        patient_id,
        patients (
          id,
          full_name,
          phone,
          date_of_birth,
          gender,
          allergies
        )
      `)
            .eq('appointment_date', today)
            .in('status', ['Checked-In', 'In-Consultation'])
            .order('token_number', { ascending: true });

        if (!error && data) {
            const urgencyRank: Record<string, number> = { Emergency: 1, Priority: 2, Normal: 3 };
            const sorted = [...(data as any[])].sort((a, b) => {
                const rankDiff = (urgencyRank[a.urgency_level] || 3) - (urgencyRank[b.urgency_level] || 3);
                if (rankDiff !== 0) return rankDiff;
                return a.token_number - b.token_number;
            });

            setWaitingList(sorted);
            if (!selectedAppt && sorted.length > 0) {
                setSelectedAppt(sorted[0]);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchActiveQueue();

        const channel = supabase
            .channel('doctor_workspace_sync')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'appointments' },
                () => {
                    fetchActiveQueue();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Add a medication row
    const addMedicineRow = () => {
        setMedicines([
            ...medicines,
            {
                id: Math.random().toString(),
                name: '',
                dosage: '1 Tab',
                frequency: '1-0-1 (After food)',
                duration: '5 Days',
                instructions: 'After food',
            },
        ]);
    };

    // Remove a medication row
    const removeMedicineRow = (id: string) => {
        setMedicines(medicines.filter((m) => m.id !== id));
    };

    // Update specific medicine field
    const updateMedicine = (id: string, field: keyof MedicineItem, value: string) => {
        setMedicines(
            medicines.map((m) => (m.id === id ? { ...m, [field]: value } : m))
        );
    };

    // Select a patient from waiting queue
    const handleSelectPatient = async (appt: WaitingAppointment) => {
        setSelectedAppt(appt);
        setCompletedSuccess(null);
        setSymptoms('');
        setDiagnosis('');

        // Mark as In-Consultation
        await supabase
            .from('appointments')
            .update({ status: 'In-Consultation' })
            .eq('id', appt.id);
    };

    // Submit complete consultation and prescription
    const handleCompleteConsultation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAppt) return;
        setSaving(true);

        try {
            // 1. Insert into consultations
            const { data: consultationData, error: consultError } = await supabase
                .from('consultations')
                .insert([
                    {
                        appointment_id: selectedAppt.id,
                        patient_id: selectedAppt.patient_id,
                        symptoms: symptoms || 'General Checkup',
                        diagnosis: diagnosis,
                        vitals: vitals,
                        notes: notes,
                    },
                ])
                .select('id')
                .single();

            if (consultError) throw consultError;

            // 2. Insert into prescriptions
            const { data: presData, error: presError } = await supabase
                .from('prescriptions')
                .insert([
                    {
                        consultation_id: consultationData.id,
                        patient_id: selectedAppt.patient_id,
                    },
                ])
                .select('id')
                .single();

            if (presError) throw presError;

            // 3. Insert prescription medicine items
            const validMeds = medicines.filter((m) => m.name.trim().length > 0);
            if (validMeds.length > 0) {
                const medPayload = validMeds.map((m) => ({
                    prescription_id: presData.id,
                    medicine_name: m.name.trim(),
                    dosage: m.dosage,
                    frequency: m.frequency,
                    duration: m.duration,
                    instructions: m.instructions,
                }));

                const { error: itemsError } = await supabase
                    .from('prescription_items')
                    .insert(medPayload);

                if (itemsError) throw itemsError;
            }

            // 4. Mark appointment Completed
            const { error: apptStatusError } = await supabase
                .from('appointments')
                .update({ status: 'Completed' })
                .eq('id', selectedAppt.id);

            if (apptStatusError) throw apptStatusError;

            setCompletedSuccess(selectedAppt.patients.full_name);
            setSelectedAppt(null);
            fetchActiveQueue();
        } catch (err: any) {
            alert(err.message || 'Error saving consultation');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* DOCTOR WORKSPACE HEADER */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Stethoscope className="w-6 h-6 text-blue-600" />
                        Doctor Consultation Workspace
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500">
                        ArogyaSetu • Consultant: Dr. Sarika B. Singh (Dhanwantri Clinic)
                    </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200">
                    <Clock className="w-4 h-4" />
                    <span>Active Waiting: {waitingList.length}</span>
                </div>
            </div>

            {completedSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-emerald-800 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Consultation for {completedSuccess} completed and prescription issued.</span>
                    </div>
                    <button
                        onClick={() => setCompletedSuccess(null)}
                        className="text-xs text-emerald-700 underline font-semibold cursor-pointer"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* WORKSPACE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN: ACTIVE WAITING LIST */}
                <div className="lg:col-span-4 space-y-3">
                    <h2 className="text-xs uppercase font-bold text-slate-500 tracking-wider px-1">
                        Checked-In Patients (Next in Line)
                    </h2>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                        {loading && waitingList.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-500">Refreshing waiting list...</div>
                        ) : waitingList.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-500">No patients currently in waiting room.</div>
                        ) : (
                            waitingList.map((appt) => {
                                const isSelected = selectedAppt?.id === appt.id;
                                return (
                                    <button
                                        key={appt.id}
                                        onClick={() => handleSelectPatient(appt)}
                                        className={`w-full text-left p-4 transition flex items-center justify-between gap-3 cursor-pointer ${isSelected ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-800">
                                                #{String(appt.token_number).padStart(2, '0')}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900 text-sm">
                                                    {appt.patients.full_name}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {appt.patients.gender} • {appt.patients.phone}
                                                </div>
                                            </div>
                                        </div>

                                        <span
                                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${appt.urgency_level === 'Emergency'
                                                    ? 'bg-rose-100 text-rose-700'
                                                    : appt.urgency_level === 'Priority'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}
                                        >
                                            {appt.urgency_level}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: CONSULTATION & PRESCRIPTION FORM */}
                <div className="lg:col-span-8">
                    {selectedAppt ? (
                        <form onSubmit={handleCompleteConsultation} className="space-y-6">
                            {/* PATIENT BANNER */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <span className="text-xs uppercase font-bold text-blue-600 tracking-wider">
                                        Currently Consulting • Token #{String(selectedAppt.token_number).padStart(2, '0')}
                                    </span>
                                    <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                                        {selectedAppt.patients.full_name}
                                    </h3>
                                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1">
                                        <span>DOB: {selectedAppt.patients.date_of_birth}</span>
                                        <span>•</span>
                                        <span>Gender: {selectedAppt.patients.gender}</span>
                                        <span>•</span>
                                        <span>Phone: {selectedAppt.patients.phone}</span>
                                    </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                                    Allergies: {selectedAppt.patients.allergies || 'None recorded'}
                                </div>
                            </div>

                            {/* CLINICAL VITALS */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                                    <Activity className="w-4 h-4 text-blue-600" />
                                    Clinical Vitals
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label className="text-[11px] font-medium text-slate-500">Blood Pressure</label>
                                        <input
                                            type="text"
                                            value={vitals.bp}
                                            onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                                            className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-slate-500">Pulse Rate</label>
                                        <input
                                            type="text"
                                            value={vitals.pulse}
                                            onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                                            className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-slate-500">Temperature</label>
                                        <input
                                            type="text"
                                            value={vitals.temp}
                                            onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                                            className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-slate-500">Body Weight</label>
                                        <input
                                            type="text"
                                            value={vitals.weight}
                                            onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                                            className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SYMPTOMS & DIAGNOSIS */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Clinical Symptoms & Presentation
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Chief complaints, pain severity, duration..."
                                        value={symptoms}
                                        onChange={(e) => setSymptoms(e.target.value)}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 resize-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Doctor's Diagnosis *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Acute Viral Pharyngitis / Seasonal Rhinitis"
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
                                    />
                                </div>
                            </div>

                            {/* PRESCRIPTION BUILDER */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                        <Pill className="w-4 h-4 text-blue-600" />
                                        Prescription Medicines (Rx)
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={addMedicineRow}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg transition cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Medicine</span>
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {medicines.map((item, idx) => (
                                        <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-slate-500 uppercase">Medication #{idx + 1}</span>
                                                {medicines.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMedicineRow(item.id)}
                                                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Medicine name (e.g. Amoxicillin 500mg)"
                                                    value={item.name}
                                                    onChange={(e) => updateMedicine(item.id, 'name', e.target.value)}
                                                    className="sm:col-span-2 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Dosage (e.g. 1 Tab)"
                                                    value={item.dosage}
                                                    onChange={(e) => updateMedicine(item.id, 'dosage', e.target.value)}
                                                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Frequency (e.g. 1-0-1)"
                                                    value={item.frequency}
                                                    onChange={(e) => updateMedicine(item.id, 'frequency', e.target.value)}
                                                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Duration (e.g. 5 Days)"
                                                    value={item.duration}
                                                    onChange={(e) => updateMedicine(item.id, 'duration', e.target.value)}
                                                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Special instructions (e.g. After meals)"
                                                    value={item.instructions}
                                                    onChange={(e) => updateMedicine(item.id, 'instructions', e.target.value)}
                                                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ACTION BUTTON */}
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {saving ? (
                                    <span>Saving Consultation & Prescription...</span>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Complete Consultation & Issue Prescription</span>
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
                            <Stethoscope className="w-10 h-10 text-slate-400 mx-auto" />
                            <h3 className="text-base font-semibold text-slate-800">No Patient Selected</h3>
                            <p className="text-xs">
                                Select a checked-in patient from the left queue column to begin their clinical evaluation.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}