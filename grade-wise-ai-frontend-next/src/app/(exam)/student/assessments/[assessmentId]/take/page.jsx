"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TakeAssessment from "@/views/Student/TakeAssessment";

export default function Page() {
  return (
    <ProtectedRoute requiredRole={"student"}>
      <TakeAssessment />
    </ProtectedRoute>
  );
}
