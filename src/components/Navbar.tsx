'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  // Helper function to check active path
  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-[#0D1520] text-white border-b border-slate-800 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO & BRAND */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300 shadow-lg shadow-emerald-500/10">
            💚
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              ArogyaSetu
            </span>
            <span className="block text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest -mt-1">
              Medical Suite
            </span>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-bold">
          
          {/* PUBLIC & PATIENT ACCESSIBLE ROUTES */}
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
              isActive('/')
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>Book OPD Slot</span>
          </Link>

          <Link
            href="/patient-queue"
            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
              isActive('/patient-queue')
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>Live Queue Tracker</span>
          </Link>

          <Link
            href="/clinic"
            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
              isActive('/clinic')
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>Doctor Profile &amp; Clinic</span>
          </Link>

          {/* DOCTOR / ADMIN DROPDOWN & EXCLUSIVE ROUTES */}
          {user?.role === 'admin' && (
            <div className="relative">
              <button
                onClick={() => setWorkspaceOpen(!workspaceOpen)}
                onBlur={() => setTimeout(() => setWorkspaceOpen(false), 200)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                  pathname.startsWith('/doctor') || pathname === '/reception' || pathname === '/prescription' || pathname === '/analytics'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>Doctor Console</span>
                <span className={`text-xs transition-transform duration-200 ${workspaceOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* DROPDOWN MENU */}
              {workspaceOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    href="/doctor-workspace"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 transition"
                  >
                    <span>🩺</span>
                    <span>Doctor Desk</span>
                  </Link>

                  <Link
                    href="/reception"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 transition"
                  >
                    <span>👥</span>
                    <span>Reception &amp; Triage</span>
                  </Link>

                  <Link
                    href="/prescription"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 transition"
                  >
                    <span>💊</span>
                    <span>Prescriptions</span>
                  </Link>

                  <Link
                    href="/analytics"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-amber-50 hover:text-amber-900 transition"
                  >
                    <span>📊</span>
                    <span>OPD Analytics</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* RIGHT CTA BUTTON & ROLE BADGE */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex px-3 py-1 bg-slate-800/80 border border-slate-700/80 text-emerald-400 text-xs font-extrabold rounded-full">
                {user.role === 'admin' ? 'Doctor / Admin' : 'Patient'}
              </span>
              <button
                onClick={logout}
                className="bg-rose-600/90 hover:bg-rose-600 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-rose-950/20 text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/20 text-sm tracking-wide"
            >
              Portal Access →
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}