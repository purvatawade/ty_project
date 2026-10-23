'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-sky-400">
        ArogyaSetu
      </Link>

      <nav className="flex items-center space-x-6 text-sm font-medium">
        {/* PUBLIC & CLIENT (PATIENT) ACCESSIBLE ROUTES */}
        <Link href="/" className="text-slate-300 hover:text-sky-400 transition">
          Book OPD Slot
        </Link>
        <Link href="/clinic" className="text-slate-300 hover:text-sky-400 transition">
          Doctor Profile & Clinic
        </Link>

        {/* ADMIN (DOCTOR / STAFF ONLY) ROUTES - HIDDEN FROM PATIENTS */}
        {user?.role === 'admin' && (
          <>
            <Link
              href="/doctor-workspace"
              className="text-emerald-400 hover:text-emerald-300 transition"
            >
              Doctor Desk
            </Link>
            <Link
              href="/reception"
              className="text-emerald-400 hover:text-emerald-300 transition"
            >
              Reception & Triage
            </Link>
            <Link
              href="/prescription"
              className="text-emerald-400 hover:text-emerald-300 transition"
            >
              Prescriptions
            </Link>
            <Link
              href="/analytics"
              className="text-amber-400 hover:text-amber-300 transition"
            >
              OPD Analytics
            </Link>
          </>
        )}

        {/* LOGIN / LOGOUT USER CONTROL */}
        {user ? (
          <div className="flex items-center gap-3 ml-4">
            <span className="text-xs px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sky-300">
              {user.role === 'admin' ? 'Doctor / Admin' : 'Patient'}
            </span>
            <button
              onClick={logout}
              className="bg-red-600/80 hover:bg-red-600 text-white px-3 py-1.5 rounded transition text-xs"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-1.5 rounded transition ml-4"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}