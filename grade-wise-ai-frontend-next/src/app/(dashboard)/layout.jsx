"use client";

import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });

export default function DashboardLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-160px)] bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        {children}
      </main>
      <Footer />
    </>
  );
}

