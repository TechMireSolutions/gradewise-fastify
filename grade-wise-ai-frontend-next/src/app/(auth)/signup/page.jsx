"use client";

import dynamic from "next/dynamic";

const Signup = dynamic(() => import("@/views/Auth/Signup"), { ssr: false });

export default function Page() {
  return <Signup />;
}

