"use client";

import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(() => import("@/components/ProtectedRoutes"), { ssr: false });
const ResourceManagement = dynamic(() => import("@/views/Instructor/AssessmentManagement/ResourceManagement"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute requiredRole={["instructor", "admin", "super_admin"]}>
      <ResourceManagement />
    </ProtectedRoute>
  );
}
