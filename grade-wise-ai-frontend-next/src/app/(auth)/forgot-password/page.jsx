"use client";

import dynamic from "next/dynamic";

const ResetPassword = dynamic(() => import("@/views/Auth/ResetPassword"), { ssr: false });

export default function Page() {
  return <ResetPassword />;
}

