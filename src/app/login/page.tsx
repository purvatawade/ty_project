'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [patientAuthMode, setPatientAuthMode] = useState<'signin' | 'signup'>('signin');
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password Visibility Toggle States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  // Enforce strictly 10 numeric digits for Patient Mobile input
  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (role === 'patient') {
      const numericVal = val.replace(/\D/g, ''); // Remove non-digit characters
      if (numericVal.length <= 10) {
        setIdentifier(numericVal);
      }
    } else {
      setIdentifier(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // 1. Mobile Number Constraint Check (10 Digits)
    if (role === 'patient' && identifier.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!identifier || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    // --- DOCTOR / ADMIN AUTHENTICATION ---
    if (role === 'doctor') {
      if (identifier.trim() === 'doctor' && password === 'admin') {
        setSuccessMsg('Doctor authenticated successfully! Redirecting...');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'doctor');

        setTimeout(() => {
          router.push('/doctor');
        }, 800);
      } else {
        setError('Invalid Doctor ID or password. (Default: ID: doctor, Password: admin)');
        setLoading(false);
      }
      return;
    }

    // --- PATIENT AUTHENTICATION ---
    if (role === 'patient') {
      // A. Patient Sign Up Logic
      if (patientAuthMode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please check and try again.');
          setLoading(false);
          return;
        }

        // Check if patient already exists in database
        const existingPassword = localStorage.getItem(`patient_db_${identifier}`);
        if (existingPassword) {
          setError('Mobile number already registered! Please sign in instead.');
          setPatientAuthMode('signin');
          setLoading(false);
          return;
        }

        // Save new patient record to database
        localStorage.setItem(`patient_db_${identifier}`, password);
        setSuccessMsg('Account registered successfully! Logging you in...');

        setTimeout(() => {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userRole', 'patient');
          localStorage.setItem('patientId', identifier);
          router.push('/');
        }, 1000);
        return;
      }

      // B. Patient Sign In Logic
      if (patientAuthMode === 'signin') {
        const storedPassword = localStorage.getItem(`patient_db_${identifier}`);

        // Patient record not found in database
        if (!storedPassword) {
          setError('Mobile number not registered in database! Please sign up first.');
          setTimeout(() => {
            setPatientAuthMode('signup');
            setPassword('');
            setConfirmPassword('');
          }, 1200);
          setLoading(false);
          return;
        }

        // Password mismatch
        if (storedPassword !== password) {
          setError('Incorrect password! Please re-check or sign up to set a new password.');
          setLoading(false);
          return;
        }

        // Successful Sign In
        setSuccessMsg('Authenticated successfully! Redirecting...');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'patient');
        localStorage.setItem('patientId', identifier);

        setTimeout(() => {
          router.push('/');
        }, 800);
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50/50 px-4">
      {/* Light Cream Container */}
      <div className="w-full max-w-md rounded-2xl bg-[#FDFBF7] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-amber-200/60 ring-1 ring-black/5">
        
        {/* Portal Title */}
        <h1 className="mb-6 text-center text-2xl font-bold tracking-tight text-slate-800">
          ArogyaSetu Access Portal
        </h1>

        {/* Role Toggle Switcher */}
        <div className="mb-5 flex rounded-xl bg-[#F5F1E8] p-1 border border-amber-100">
          <button
            type="button"
            onClick={() => {
              setRole('patient');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
              role === 'patient'
                ? 'bg-[#005f42] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Patient Portal
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('doctor');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
              role === 'doctor'
                ? 'bg-[#005f42] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Doctor / Admin
          </button>
        </div>

        {/* Patient Only: Sign In vs Sign Up Toggle */}
        {role === 'patient' && (
          <div className="mb-6 flex items-center justify-center gap-6 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => {
                setPatientAuthMode('signin');
                setError('');
                setSuccessMsg('');
              }}
              className={`text-sm font-extrabold transition-all relative ${
                patientAuthMode === 'signin'
                  ? 'text-[#005f42]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In (Existing)
              {patientAuthMode === 'signin' && (
                <span className="absolute -bottom-3 left-0 right-0 h-[2.5px] bg-[#005f42] rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setPatientAuthMode('signup');
                setError('');
                setSuccessMsg('');
              }}
              className={`text-sm font-extrabold transition-all relative ${
                patientAuthMode === 'signup'
                  ? 'text-[#005f42]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign Up (New Register)
              {patientAuthMode === 'signup' && (
                <span className="absolute -bottom-3 left-0 right-0 h-[2.5px] bg-[#005f42] rounded-full" />
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600 text-center font-semibold animate-pulse">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 text-center font-semibold">
            {successMsg}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
              {role === 'patient'
                ? 'Patient Mobile (10 Digits) *'
                : 'Doctor / Admin ID *'}
            </label>
            <input
              type="text"
              required
              placeholder={role === 'patient' ? 'e.g. 9820098200' : 'Enter doctor ID (default: doctor)'}
              value={identifier}
              onChange={handleIdentifierChange}
              className="w-full rounded-xl bg-[#F5F1E8] border border-slate-200/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#005f42] focus:outline-none focus:ring-2 focus:ring-[#005f42]/20 transition-all font-medium"
            />
          </div>

          {/* Password Input Field */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
              {role === 'patient' && patientAuthMode === 'signup'
                ? 'Set Password *'
                : 'Password *'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-[#F5F1E8] border border-slate-200/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#005f42] focus:outline-none focus:ring-2 focus:ring-[#005f42]/20 transition-all font-medium pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  /* Password visible -> Show Eye-Slash (click to hide) */
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a17.9 17.9 0 012.172-2.828m3.868-2.868A9.957 9.957 0 0112 5c7 0 10 7 10 7a18.062 18.062 0 01-2.17 2.827m-3.868 2.871L3 3l18 18M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  /* Password hidden -> Show Eye (click to make visible) */
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          {role === 'patient' && patientAuthMode === 'signup' && (
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl bg-[#F5F1E8] border border-slate-200/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#005f42] focus:outline-none focus:ring-2 focus:ring-[#005f42]/20 transition-all font-medium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none p-1"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a17.9 17.9 0 012.172-2.828m3.868-2.868A9.957 9.957 0 0112 5c7 0 10 7 10 7a18.062 18.062 0 01-2.17 2.827m-3.868 2.871L3 3l18 18M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#005f42] py-3.5 text-sm font-bold text-white transition-all hover:bg-[#004a33] active:scale-[0.99] shadow-lg hover:shadow-xl mt-2 disabled:opacity-50"
          >
            {loading
              ? 'Verifying Credentials...'
              : role === 'doctor'
              ? 'Sign In as Doctor / Admin'
              : patientAuthMode === 'signup'
              ? 'Register & Set Password'
              : 'Sign In as Patient'}
          </button>
        </form>
      </div>
    </div>
  );
}