"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StudentAnalytics from "@/views/Student/StudentAnalytics";

export default function Page() {
  return (
    <ProtectedRoute requiredRole={"student"}>
      <StudentAnalytics />
    </ProtectedRoute>
  );
}
