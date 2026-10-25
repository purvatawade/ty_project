'use client';

import React, { useState } from 'react';
import { useAuth, UserRole } from '@/lib/AuthContext';

export default function LoginPage() {
  const [roleTab, setRoleTab] = useState<UserRole>('client');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Role-based authentication logic
    if (roleTab === 'admin' && username === 'doctor' && password === 'admin123') {
      login({ id: 'ADM-01', name: 'Dr. Sharma', role: 'admin' });
    } else if (roleTab === 'client' && username && password) {
      login({ id: 'PAT-01', name: username, role: 'client' });
    } else if (roleTab === 'admin') {
      setError('Invalid Doctor credentials. (Demo login: doctor / admin123)');
    } else {
      setError('Please enter valid Patient login details.');
    }
  };

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 w-full max-w-md shadow-2xl">
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          ArogyaSetu Access Portal
        </h1>

        {/* ROLE SELECTION TABS */}
        <div className="grid grid-cols-2 gap-2 bg-slate-800 p-1 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => {
              setRoleTab('client');
              setError('');
            }}
            className={`py-2 text-sm font-semibold rounded-md transition ${
              roleTab === 'client'
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Patient Login
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleTab('admin');
              setError('');
            }}
            className={`py-2 text-sm font-semibold rounded-md transition ${
              roleTab === 'admin'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Doctor / Admin
          </button>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-800 text-red-200 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {roleTab === 'admin' ? 'Doctor Username' : 'Patient Mobile / ID'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={roleTab === 'admin' ? 'doctor' : 'Enter mobile number'}
              className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-md focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-md focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 rounded-md font-bold text-white transition ${
              roleTab === 'admin'
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-sky-600 hover:bg-sky-500'
            }`}
          >
            Sign In as {roleTab === 'admin' ? 'Doctor' : 'Patient'}
          </button>
        </form>
      </div>
    </div>
  );
}