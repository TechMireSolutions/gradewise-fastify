"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/ProtectedRoutes"), { ssr: false });
const AddStudent = dynamic(() => import("@/views/Instructor/AddStudent"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole={["instructor", "admin", "super_admin"]}>
      <AddStudent />
    </ProtectedRoute>
  );
}
