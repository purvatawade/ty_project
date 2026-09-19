'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Stethoscope, 
  MapPin, 
  Phone, 
  Clock, 
  Award, 
  HeartPulse, 
  ShieldCheck, 
  UserPlus, 
  Calendar,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function ClinicLandingPage() {
  const [isOpenNow, setIsOpenNow] = useState(false);

  // Real-time OPD status checker based on clinic operating hours
  // Mon-Sat: 11:00 AM – 2:00 PM & 7:00 PM – 10:00 PM
  useEffect(() => {
    const checkOpdStatus = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday
      if (day === 0) {
        setIsOpenNow(false);
        return;
      }

      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const morningStart = 11 * 60; // 11:00 AM
      const morningEnd = 14 * 60;   // 2:00 PM
      const eveningStart = 19 * 60; // 7:00 PM
      const eveningEnd = 22 * 60;   // 10:00 PM

      const inMorning = currentMinutes >= morningStart && currentMinutes < morningEnd;
      const inEvening = currentMinutes >= eveningStart && currentMinutes < eveningEnd;

      setIsOpenNow(inMorning || inEvening);
    };

    checkOpdStatus();
    const interval = setInterval(checkOpdStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 font-sans">
      
      {/* HERO SECTION */}
      <section className="bg-emerald-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-emerald-900">
        <div className="relative z-10 max-w-2xl space-y-6">
          
          {/* OPD STATUS BADGE */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-xs font-bold">
            <span className={`w-2.5 h-2.5 rounded-full ${isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span>{isOpenNow ? 'OPD Currently Open • Accepting Walk-ins' : 'OPD Closed Now • Reopens at 11 AM / 7 PM'}</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Dhanwantri Clinic
            </h1>
            <p className="text-base sm:text-lg font-medium text-emerald-200">
              Integrated Ayurveda & Primary Family Medical Care in Mira Road.
            </p>
          </div>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Providing compassionate, evidence-informed healthcare for families across Mira Road & Thane for over 23 years. Led by Dr. Sarika B. Singh (B.A.M.S.).
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Get OPD Token Pass</span>
            </Link>

            <a
              href="https://wa.me/919820000000?text=Hello%20Dhanwantri%20Clinic,%20I%20have%20an%20enquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl transition flex items-center gap-2 border border-emerald-700"
            >
              <MessageSquare className="w-4 h-4 text-emerald-300" />
              <span>WhatsApp Inquiry</span>
            </a>
          </div>
        </div>

        {/* BACKGROUND DECORATION */}
        <div className="absolute right-[-40px] bottom-[-40px] opacity-10 text-emerald-200 pointer-events-none hidden md:block">
          <HeartPulse className="w-96 h-96" />
        </div>
      </section>

      {/* DOCTOR PROFILE SECTION */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/90 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-stone-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0B4632] text-white flex items-center justify-center text-2xl font-black shadow-md">
              <Stethoscope className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Dr. Sarika B. Singh</h2>
              <p className="text-xs font-bold text-amber-800">B.A.M.S. (Mumbai) • Reg. No. 40421</p>
              <p className="text-xs text-stone-500 mt-0.5">Senior Ayurvedic Practitioner & Family Physician</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-lg font-black text-amber-900 font-mono">23+</span>
              <span className="text-[10px] font-bold uppercase text-amber-700 block">Years Exp.</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-lg font-black text-[#0B4632] font-mono">15,000+</span>
              <span className="text-[10px] font-bold uppercase text-emerald-800 block">Patients Served</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#F6F4EE] border border-stone-200 space-y-1">
            <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0B4632]" />
              Holistic Ayurvedic Care
            </h3>
            <p className="text-[11px] text-stone-600">Specialized treatment for chronic metabolic, digestive, and lifestyle disorders.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F4EE] border border-stone-200 space-y-1">
            <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-[#0B4632]" />
              General Family Medicine
            </h3>
            <p className="text-[11px] text-stone-600">Comprehensive primary medical checkups, fever management, and wellness advice.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F4EE] border border-stone-200 space-y-1">
            <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#0B4632]" />
              Digital Prescriptions
            </h3>
            <p className="text-[11px] text-stone-600">Instant digital Rx record generation sent straight to your WhatsApp mobile.</p>
          </div>
        </div>
      </section>

      {/* OPERATING HOURS & LOCATION SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* TIMINGS */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B4632] text-white flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">OPD Timings & Hours</h3>
              <p className="text-xs text-stone-500">Walk-in OPD Sessions</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#F6F4EE] rounded-2xl border border-stone-200 flex justify-between items-center">
              <div>
                <strong className="text-stone-900 block">Morning OPD Session</strong>
                <span className="text-stone-500 text-[11px]">Monday to Saturday</span>
              </div>
              <span className="font-mono font-bold text-[#0B4632]">11:00 AM – 02:00 PM</span>
            </div>

            <div className="p-3 bg-[#F6F4EE] rounded-2xl border border-stone-200 flex justify-between items-center">
              <div>
                <strong className="text-stone-900 block">Evening OPD Session</strong>
                <span className="text-stone-500 text-[11px]">Monday to Saturday</span>
              </div>
              <span className="font-mono font-bold text-[#0B4632]">07:00 PM – 10:00 PM</span>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex justify-between items-center text-rose-800">
              <strong className="block">Sunday</strong>
              <span className="font-bold uppercase text-[11px]">Closed</span>
            </div>
          </div>
        </div>

        {/* MAP & LOCATION */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0B4632] text-white flex items-center justify-center">
                <MapPin className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Clinic Location & Directions</h3>
                <p className="text-xs text-stone-500">Mira Road East, Thane, Maharashtra</p>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=Dhanwantri+Clinic+Mira+Road"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition flex items-center gap-1"
            >
              <span>Get Directions</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* EMBEDDED GOOGLE MAP */}
          <div className="w-full h-56 rounded-2xl overflow-hidden border border-stone-200">
            <iframe
              title="Dhanwantri Clinic Map Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3766.862413241284!2d72.8625!3d19.2812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTkuMjgxMiwgNzIuODYyNQ!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
            />
          </div>

          <p className="text-xs text-stone-600 font-medium">
            <strong>Address:</strong> Shop No. 7, Priyal Enclave, Opp. R. K. Hotel, Near Shanti Park, Mira Road (East), Thane - 401107.
          </p>
        </div>
      </div>

    </div>
  );
}