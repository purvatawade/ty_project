'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // If user is not logged in and trying to access any page except /login
    if (!isLoggedIn && pathname !== '/login') {
      setIsAuthorized(false);
      router.replace('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  // Prevent flash of protected content before redirect completes
  if (!isAuthorized && pathname !== '/login') {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
          <span className="animate-spin text-xl text-[#005f42]">⏳</span>
          Checking session...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}