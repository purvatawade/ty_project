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
    <div className="min-h-screen bg-slate-100 text-slate-900 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      {/* WIDE CENTERED CONTAINER */}
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP HERO BANNER (SPACED FROM NAVBAR) */}
        <div className="bg-emerald-950 border border-emerald-800 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl text-white">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-3xl shrink-0">
              🩺
            </div>
            <div>
              <div className="inline-block px-3 py-1 bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold rounded-full mb-2">
                🟢 OPD Open Now • Morning Session
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Dhanwantri Clinic • Dr. Sarika B. Singh
              </h1>
              <p className="text-emerald-200 text-sm mt-1 max-w-xl">
                Integrated Ayurveda &amp; Primary Family Medical Care in Mira Road. Over 23+ years of healthcare service.
              </p>
            </div>
          </div>

          <Link
            href="/clinic"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl transition shadow-lg text-sm whitespace-nowrap"
          >
            <span>Learn More About Doctor</span>
            <span>→</span>
          </Link>
        </div>

        {/* MAIN FORM CONTAINER (LIGHT CREAM FILL WITH POP SHADOW & BORDER) */}
        <div className="bg-[#FFFDF9] border-2 border-emerald-200/80 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-emerald-950/10">
          
          {/* HEADER */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-2xl shrink-0">
              📋
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Get Live OPD Digital Token
              </h2>
              <p className="text-slate-600 text-sm font-medium mt-0.5">
                Register walk-in patient or book instant OPD turn pass
              </p>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleGenerateToken} className="space-y-6">
            
            {/* ROW 1: FULL NAME & MOBILE NUMBER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Full Name <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-base pointer-events-none">
                    👤
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-white border border-slate-300 text-slate-900 font-semibold pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 placeholder:text-slate-400 text-sm transition shadow-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Mobile Number (10 Digits) <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-base pointer-events-none">
                    📞
                  </span>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. 9820098200"
                    className="w-full bg-white border border-slate-300 text-slate-900 font-semibold pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 placeholder:text-slate-400 text-sm transition shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ROW 2: GENDER, AGE & KNOWN ALLERGIES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 font-semibold px-4 py-3.5 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm transition shadow-sm"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Age (1 - 110 YRS) <span className="text-emerald-600">*</span>
                </label>
                <div className="flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setAge(Math.max(1, age - 1))}
                    className="px-4 py-3.5 bg-slate-100 text-slate-800 hover:bg-slate-200 font-extrabold text-base transition"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center font-bold text-slate-900 text-base">
                    {age}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAge(Math.min(110, age + 1))}
                    className="px-4 py-3.5 bg-slate-100 text-slate-800 hover:bg-slate-200 font-extrabold text-base transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Known Allergies (Optional)
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Sulfa drugs, Penicillin"
                  className="w-full bg-white border border-slate-300 text-slate-900 font-semibold px-4 py-3.5 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 placeholder:text-slate-400 text-sm transition shadow-sm"
                />
              </div>
            </div>

            {/* ROW 3: CHIEF SYMPTOMS */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Chief Symptoms / Medical Problem
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
                placeholder="e.g. Fever, Cough, Severe Headache, Acidity"
                className="w-full bg-white border border-slate-300 text-slate-900 font-semibold p-4 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 placeholder:text-slate-400 text-sm transition resize-none shadow-sm"
              />
            </div>

            {/* ROW 4: TRIAGE URGENCY LEVEL */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Triage Urgency Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* NORMAL */}
                <button
                  type="button"
                  onClick={() => setTriageLevel('Normal')}
                  className={`p-4 rounded-2xl border-2 text-left transition ${
                    triageLevel === 'Normal'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-md ring-2 ring-emerald-600/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-base text-emerald-900">Normal</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Standard OPD Queue</div>
                </button>

                {/* PRIORITY */}
                <button
                  type="button"
                  onClick={() => setTriageLevel('Priority')}
                  className={`p-4 rounded-2xl border-2 text-left transition ${
                    triageLevel === 'Priority'
                      ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-md ring-2 ring-amber-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-base text-amber-900">Priority</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Senior Citizen / High Fever</div>
                </button>

                {/* EMERGENCY */}
                <button
                  type="button"
                  onClick={() => setTriageLevel('Emergency')}
                  className={`p-4 rounded-2xl border-2 text-left transition ${
                    triageLevel === 'Emergency'
                      ? 'bg-rose-50 border-rose-500 text-rose-950 shadow-md ring-2 ring-rose-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-base text-rose-900">Emergency</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Severe Pain / Acute Crisis</div>
                </button>

              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl transition shadow-xl shadow-emerald-950/20 flex items-center justify-center gap-2 text-base tracking-wide"
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