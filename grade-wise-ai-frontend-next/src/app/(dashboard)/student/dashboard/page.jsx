"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/ProtectedRoutes"), { ssr: false });
const StudentDashboard = dynamic(() => import("@/views/Student/StudentDashboard"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole={"student"}>
      <StudentDashboard />
    </ProtectedRoute>
  );
}
