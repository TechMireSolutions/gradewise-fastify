"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/auth/ProtectedRoute"), { ssr: false });
const SuperAdminUsers = dynamic(() => import("@/views/SuperAdmin/SuperAdminUsers"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole="super_admin">
      <SuperAdminUsers />
    </ProtectedRoute>
  );
}
