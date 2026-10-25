'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole');
    setIsLoggedIn(loggedIn);
    setUserRole(role);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserRole(null);
    router.replace('/login');
  };

  if (pathname === '/login') {
    return null;
  }

  // Doctor/Admin see full console; Patient sees Appointment Booking & Queue Tracker
  const navItems =
    userRole === 'doctor'
      ? [
          { name: 'Book Appointment', href: '/', icon: '📅' },
          { name: 'Reception Console', href: '/reception', icon: '📋' },
          { name: 'Doctor Desk', href: '/doctor', icon: '🩺' },
          { name: 'Analytics', href: '/analytics', icon: '📊' },
        ]
      : [
          { name: 'Book Appointment', href: '/', icon: '📅' },
          { name: 'Live Queue Tracker', href: '/queue', icon: '⏱️' },
        ];

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200/80 shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#005f42] text-white font-bold shadow-md transition-transform group-hover:scale-105">
            <span className="text-xl">🩺</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-slate-800">
              ArogyaSetu
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[#005f42] bg-[#005f42]/10 rounded-full border border-[#005f42]/20 uppercase">
              Dhanwantri Clinic
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex items-center gap-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-2 py-2 text-sm font-bold transition-colors duration-150 ${
                isActive
                  ? 'text-[#005f42]'
                  : 'text-slate-600 hover:text-[#005f42]'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>

              {isActive && (
                <span className="absolute -bottom-4 left-0 right-0 h-[3px] bg-[#005f42] rounded-full" />
              )}
            </Link>
          );
        })}

        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="ml-4 px-5 py-2 text-sm font-bold text-white bg-red-700 rounded-xl hover:bg-red-800 transition-colors shadow-sm active:scale-95"
          >
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}