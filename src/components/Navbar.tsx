'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <Link href="/" className="text-xl font-bold text-emerald-400 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 text-sm">
          💚
        </span>
        <span>ArogyaSetu</span>
      </Link>

      <nav className="flex items-center space-x-6 text-sm font-semibold">
        {/* PUBLIC & PATIENT ACCESSIBLE ROUTES */}
        <Link href="/" className="text-slate-300 hover:text-emerald-400 transition">
          Book OPD Slot
        </Link>
        <Link href="/clinic" className="text-slate-300 hover:text-emerald-400 transition">
          Doctor Profile &amp; Clinic
        </Link>

        {/* ADMIN (DOCTOR / STAFF ONLY) ROUTES */}
        {user?.role === 'admin' && (
          <>
            <Link href="/doctor-workspace" className="text-emerald-400 hover:text-emerald-300 transition">
              Doctor Desk
            </Link>
            <Link href="/reception" className="text-emerald-400 hover:text-emerald-300 transition">
              Reception &amp; Triage
            </Link>
            <Link href="/prescription" className="text-emerald-400 hover:text-emerald-300 transition">
              Prescriptions
            </Link>
            <Link href="/analytics" className="text-amber-400 hover:text-amber-300 transition">
              OPD Analytics
            </Link>
          </>
        )}

        {/* USER CONTROL */}
        {user ? (
          <div className="flex items-center gap-3 ml-4">
            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-md">
              {user.role === 'admin' ? 'Doctor / Admin' : 'Patient'}
            </span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-bold"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition ml-4 shadow-sm"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}