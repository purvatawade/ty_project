import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { HeartPulse, Calendar, Users, Stethoscope } from 'lucide-react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ArogyaSetu - Clinic Management & Queue Platform',
  description: 'Smart outpatient clinic management engine and real-time triage queue system.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col`}
      >
        {/* TOP NAVIGATION BAR */}
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* BRAND LOGO */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <HeartPulse className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Arogya<span className="text-blue-600">Setu</span>
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  Dhanwantri Clinic
                </span>
              </div>
            </Link>

            {/* ROLE NAVIGATION TABS */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="hidden xs:inline">Book Slot</span>
              </Link>
              <Link
                href="/reception"
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Reception</span>
              </Link>
              <Link
                href="/doctor"
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Doctor</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* MAIN PAGE OUTLET */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}