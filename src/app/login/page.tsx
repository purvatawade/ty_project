'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('Please fill in all fields.');
      return;
    }

    // Store user login session
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);

    // Redirect based on role
    if (role === 'doctor') {
      router.push('/doctor');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50/50 px-4">
      {/* Perfectly Centered Light Cream Container */}
      <div className="w-full max-w-md rounded-2xl bg-[#FDFBF7] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-amber-200/60 ring-1 ring-black/5">
        
        {/* Header Title */}
        <h1 className="mb-6 text-center text-2xl font-bold tracking-tight text-slate-800">
          ArogyaSetu Access Portal
        </h1>

        {/* Tab Switcher */}
        <div className="mb-6 flex rounded-xl bg-[#F5F1E8] p-1 border border-amber-100">
          <button
            type="button"
            onClick={() => { setRole('patient'); setError(''); }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
              role === 'patient'
                ? 'bg-[#005f42] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Patient Login
          </button>
          <button
            type="button"
            onClick={() => { setRole('doctor'); setError(''); }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
              role === 'doctor'
                ? 'bg-[#005f42] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Doctor / Admin
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600 text-center font-semibold">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
              {role === 'patient' ? 'Patient Mobile / ID *' : 'Doctor / Admin ID *'}
            </label>
            <input
              type="text"
              required
              placeholder={role === 'patient' ? 'e.g. 9820098200' : 'e.g. DOC-102'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-xl bg-[#F5F1E8] border border-slate-200/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#005f42] focus:outline-none focus:ring-2 focus:ring-[#005f42]/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
              Password *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-[#F5F1E8] border border-slate-200/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#005f42] focus:outline-none focus:ring-2 focus:ring-[#005f42]/20 transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#005f42] py-3.5 text-sm font-bold text-white transition-all hover:bg-[#004a33] active:scale-[0.99] shadow-lg hover:shadow-xl"
          >
            Sign In as {role === 'patient' ? 'Patient' : 'Doctor / Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}