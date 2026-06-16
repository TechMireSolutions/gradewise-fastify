"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/ProtectedRoutes"), { ssr: false });
const AssessmentList = dynamic(() => import("@/views/Instructor/AssessmentManagement/AssessmentList"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole={["instructor", "admin", "super_admin"]}>
      <AssessmentList />
    </ProtectedRoute>
  );
}
