"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/ProtectedRoutes"), { ssr: false });
const StudentAnalytics = dynamic(() => import("@/views/Student/StudentAnalytics"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole={"student"}>
      <StudentAnalytics />
    </ProtectedRoute>
  );
}
