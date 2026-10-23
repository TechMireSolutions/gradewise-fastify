"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/auth/ProtectedRoute"), { ssr: false });
const SuperAdminSystem = dynamic(() => import("@/views/SuperAdmin/SuperAdminSystem"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole="super_admin">
      <SuperAdminSystem />
    </ProtectedRoute>
  );
}
