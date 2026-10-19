"use client";

import { page } from "@/lib/ui.js";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import useStudentDashboard from "./hooks/useStudentDashboard.js";
import StudentHeader from "./components/StudentHeader.jsx";
import StudentStats from "./components/StudentStats.jsx";
import StudentAssessmentsList from "./components/StudentAssessmentsList.jsx";

function StudentDashboard() {
  const { user, assessments, stats, loading } = useStudentDashboard();

  return (
    <div className={page}>
      <AmbientBackground />

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <StudentHeader userName={user?.name} />

        <StudentStats
          stats={stats}
          loading={loading}
        />

        <StudentAssessmentsList
          assessments={assessments}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default StudentDashboard;
