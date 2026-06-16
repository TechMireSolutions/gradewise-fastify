"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/ProtectedRoutes"), { ssr: false });
const StudentDashboard = dynamic(() => import("@/views/Student/StudentDashborad"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole={"student"}>
      <StudentDashboard />
    </ProtectedRoute>
  );
}
