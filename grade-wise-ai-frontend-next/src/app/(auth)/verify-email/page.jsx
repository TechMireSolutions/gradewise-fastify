"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const VerifyEmail = dynamic(() => import("@/views/VerifyEmail"), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner size="lg" type="spinner" color="blue" />
      </div>
    }>
      <VerifyEmail />
    </Suspense>
  );
}

