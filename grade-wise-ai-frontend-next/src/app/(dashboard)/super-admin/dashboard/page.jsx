"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/ProtectedRoutes"), { ssr: false });
const SuperAdminDashboard = dynamic(() => import("@/views/SuperAdmin/SuperAdminDashboard"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole={"super_admin"}>
      <SuperAdminDashboard />
    </ProtectedRoute>
  );
}
