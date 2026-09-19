import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ArogyaSetu • Dhanwantri Clinic Management System',
  description: 'Digital Outpatient Management & Smart Triage Suite for Dr. Sarika B. Singh',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#FAF8F5] text-stone-900 antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}