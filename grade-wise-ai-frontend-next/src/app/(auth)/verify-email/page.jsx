"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const VerifyEmail = dynamic(() => import("@/views/VerifyEmail"), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner size="lg" type="spinner" color="blue" />
      </div>
    }>
      <VerifyEmail />
    </Suspense>
  );
}

