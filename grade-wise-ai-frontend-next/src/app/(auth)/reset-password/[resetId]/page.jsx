"use client";

import dynamic from "next/dynamic";

const SetNewPassword = dynamic(() => import("@/views/SetNewPassword"), { ssr: false });

export default function Page() {
  return <SetNewPassword />;
}

