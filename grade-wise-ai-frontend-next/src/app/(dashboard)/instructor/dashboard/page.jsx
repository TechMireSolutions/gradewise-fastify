"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/ProtectedRoutes"), { ssr: false });
const InstructorDashboard = dynamic(() => import("@/views/Instructor/InstructorDashboard"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole={["instructor", "admin", "super_admin"]}>
      <InstructorDashboard />
    </ProtectedRoute>
  );
}
