'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HeartPulse, 
  UserPlus, 
  Users, 
  Stethoscope, 
  BarChart3,
  Calendar
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Patient Registration', icon: UserPlus },
    { href: '/reception', label: 'Reception Console', icon: Users },
    { href: '/doctor', label: 'Doctor Desk', icon: Stethoscope },
    { href: '/analytics', label: 'OPD Analytics', icon: BarChart3 },
    { href: '/appointments', label: 'Appointments', icon: Calendar },
  ];

  return (
    <header className="bg-white border-b border-stone-200/90 sticky top-0 z-50 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO BRANDING */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0B4632] text-white flex items-center justify-center shadow-md">
              <HeartPulse className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-stone-900">
                Arogya<span className="text-[#0B4632]">Setu</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                Dhanwantri Clinic
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION LINKS */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#0B4632] text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-stone-500'}`} />
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}