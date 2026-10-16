"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/auth/ProtectedRoute"), { ssr: false });
const Profile = dynamic(() => import("@/views/Profile"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
}
