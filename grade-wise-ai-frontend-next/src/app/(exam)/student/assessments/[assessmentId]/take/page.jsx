"use client";

import ProtectedRoute from "@/components/ProtectedRoutes";
import TakeAssessment from "@/views/Student/AssessmentManagement/TakeAssessment";

export default function Page() {
  return (
    <ProtectedRoute requiredRole={"student"}>
      <TakeAssessment />
    </ProtectedRoute>
  );
}
