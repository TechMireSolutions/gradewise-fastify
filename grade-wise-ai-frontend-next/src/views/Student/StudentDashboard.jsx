"use client";

import { page, pageInner } from "@/lib/ui.js";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import MainLandmark from "@/components/layout/MainLandmark.jsx";
import useStudentDashboard from "./hooks/useStudentDashboard.js";
import StudentHeader from "./components/StudentHeader.jsx";
import StudentStats from "./components/StudentStats.jsx";
import StudentAssessmentsList from "./components/StudentAssessmentsList.jsx";

function StudentDashboard() {
  const { user, assessments, stats, loading } = useStudentDashboard();

  return (
    <div className={page}>
      <AmbientBackground />

      <MainLandmark className={pageInner}>
        <StudentHeader userName={user?.name} />

        <StudentStats
          stats={stats}
          loading={loading}
        />

        <StudentAssessmentsList
          assessments={assessments}
          loading={loading}
        />
      </MainLandmark>
    </div>
  );
}

export default StudentDashboard;
