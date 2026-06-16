"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/ProtectedRoutes"), { ssr: false });
const AssessmentPreview = dynamic(() => import("@/views/Instructor/AssessmentManagement/AssessmentPreview"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole={["instructor", "admin", "super_admin"]}>
      <AssessmentPreview />
    </ProtectedRoute>
  );
}
