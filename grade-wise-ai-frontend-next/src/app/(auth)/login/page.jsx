"use client";

import dynamic from "next/dynamic";

const Login = dynamic(() => import("@/views/Auth/Login"), { ssr: false });

export default function Page() {
  return <Login />;
}

