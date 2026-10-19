import { useState, useEffect, useCallback } from "react";
import useAuthStore from "@/features/auth/store.js";
import useStudentAnalyticsStore from "@/features/student-analytics/store.js";

export default function useStudentDashboard() {
  const { user } = useAuthStore();
  const {
    assessments: storeAssessments,
    stats: storeStats,
    hasLoaded,
    loading: storeLoading,
    fetchStudentDashboardData,
  } = useStudentAnalyticsStore();

  const hasInitialData = Boolean(
    hasLoaded || (storeAssessments && storeAssessments.length > 0)
  );

  const [assessmentsList, setAssessmentsList] = useState(() => storeAssessments || []);
  const [stats, setStats] = useState(() => storeStats || {
    totalAssessments: 0,
    completedAssessments: 0,
    pendingAssessments: 0,
  });

  const loadDashboardData = useCallback(async () => {
    try {
      const data = await fetchStudentDashboardData();
      setAssessmentsList(data.assessments || []);
      setStats(
        data.stats || {
          totalAssessments: 0,
          completedAssessments: 0,
          pendingAssessments: 0,
        }
      );
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  }, [fetchStudentDashboardData]);

  useEffect(() => {
    if (!hasInitialData) {
      loadDashboardData();
    } else {
      setAssessmentsList(storeAssessments);
      setStats(storeStats);
      loadDashboardData();
    }
  }, [hasInitialData, loadDashboardData, storeAssessments, storeStats]);

  return {
    user,
    assessments: assessmentsList,
    stats,
    loading: storeLoading && !hasInitialData,
    refresh: loadDashboardData,
  };
}
