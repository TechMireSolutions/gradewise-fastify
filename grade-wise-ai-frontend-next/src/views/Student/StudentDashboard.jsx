"use client";
import { cn } from "@/lib/cn.js";

import { card, cardHeader, cardInteractive, page } from "@/lib/ui.js";
import { useState, useEffect } from "react";
import Link from "next/link";
import useAuthStore from "@/features/auth/store.js";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AmbientBackground from "../../components/layout/AmbientBackground.jsx";
import WelcomeBanner from "../../components/layout/WelcomeBanner.jsx";
import apiClient from "@/lib/apiClient.js";
import {
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaBook,
  FaGraduationCap
} from "react-icons/fa";

function StudentDashboard() {
  const { user } = useAuthStore();
  const [assessmentsList, setAssessmentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssessments: 0,
    completedAssessments: 0,
    pendingAssessments: 0,
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const overviewRes = await apiClient.get("/student-analytics/overview");
      const overviewData = overviewRes.data?.data || overviewRes.data || {};
      
      const res = await apiClient.get("/student-analytics/assessments");
      const dataArray = res.data?.data || res.data || [];
      
      let totalCount = 0;
      let completedCount = 0;

      if (overviewData.enrolled) {
        totalCount = parseInt(overviewData.enrolled.count || overviewData.enrolled, 10) || 0;
      }
      if (overviewData.completed) {
        completedCount = parseInt(overviewData.completed.count || overviewData.completed, 10) || 0;
      }

      if (Array.isArray(dataArray) && dataArray.length > 0) {
        setAssessmentsList(dataArray);
        if (totalCount === 0) totalCount = dataArray.length;
        if (completedCount === 0) {
          completedCount = dataArray.filter(a => a.status === "completed" || a.status === "graded").length;
        }
      }

      setStats({
        totalAssessments: totalCount || dataArray.length || 0,
        completedAssessments: completedCount || 0,
        pendingAssessments: Math.max(0, totalCount - completedCount),
      });

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const statsData = [
    {
      value: stats.totalAssessments,
      label: "Total Assessments",
      icon: <FaClipboardList className="w-5 h-5 text-white" />,
      cardClass: "bg-gradient-to-br from-indigo-500/20 to-violet-500/20 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-4 sm:p-5",
      iconClass: "p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25",
    },
    {
      value: stats.completedAssessments,
      label: "Completed",
      icon: <FaCheckCircle className="w-5 h-5 text-white" />,
      cardClass: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-4 sm:p-5",
      iconClass: "p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25",
    },
    {
      value: stats.pendingAssessments,
      label: "Pending",
      icon: <FaClock className="w-5 h-5 text-white" />,
      cardClass: "bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 rounded-xl p-4 sm:p-5",
      iconClass: "p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25",
    }
  ];

  if (loading) {
    return (
      <div className={cn(page, "flex", "items-center", "justify-center")}>
        <LoadingSpinner size="lg" type="spinner" color="blue" />
      </div>
    );
  }

  return (
    <div className={page}>
      <AmbientBackground />
      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <WelcomeBanner
          eyebrow="Student Portal"
          title={`Welcome back, ${user?.name || "Student"}!`}
          description="Your personalized learning dashboard — track progress, complete assessments, and achieve excellence."
          icon={FaGraduationCap}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
          {statsData.map((stat, index) => (
            <div key={index} className={stat.cardClass}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn("text-xs", "text-muted-foreground", "mt-0.5", "mb-1")}>{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground leading-none">{stat.value}</p>
                </div>
                <div className={stat.iconClass}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={cn(card, cardInteractive, "shadow-2xl")}>
          <div className={cn(cardHeader, "flex", "items-center", "gap-3")}>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
              <FaBook className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Available Assessments</h2>
          </div>
          <div className="p-4 sm:p-6">
            {assessmentsList.length > 0 ? (
              <div className="space-y-4">
                {assessmentsList.map((assessment) => {
                  const isCompleted = assessment.status === "completed" || assessment.status === "graded";
                  return (
                    <div key={assessment.id} className="bg-input rounded-xl border border-border p-4 sm:p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base text-secondary-foreground mb-1">{assessment.title || "Untitled"}</h3>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                        <span className="text-xs font-semibold text-indigo-400">{isCompleted ? "Completed" : "Available"}</span>
                        {!isCompleted && (
                          <Link href={`/student/assessments/${assessment.id}/take`} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg font-semibold text-xs">
                            Start
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <h3 className="text-lg font-bold text-foreground mb-2">No assessments yet</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
