"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/ProtectedRoutes"), { ssr: false });
const CreateAssessment = dynamic(() => import("@/views/Instructor/AssessmentManagement/CreateAssessment"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole={["instructor", "admin", "super_admin"]}>
      <CreateAssessment />
    </ProtectedRoute>
  );
}
