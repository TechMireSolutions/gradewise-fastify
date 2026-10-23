"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/auth/ProtectedRoute"), { ssr: false });
const SuperAdminAnalytics = dynamic(() => import("@/views/SuperAdmin/SuperAdminAnalytics"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole="super_admin">
      <SuperAdminAnalytics />
    </ProtectedRoute>
  );
}
