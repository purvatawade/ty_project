'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    router.push('/login');
  };

  const navItems = [
    { name: 'Patient Registration', href: '/', icon: '👤+' },
    { name: 'Reception Console', href: '/reception', icon: '📋' },
    { name: 'Doctor Desk', href: '/doctor', icon: '🩺' },
    { name: 'OPD Analytics', href: '/analytics', icon: '📊' },
  ];

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200/80 shadow-sm sticky top-0 z-50">
      {/* Brand Logo */}
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

      {/* Navigation Links with Dark Green Text + Bottom Underline */}
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

              {/* Dark Green Underline Bar below active text */}
              {isActive && (
                <span className="absolute -bottom-4 left-0 right-0 h-[3px] bg-[#005f42] rounded-full" />
              )}
            </Link>
          );
        })}

        {/* Dedicated Login / Logout Button */}
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="ml-4 px-4 py-2 text-sm font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className={`ml-4 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              pathname === '/login'
                ? 'bg-[#005f42] text-white shadow-md ring-2 ring-[#005f42]/30'
                : 'text-white bg-[#005f42] hover:bg-[#004a33] shadow-sm'
            }`}
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}