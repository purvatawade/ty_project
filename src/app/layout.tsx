import type { Metadata } from "next";
import Navbar from "@/components/Navbar"; // or wherever your Navbar lives
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
        <main>{children}</main>
        {/* Footer has been completely removed */}
      </body>
    </html>
  );
}