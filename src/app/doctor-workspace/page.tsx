'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DoctorWorkspacePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/'); // Redirect Patients to home page
      }
    }
  }, [user, loading, router]);

  if (loading || user?.role !== 'admin') {
    return <div className="p-8 text-center text-slate-400">Verifying access...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-emerald-400 mb-4">
        Doctor Workspace & Voice Dictation Desk
      </h1>
      <p className="text-slate-300">
        Welcome, {user.name}. Full access to live queue, prescription engine, and analytics.
      </p>
    </div>
  );
}