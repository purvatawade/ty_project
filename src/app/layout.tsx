import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArogyaSetu - Dhanwantri Clinic",
  description: "Clinic Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50">
        <Navbar />
        <AuthGuard>
          <main>{children}</main>
        </AuthGuard>
      </body>
    </html>
  );
}