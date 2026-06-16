"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/ProtectedRoutes"), { ssr: false });
const AssessmentDetail = dynamic(() => import("@/views/Instructor/AssessmentManagement/AssessmentDetail"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole={["instructor", "admin", "super_admin"]}>
      <AssessmentDetail />
    </ProtectedRoute>
  );
}
