"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/auth/ProtectedRoute"), { ssr: false });
const AdminDashboard = dynamic(() => import("@/views/Admin/AdminDashboard"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole={["admin", "super_admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
