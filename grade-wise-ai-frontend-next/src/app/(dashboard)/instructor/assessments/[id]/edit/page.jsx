"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/ProtectedRoutes"), { ssr: false });
const EditAssessment = dynamic(() => import("@/views/Instructor/AssessmentManagement/EditAssessment"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole={["instructor", "admin", "super_admin"]}>
      <EditAssessment />
    </ProtectedRoute>
  );
}
