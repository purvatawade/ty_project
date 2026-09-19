'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  UserPlus, 
  Phone, 
  User, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Stethoscope, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Clock,
  HeartPulse
} from 'lucide-react';

export default function PatientRegistrationPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [allergies, setAllergies] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'Normal' | 'Priority' | 'Emergency'>('Normal');

  const [loading, setLoading] = useState(false);
  const [tokenResult, setTokenResult] = useState<{
    tokenNumber: number;
    patientName: string;
    urgency: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert('Please fill in required fields (Name and Phone Number).');
      return;
    }

    setLoading(true);

    try {
      // 1. Insert or check patient record
      let patientId = '';
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('phone', phone.trim())
        .single();

      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        const { data: newPatient, error: pError } = await supabase
          .from('patients')
          .insert([
            {
              full_name: fullName.trim(),
              phone: phone.trim(),
              gender: gender,
              allergies: allergies.trim() || 'None'
            }
          ])
          .select();

        if (pError) throw pError;
        patientId = newPatient[0].id;
      }

      // 2. Calculate next token number for today
      const today = new Date().toISOString().split('T')[0];
      const { data: todayApps } = await supabase
        .from('appointments')
        .select('token_number')
        .eq('appointment_date', today)
        .order('token_number', { ascending: false })
        .limit(1);

      const nextToken = todayApps && todayApps.length > 0 ? todayApps[0].token_number + 1 : 1;

      // 3. Create appointment queue entry
      const { error: appError } = await supabase
        .from('appointments')
        .insert([
          {
            patient_id: patientId,
            appointment_date: today,
            token_number: nextToken,
            urgency_level: urgencyLevel,
            status: 'Pending',
            symptoms: symptoms.trim() || 'General Consultation'
          }
        ]);

      if (appError) throw appError;

      setTokenResult({
        tokenNumber: nextToken,
        patientName: fullName.trim(),
        urgency: urgencyLevel
      });

      // Clear form
      setFullName('');
      setPhone('');
      setAllergies('');
      setSymptoms('');
      setUrgencyLevel('Normal');

    } catch (err: any) {
      alert(`Error creating token: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 font-sans">
      
      {/* TOP CLINIC SHOWCASE BANNER LINK */}
      <div className="bg-emerald-900 text-white p-4 sm:p-5 rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-800">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Dhanwantri Clinic • Dr. Sarika B. Singh</h2>
            <p className="text-xs text-emerald-200">23+ Years Experience • Integrated Ayurveda & Primary Medical Care</p>
          </div>
        </div>

        <Link
          href="/clinic"
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-xs"
        >
          <span>Learn More About Doctor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* REGISTRATION FORM & TOKEN DISPLAY */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#0B4632] text-white flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-900">Get Live OPD Digital Token</h1>
            <p className="text-xs text-stone-500">Register walk-in patient or book instant OPD turn pass</p>
          </div>
        </div>

        {tokenResult ? (
          /* GENERATED TOKEN SUCCESS CARD */
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-[#0B4632] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8 text-emerald-300" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Your Live OPD Token</span>
              <div className="text-5xl font-black text-[#0B4632] font-mono tracking-tight">
                #{String(tokenResult.tokenNumber).padStart(2, '0')}
              </div>
            </div>

            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              Token generated for <strong className="text-stone-900">{tokenResult.patientName}</strong>. Please report to Reception or check in at the waiting room.
            </p>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setTokenResult(null)}
                className="px-6 py-2.5 bg-[#0B4632] hover:bg-emerald-950 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Issue Another Token
              </button>

              <Link
                href="/reception"
                className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition"
              >
                View Reception Queue
              </Link>
            </div>
          </div>
        ) : (
          /* FORM INPUTS */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#F6F4EE] border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#0B4632]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#F6F4EE] border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#0B4632]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EE] border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                  Known Allergies (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sulfa drugs, Penicillin, Dust"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EE] border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#0B4632]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                Chief Symptoms / Medical Problem
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Fever, Cough, Severe Headache, Acidity"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F6F4EE] border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#0B4632]"
              />
            </div>

            {/* TRIAGE URGENCY SELECTOR */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                Triage Urgency Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { level: 'Normal', desc: 'Standard OPD Queue', color: 'border-emerald-300 bg-emerald-50/50' },
                  { level: 'Priority', desc: 'Senior Citizen / High Fever', color: 'border-amber-300 bg-amber-50/50' },
                  { level: 'Emergency', desc: 'Severe Pain / Acute Crisis', color: 'border-rose-300 bg-rose-50/50' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setUrgencyLevel(item.level as any)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      urgencyLevel === item.level
                        ? 'ring-2 ring-[#0B4632] border-[#0B4632] bg-emerald-100/60 shadow-xs'
                        : `${item.color} hover:border-stone-400`
                    }`}
                  >
                    <span className="text-xs font-bold text-stone-900 block">{item.level}</span>
                    <span className="text-[10px] text-stone-500 block leading-tight mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#0B4632] hover:bg-emerald-950 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span>Generating Token Pass...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Generate Digital OPD Token Pass</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}