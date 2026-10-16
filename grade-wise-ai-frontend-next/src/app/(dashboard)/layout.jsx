"use client";

import dynamic from "next/dynamic";
import MainLandmark from "@/components/layout/MainLandmark.jsx";

const Navbar = dynamic(() => import("@/components/layout/Navbar"), { ssr: false });
const Footer = dynamic(() => import("@/components/layout/Footer"), { ssr: false });

export default function DashboardLayout({ children }) {
  return (
    <>
      <Navbar />
      <MainLandmark className="min-h-[calc(100vh-4rem)] bg-background transition-colors duration-200 safe-area-bottom">
        {children}
      </MainLandmark>
      <Footer />
    </>
  );
}
