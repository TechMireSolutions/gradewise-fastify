"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/ProtectedRoutes"), { ssr: false });
const SuperAdminApiConfig = dynamic(() => import("@/views/SuperAdmin/SuperAdminApiConfig"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole={"super_admin"}>
      <SuperAdminApiConfig />
    </ProtectedRoute>
  );
}
