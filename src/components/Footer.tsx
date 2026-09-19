'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Clock, 
  MessageCircle, 
  Star, 
  Navigation,
  HeartPulse
} from 'lucide-react';

export default function Footer() {
  const [isOpenNow, setIsOpenNow] = useState(false);

  useEffect(() => {
    const checkOpdStatus = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday
      if (day === 0) {
        setIsOpenNow(false);
        return;
      }

      const hours = now.getHours();
      const mins = now.getMinutes();
      const currentTime = hours * 60 + mins;

      // Morning OPD: 11:00 AM (660 mins) to 2:00 PM (840 mins)
      // Evening OPD: 7:00 PM (1140 mins) to 10:00 PM (1320 mins)
      const isMorning = currentTime >= 660 && currentTime < 840;
      const isEvening = currentTime >= 1140 && currentTime < 1320;

      setIsOpenNow(isMorning || isEvening);
    };

    checkOpdStatus();
    const interval = setInterval(checkOpdStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-stone-900 text-stone-300 font-sans border-t border-stone-800 print:hidden">
      
      {/* FLOATING QUICK CONTACT BAR (MOBILE & DESKTOP) */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <a
          href="https://wa.me/919820000000?text=Hi%20Doctor%2C%20I%20have%20a%20query%20regarding%20Dhanwantri%20Clinic%20OPD"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-105"
          title="WhatsApp Quick Query"
        >
          <MessageCircle className="w-6 h-6" />
        </a>

        <a
          href="tel:+919820000000"
          className="w-12 h-12 bg-[#0B4632] hover:bg-emerald-900 text-white rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-105"
          title="Call Clinic Reception"
        >
          <Phone className="w-5 h-5" />
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CLINIC BRANDING & STATUS */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#0B4632] text-white flex items-center justify-center shadow-md">
                <HeartPulse className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">
                  DHANWANTRI <span className="text-emerald-400 font-serif italic font-normal">CLINIC</span>
                </span>
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Dr. Sarika B. Singh (B.A.M.S.)
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              Integrated Ayurveda & General Primary Medical Suite serving families across Mira Road & Thane for over 23 years.
            </p>

            {/* LIVE OPD STATUS BADGE */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-800 border border-stone-700 text-xs font-bold">
              <span className={`w-2.5 h-2.5 rounded-full ${isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className={isOpenNow ? 'text-emerald-400' : 'text-rose-400'}>
                {isOpenNow ? 'OPD Currently Open' : 'OPD Closed (Opens 11 AM & 7 PM)'}
              </span>
            </div>

            {/* SOCIAL MEDIA HANDLES */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Connect With Us:</span>
              <div className="flex items-center gap-3">
                {/* Facebook SVG */}
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Instagram SVG */}
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition"
                  title="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* YouTube SVG */}
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition"
                  title="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-xl transition flex items-center gap-1 text-xs font-bold"
                >
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>Google Reviews</span>
                </a>
              </div>
            </div>
          </div>

          {/* GOOGLE MAPS EMBEDDED LOCATION */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Clinic Location & Directions
              </span>

              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Priyal+Enclave+Mira+Road+Thane"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-[#0B4632] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-300" />
                <span>Get Directions</span>
              </a>
            </div>

            {/* EMBEDDED GOOGLE MAP */}
            <div className="w-full h-48 rounded-2xl overflow-hidden border border-stone-800 shadow-md">
              <iframe
                title="Dhanwantri Clinic Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3766.758784260021!2d72.8550183!3d19.2820251!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b04ef8231923%3A0x6a0c0a3e8bc803e5!2sMira%20Road%20East%2C%20Mira%20Bhayander%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="text-[11px] text-stone-500">
              Shop No. 7, Priyal Enclave, Opp. R. K. Hotel, Near Bharti Park, Mira Road (East), Thane - 401107
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2">
          <p>© {new Date().getFullYear()} Dhanwantri Clinic • All Rights Reserved.</p>
          <p>Powered by ArogyaSetu Medical Suite</p>
        </div>
      </div>
    </footer>
  );
}