'use client';

import React from 'react';
import Link from 'next/link';
import { 
  HeartPulse, 
  Stethoscope, 
  Clock, 
  MapPin, 
  Phone, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Star, 
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function DoctorClinicWebsitePage() {
  const offerings = [
    {
      title: 'Nadi Pariksha & Ayurvedic Pulse Diagnosis',
      description: 'Traditional Ayurvedic pulse diagnosis to detect root causes of metabolic, digestive, and lifestyle imbalances.'
    },
    {
      title: 'Chronic Gut & Acidity Reversal',
      description: 'Specialized herbal and dietary protocols for hyperacidity, IBS, gastritis, and chronic indigestion.'
    },
    {
      title: 'Joint Pain & Musculoskeletal Care',
      description: 'Non-invasive holistic management for arthritis, lumbar spondylosis, and inflammation.'
    },
    {
      title: 'General Outpatient Medical Care',
      description: 'Comprehensive primary care, fever management, blood pressure monitoring, and acute consultations.'
    }
  ];

  const testimonials = [
    {
      name: 'Ramesh Sharma',
      comment: 'Dr. Sarika Singh’s diagnosis was extremely accurate. Her Ayurvedic medicines cured my chronic acidity in just two weeks.',
      rating: 5
    },
    {
      name: 'Pooja Mehta',
      comment: 'Very polite, patient, and knowledgeable doctor. The token system at Dhanwantri Clinic makes waiting hassle-free.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans space-y-16 pb-16">
      
      {/* HERO SECTION */}
      <section className="bg-white border-b border-stone-200/90 py-12 sm:py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Integrated Ayurveda & General Medicine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
              Dr. Sarika B. Singh <br />
              <span className="text-[#0B4632] font-serif italic font-normal">Dhanwantri Clinic</span>
            </h1>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Providing compassionate, unhurried, holistic healthcare for over 23 years. Combining traditional Ayurvedic wisdom with modern general outpatient diagnostic accuracy.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/"
                className="px-6 py-3.5 bg-[#0B4632] hover:bg-emerald-950 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-emerald-300" />
                <span>Book OPD Consultation Slot</span>
              </Link>

              <span className="px-4 py-3 bg-amber-50 text-amber-900 font-bold text-xs rounded-2xl border border-amber-200">
                ₹100 OPD Consultation Fee
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#F6F4EE] p-8 rounded-3xl border border-stone-200/90 space-y-6 shadow-xs">
            <div className="flex items-center gap-4 border-b border-stone-200 pb-4">
              <div className="w-14 h-14 bg-[#0B4632] text-white rounded-2xl flex items-center justify-center font-bold text-xl">
                <Stethoscope className="w-7 h-7 text-emerald-200" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Dr. Sarika B. Singh</h3>
                <p className="text-xs font-bold text-[#0B4632]">B.A.M.S. (Mumbai University, 2000)</p>
                <p className="text-[11px] text-stone-500">MCIM Registration No. 40421</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              <div className="flex items-start gap-2.5">
                <Award className="w-4 h-4 text-[#0B4632] shrink-0 mt-0.5" />
                <span><strong>23+ Years</strong> of active clinical practice in Mira Road.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#0B4632] shrink-0 mt-0.5" />
                <span><strong>OPD Timings:</strong> Mon-Sat 11:00 AM – 2:00 PM & 7:00 PM – 10:00 PM</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#0B4632] shrink-0 mt-0.5" />
                <span>Shop No. 7, Priyal Enclave, Opp. R. K. Hotel, Near Bharti Park, Mira Road (East), Thane - 401107</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLINICAL OFFERINGS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-black text-stone-900">Clinical Specialties & Treatments</h2>
          <p className="text-xs text-stone-500">Targeted therapeutic solutions addressing the root cause of chronic and acute conditions.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {offerings.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0B4632] flex items-center justify-center font-bold text-sm">
                0{idx + 1}
              </div>
              <h3 className="font-bold text-stone-900 text-sm">{item.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PATIENT TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-stone-900">Verified Patient Feedback</h2>
          <p className="text-xs text-stone-500">Trusted by thousands of families in Mira Road and Thane.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-stone-700 italic">"{t.comment}"</p>
              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-stone-900">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="bg-[#0B4632] text-white p-8 sm:p-12 rounded-3xl text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black">Need Doctor Consultation Today?</h2>
          <p className="text-xs sm:text-sm text-emerald-200 max-w-lg mx-auto">
            Get your instant digital token number online and skip long clinic queues.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold text-xs sm:text-sm rounded-2xl transition"
          >
            <span>Get Live OPD Token Pass</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}