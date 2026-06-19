import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "@/features/auth/store.js";
import useStudentAnalyticsStore from "@/features/student-analytics/store.js";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaUser,
  FaSync,
  FaPlayCircle,
  FaTrophy,
  FaCalendarAlt,
  FaBook,
  FaGraduationCap
} from "react-icons/fa";

function StudentDashboard() {
  const { user } = useAuthStore();
  const { analytics, loading, fetchOverview } = useStudentAnalyticsStore();
  const [stats, setStats] = useState({
    totalAssessments: 0,
    completedAssessments: 0,
    pendingAssessments: 0,
  });

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (analytics) {
      const totalEnrolled = analytics.total_assessments || 0;
      const completed = analytics.completed_assessments || 0;
      const pending = Math.max(0, totalEnrolled - completed);

      setStats({
        totalAssessments: totalEnrolled,
        completedAssessments: completed,
        pendingAssessments: pending,
      });
    }
  }, [analytics]);

const getAssessmentStatus = (assessment) => {
  if (!analytics?.recent_performance) {
    return { status: "available", color: "blue", text: "Available" };
  }

  const completedAttempt = analytics.recent_performance.find(
    (a) => a.assessment_id === assessment.id
  );

  return completedAttempt
    ? { status: "completed", color: "green", text: "Completed" }
    : { status: "available", color: "blue", text: "Available" };
};

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <LoadingSpinner size="lg" type="spinner" color="blue" />
          </div>
          <p className="text-slate-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Welcome Header */}
        <div className="mb-8 sm:mb-10">
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Student Portal</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                  <FaGraduationCap className="text-indigo-400" />
                  Welcome back, {user?.name || "Student"}!
                </h1>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                  Your personalized learning dashboard — track progress, complete assessments, and achieve excellence.
                </p>
              </div>
              <div className="hidden sm:block flex-shrink-0">
                <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-5 text-center">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25 inline-flex mb-2">
                    <FaTrophy className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-slate-300 mt-2">Keep Going!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
          {statsData.map((stat, index) => (
            <div key={index} className={stat.cardClass}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mt-0.5 mb-1">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white leading-none">{stat.value}</p>
                </div>
                <div className={stat.iconClass}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Analytics CTA */}
        <div className="mb-8 sm:mb-10">
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 overflow-hidden">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 flex-shrink-0">
                    <FaChartLine className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Performance Insights</p>
                    <h3 className="text-xl font-bold text-white mb-2">Track Your Progress</h3>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                      View detailed performance analytics, strengths, weaknesses, and personalized improvement recommendations.
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Link
                    to="/student/analytics"
                    className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <FaChartLine />
                    View Analytics
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">

          {/* Available Assessments */}
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200">
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 rounded-t-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                <FaBook className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Available Assessments</h2>
            </div>
            <div className="p-4 sm:p-6">
              {analytics?.enrolled_assessments?.length > 0 ? (
                <div className="space-y-4">
                  {analytics.enrolled_assessments.map((assessment) => {
                    const status = getAssessmentStatus(assessment);
                    return (
                      <div
                        key={assessment.id}
                        className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4 sm:p-5 hover:border-indigo-500/30 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            status.status === "completed"
                              ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25"
                              : "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25"
                          }`}>
                            {status.status === "completed" ? <FaCheckCircle className="w-4 h-4 text-white" /> : <FaClipboardList className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base text-slate-200 mb-1">
                              {assessment.title || "Untitled"}
                            </h3>
                            {assessment.prompt && (
                              <p className="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                                {assessment.prompt}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                                <FaCheckCircle className="w-2.5 h-2.5" />
                                AI-Generated
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                <FaCheckCircle className="w-2.5 h-2.5" />
                                Auto-Graded
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-700/50">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            status.status === "completed"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              : "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                          }`}>
                            {status.status === "completed" ? <FaCheckCircle className="w-2.5 h-2.5" /> : <FaClock className="w-2.5 h-2.5" />}
                            {status.text}
                          </span>
                          {status.status === "available" && (
                            <Link
                              to={`/student/assessments/${assessment.id}/take`}
                              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-lg font-semibold text-xs shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <FaPlayCircle className="w-3 h-3" />
                              Start
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                    <FaBook className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">No assessments yet</h3>
                  <p className="text-slate-400 text-sm max-w-xs">Check back later for new assessments assigned by your instructor.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200">
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 rounded-t-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                <FaCheckCircle className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            </div>
            <div className="p-4 sm:p-6">
              {analytics?.recent_performance?.length > 0 ? (
                <div className="divide-y divide-slate-700/30">
                  {analytics.recent_performance.slice(0, 5).map((attempt) => (
                    <div
                      key={attempt.assessment_id}
                      className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 hover:bg-indigo-500/5 rounded-xl px-2 transition-colors duration-150"
                    >
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 flex-shrink-0">
                        <FaCheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-200 mb-1 truncate">
                          {attempt.title || "Untitled Assessment"}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <FaCalendarAlt className="w-3 h-3" />
                          <span>Completed on {formatDate(attempt.date)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mb-6">
                    <FaCheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">No recent activity</h3>
                  <p className="text-slate-400 text-sm max-w-xs">Complete your first assessment to see it here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200">
          <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 rounded-t-2xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
              <FaTrophy className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Quick Actions</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Link
                to="/profile"
                className="flex items-center p-5 sm:p-6 bg-slate-800/60 border border-slate-700/40 rounded-xl hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-200 group"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 flex-shrink-0">
                  <FaUser className="w-5 h-5 text-white" />
                </div>
                <div className="ml-4 sm:ml-5">
                  <p className="font-semibold text-base text-slate-200 mb-0.5 group-hover:text-white transition-colors duration-150">Update Profile</p>
                  <p className="text-xs text-slate-500">Manage your personal information</p>
                </div>
              </Link>

              <button
                onClick={fetchOverview}
                className="flex items-center p-5 sm:p-6 bg-slate-800/60 border border-slate-700/40 rounded-xl hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-200 text-left group cursor-pointer w-full"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 flex-shrink-0">
                  <FaSync className="w-5 h-5 text-white" />
                </div>
                <div className="ml-4 sm:ml-5">
                  <p className="font-semibold text-base text-slate-200 mb-0.5 group-hover:text-white transition-colors duration-150">Refresh Dashboard</p>
                  <p className="text-xs text-slate-500">Update with latest data</p>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default StudentDashboard;
