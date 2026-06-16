"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/ProtectedRoutes"), { ssr: false });
const AdminDashboard = dynamic(() => import("@/views/Admin/AdminDashboard"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole={"admin"}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
