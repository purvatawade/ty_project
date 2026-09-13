'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import confetti from 'canvas-confetti';
import {
  HeartPulse,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  User,
  Phone,
  Activity
} from 'lucide-react';

export default function PatientBookingPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dob: '',
    gender: 'Male',
    allergies: 'None',
    symptoms: '',
    urgencyLevel: 'Normal',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState<null | {
    patientName: string;
    tokenNumber: number;
    urgency: string;
    date: string;
  }>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Check or insert patient record based on phone number
      let patientId: string;
      const { data: existingPatient, error: searchError } = await supabase
        .from('patients')
        .select('id')
        .eq('phone', formData.phone.trim())
        .maybeSingle();

      if (searchError) throw searchError;

      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        const { data: newPatient, error: insertError } = await supabase
          .from('patients')
          .insert([
            {
              full_name: formData.fullName.trim(),
              phone: formData.phone.trim(),
              date_of_birth: formData.dob,
              gender: formData.gender,
              allergies: formData.allergies || 'None',
            },
          ])
          .select('id')
          .single();

        if (insertError) throw insertError;
        patientId = newPatient.id;
      }

      // 2. Determine sequential token number for today
      const today = new Date().toISOString().split('T')[0];
      const { count, error: countError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today);

      if (countError) throw countError;
      const nextToken = (count || 0) + 1;

      // 3. Create appointment record
      const { error: apptError } = await supabase.from('appointments').insert([
        {
          patient_id: patientId,
          appointment_date: today,
          token_number: nextToken,
          urgency_level: formData.urgencyLevel,
          status: 'Pending',
        },
      ]);

      if (apptError) throw apptError;

      // 4. Trigger celebration & set confirmation screen
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setBookingConfirmed({
        patientName: formData.fullName,
        tokenNumber: nextToken,
        urgency: formData.urgencyLevel,
        date: today,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* CLINIC HERO / PRACTITIONER INTRO */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Accepting Outpatients Today
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Dhanwantri Clinic
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Consultant: <span className="text-slate-900 font-semibold">Dr. Sarika B. Singh</span>
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-blue-600" />
              Priyal Enclave, Near Bharti Park, Mumbai
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-600" />
              10:00 AM – 02:00 PM | 06:00 PM – 09:30 PM
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center bg-blue-50/60 p-4 rounded-xl border border-blue-100 text-center w-full md:w-auto min-w-[200px]">
          <span className="text-xs font-semibold uppercase text-blue-700 tracking-wider">Live OPD Engine</span>
          <span className="text-2xl font-bold text-blue-900 mt-1">Direct Token</span>
          <span className="text-xs text-slate-500 mt-1">Zero clinic waiting chaos</span>
        </div>
      </section>

      {/* CONFIRMATION STATE OR BOOKING INTAKE FORM */}
      {bookingConfirmed ? (
        <section className="bg-white rounded-2xl border border-emerald-200 p-8 shadow-sm text-center max-w-lg mx-auto space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Appointment Registered!</h2>
            <p className="text-sm text-slate-600">
              Your visit has been logged into the live receptionist triage queue.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-3">
            <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Your Queue Token</span>
            <div className="text-5xl font-extrabold text-blue-600 tracking-tight">
              #{String(bookingConfirmed.tokenNumber).padStart(2, '0')}
            </div>
            <div className="pt-2 text-xs text-slate-500 flex justify-between border-t border-slate-200 mt-3">
              <span>Patient: <b className="text-slate-800">{bookingConfirmed.patientName}</b></span>
              <span>Date: <b className="text-slate-800">{bookingConfirmed.date}</b></span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Please show this token number at the reception desk upon arriving at Dhanwantri Clinic.
          </p>

          <button
            onClick={() => setBookingConfirmed(null)}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Book Another Patient
          </button>
        </section>
      ) : (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Patient Registration & Intake Form
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Enter the patient's vitals and primary health concerns before consultation.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* FULL NAME */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              {/* PHONE NUMBER */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* DOB */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                />
              </div>

              {/* GENDER */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* URGENCY LEVEL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Condition / Urgency
                </label>
                <select
                  value={formData.urgencyLevel}
                  onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition font-medium"
                >
                  <option value="Normal">Routine Checkup (Normal)</option>
                  <option value="Priority">Moderate Pain (Priority)</option>
                  <option value="Emergency">Urgent / Acute (Emergency)</option>
                </select>
              </div>
            </div>

            {/* KNOWN ALLERGIES */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Known Drug Allergies</span>
                <span className="text-[11px] text-slate-400 font-normal">Leave as 'None' if unsure</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Sulfa drugs, Paracetamol"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>

            {/* PRIMARY SYMPTOMS */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Primary Symptoms / Reason for Visit *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe headache, fever duration, cough, stomach discomfort, etc."
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition resize-none"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Registering Token in Cloud...</span>
              ) : (
                <>
                  <span>Confirm Booking & Get Queue Token</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}