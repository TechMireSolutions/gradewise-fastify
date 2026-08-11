import ProtectedRoute from "@/components/ProtectedRoutes";
import StudentDashboard from "@/views/Student/StudentDashboard";

// Force Next.js to bypass static site generation directly on the server level
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <ProtectedRoute requiredRole={"student"}>
      <StudentDashboard />
    </ProtectedRoute>
  );
}
