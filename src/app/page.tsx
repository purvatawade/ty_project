'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { generateWhatsAppTokenLink, triggerSmsPrompt } from '@/lib/notifications';
import { 
  UserPlus, 
  Phone, 
  User, 
  CheckCircle2, 
  Stethoscope, 
  Sparkles, 
  ArrowRight,
  Minus,
  Plus,
  AlertCircle,
  MessageSquare,
  Send
} from 'lucide-react';

export default function PatientRegistrationPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState<number>(25);
  const [allergies, setAllergies] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'Normal' | 'Priority' | 'Emergency'>('Normal');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tokenResult, setTokenResult] = useState<{
    tokenNumber: number;
    patientName: string;
    phone: string;
    urgency: string;
  } | null>(null);

  const validateForm = (): boolean => {
    setErrorMessage(null);

    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Please enter a valid patient name (at least 2 characters).');
      return false;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number.');
      return false;
    }

    if (isNaN(age) || age < 1 || age > 110) {
      setErrorMessage('Please enter a realistic age between 1 and 110 years.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const cleanPhone = phone.trim().replace(/\D/g, '');

      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - age;
      const dobToInsert = `${birthYear}-01-01`;

      let patientId = '';
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('phone', cleanPhone)
        .single();

      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        const { data: newPatient, error: pError } = await supabase
          .from('patients')
          .insert([
            {
              full_name: fullName.trim(),
              phone: cleanPhone,
              gender: gender,
              date_of_birth: dobToInsert,
              allergies: allergies.trim() || 'None'
            }
          ])
          .select();

        if (pError) throw pError;
        patientId = newPatient[0].id;
      }

      const today = new Date().toISOString().split('T')[0];
      const { data: todayApps } = await supabase
        .from('appointments')
        .select('token_number')
        .eq('appointment_date', today)
        .order('token_number', { ascending: false })
        .limit(1);

      const nextToken = todayApps && todayApps.length > 0 ? todayApps[0].token_number + 1 : 1;

      const { error: appError } = await supabase
        .from('appointments')
        .insert([
          {
            patient_id: patientId,
            appointment_date: today,
            token_number: nextToken,
            urgency_level: urgencyLevel,
            status: 'Pending'
          }
        ]);

      if (appError) throw appError;

      setTokenResult({
        tokenNumber: nextToken,
        patientName: fullName.trim(),
        phone: cleanPhone,
        urgency: urgencyLevel
      });

      // Clear form inputs
      setFullName('');
      setPhone('');
      setAge(25);
      setAllergies('');
      setSymptoms('');
      setUrgencyLevel('Normal');

    } catch (err: any) {
      setErrorMessage(`Error creating token: ${err.message || 'Please try again.'}`);
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

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {tokenResult ? (
          /* GENERATED TOKEN SUCCESS CARD WITH NOTIFICATIONS */
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-8 text-center space-y-5">
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

            {/* NOTIFICATION BUTTONS */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <a
                href={generateWhatsAppTokenLink({
                  patientName: tokenResult.patientName,
                  phone: tokenResult.phone,
                  tokenNumber: tokenResult.tokenNumber
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send WhatsApp Token Pass</span>
              </a>

              <button
                type="button"
                onClick={() => triggerSmsPrompt({
                  patientName: tokenResult.patientName,
                  phone: tokenResult.phone,
                  tokenNumber: tokenResult.tokenNumber
                })}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>SMS Alert</span>
              </button>
            </div>

            <div className="pt-3 border-t border-emerald-200/60 flex items-center justify-center gap-3">
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
                  Mobile Number (10 Digits) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9820098200"
                    value={phone}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, '');
                      setPhone(onlyNums);
                    }}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#F6F4EE] border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#0B4632]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  Age (1 - 110 Yrs) *
                </label>
                <div className="flex items-center gap-1 bg-[#F6F4EE] border border-stone-200 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setAge((prev) => Math.max(1, prev - 1))}
                    className="p-1.5 bg-white hover:bg-stone-200 rounded-lg text-stone-700 transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="110"
                    value={age}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      if (val > 110) setAge(110);
                      else setAge(val);
                    }}
                    className="w-full text-center bg-transparent text-xs font-black text-stone-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setAge((prev) => Math.min(110, prev + 1))}
                    className="p-1.5 bg-white hover:bg-stone-200 rounded-lg text-stone-700 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                  Known Allergies (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sulfa drugs, Penicillin"
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