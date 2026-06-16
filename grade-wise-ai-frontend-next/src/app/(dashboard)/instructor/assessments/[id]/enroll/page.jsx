"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/ProtectedRoutes"), { ssr: false });
const EnrollStudents = dynamic(() => import("@/views/Instructor/AssessmentManagement/EnrollStudents"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole={["instructor", "admin", "super_admin"]}>
      <EnrollStudents />
    </ProtectedRoute>
  );
}
