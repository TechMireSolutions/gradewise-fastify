"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/ProtectedRoutes"), { ssr: false });
const TakeAssessment = dynamic(() => import("@/views/Student/AssesmentManagement/TakeAssessment"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole={"student"}>
      <TakeAssessment />
    </ProtectedRoute>
  );
}
