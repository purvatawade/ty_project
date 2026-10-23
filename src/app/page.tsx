'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState(25);
  const [allergies, setAllergies] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [triageLevel, setTriageLevel] = useState<'Normal' | 'Priority' | 'Emergency'>('Normal');

  const handleGenerateToken = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`OPD Token Pass generated for ${fullName || 'Patient'}!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* WIDE CENTERED CONTAINER */}
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP BANNER: DOCTOR & CLINIC BRANDING */}
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-2xl shrink-0">
              🩺
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Dhanwantri Clinic • Dr. Sarika B. Singh
              </h1>
              <p className="text-emerald-300/80 text-sm mt-1">
                23+ Years Experience • Integrated Ayurveda &amp; Primary Medical Care
              </p>
            </div>
          </div>

          <Link
            href="/clinic"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 text-sm whitespace-nowrap"
          >
            <span>Learn More About Doctor</span>
            <span>→</span>
          </Link>
        </div>

        {/* MAIN REGISTRATION FORM CARD (FULL SPAN WIDTH) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
          
          {/* HEADER */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-xl shrink-0">
              📋
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Get Live OPD Digital Token</h2>
              <p className="text-slate-400 text-sm mt-0.5">
                Register walk-in patient or book instant OPD turn pass
              </p>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleGenerateToken} className="space-y-6">
            
            {/* ROW 1: FULL NAME & MOBILE NUMBER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm pointer-events-none">
                    👤
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600 text-sm transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Mobile Number (10 Digits) <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm pointer-events-none">
                    📞
                  </span>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. 9820098200"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600 text-sm transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ROW 2: GENDER, AGE & KNOWN ALLERGIES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Age (1 - 110 YRS) <span className="text-emerald-400">*</span>
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setAge(Math.max(1, age - 1))}
                    className="px-4 py-3 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white font-bold text-base transition"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center font-bold text-white text-sm">
                    {age}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAge(Math.min(110, age + 1))}
                    className="px-4 py-3 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white font-bold text-base transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Known Allergies (Optional)
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Sulfa drugs, Penicillin"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600 text-sm transition"
                />
              </div>
            </div>

            {/* ROW 3: CHIEF SYMPTOMS */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Chief Symptoms / Medical Problem
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
                placeholder="e.g. Fever, Cough, Severe Headache, Acidity"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-4 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600 text-sm transition resize-none"
              />
            </div>

            {/* ROW 4: TRIAGE URGENCY LEVEL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Triage Urgency Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* NORMAL */}
                <button
                  type="button"
                  onClick={() => setTriageLevel('Normal')}
                  className={`p-4 rounded-xl border text-left transition relative overflow-hidden ${
                    triageLevel === 'Normal'
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm text-emerald-400">Normal</div>
                  <div className="text-xs text-slate-400 mt-1">Standard OPD Queue</div>
                </button>

                {/* PRIORITY */}
                <button
                  type="button"
                  onClick={() => setTriageLevel('Priority')}
                  className={`p-4 rounded-xl border text-left transition relative overflow-hidden ${
                    triageLevel === 'Priority'
                      ? 'bg-amber-950/60 border-amber-500 text-white shadow-lg shadow-amber-950/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm text-amber-400">Priority</div>
                  <div className="text-xs text-slate-400 mt-1">Senior Citizen / High Fever</div>
                </button>

                {/* EMERGENCY */}
                <button
                  type="button"
                  onClick={() => setTriageLevel('Emergency')}
                  className={`p-4 rounded-xl border text-left transition relative overflow-hidden ${
                    triageLevel === 'Emergency'
                      ? 'bg-rose-950/60 border-rose-500 text-white shadow-lg shadow-rose-950/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm text-rose-400">Emergency</div>
                  <div className="text-xs text-slate-400 mt-1">Severe Pain / Acute Crisis</div>
                </button>

              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 text-base"
              >
                <span>✨</span>
                <span>Generate Digital OPD Token Pass</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}