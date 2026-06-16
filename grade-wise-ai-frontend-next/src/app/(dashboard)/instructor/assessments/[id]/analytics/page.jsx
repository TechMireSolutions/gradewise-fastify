"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/ProtectedRoutes"), { ssr: false });
const AssessmentAnalytics = dynamic(() => import("@/views/Instructor/AssessmentManagement/AssessmentAnalytics"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole={["instructor", "admin", "super_admin"]}>
      <AssessmentAnalytics />
    </ProtectedRoute>
  );
}
