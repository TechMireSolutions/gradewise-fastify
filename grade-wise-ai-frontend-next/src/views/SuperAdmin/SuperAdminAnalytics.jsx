"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/cn.js";
import { card, page, pageInner } from "@/lib/ui.js";
import {
  FaChartBar,
  FaClipboardList,
  FaCheckCircle,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaCrown,
  FaSync,
  FaAward,
  FaUsers,
} from "react-icons/fa";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import MainLandmark from "@/components/layout/MainLandmark.jsx";
import PageLoader from "@/components/ui/PageLoader.jsx";
import { DashboardStatCard, DashboardStatGrid } from "@/components/dashboard/shared/index.js";
import useAdminStore from "@/features/admin/store.js";
import SuperAdminNavTabs from "./components/SuperAdminNavTabs.jsx";

export default function SuperAdminAnalytics() {
  const { overview, getAdminOverview } = useAdminStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      await getAdminOverview();
    } catch {
      // handled in store
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAdminOverview]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading && !overview) {
    return <PageLoader message="Loading platform analytics..." />;
  }

  const { users, assessments, attempts } = overview || {
    users: { total: 0, admins: 0, instructors: 0, students: 0, verified: 0, unverified: 0 },
    assessments: { total: 0, executed: 0 },
    attempts: { total: 0, completed: 0, averageScore: 0 },
  };

  const executionRate = assessments.total > 0
    ? Math.round((assessments.executed / assessments.total) * 100)
    : 0;

  const completionRate = attempts.total > 0
    ? Math.round((attempts.completed / attempts.total) * 100)
    : 0;

  const verificationRate = users.total > 0
    ? Math.round((users.verified / users.total) * 100)
    : 0;

  return (
    <div className={page}>
      <AmbientBackground />

      <MainLandmark className={pageInner}>
        <SuperAdminNavTabs />

        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Institutional Insights
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5 text-balance">
              <FaChartBar className="text-indigo-500 dark:text-indigo-400" />
              Platform Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-1 text-pretty">
              System-wide metrics across course assessments, exam attempts, and evaluation averages.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-btn-secondary hover:bg-surface-elevated text-secondary-foreground hover:text-foreground border border-border rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px] self-start sm:self-auto"
          >
            <FaSync className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Metrics"}
          </button>
        </div>

        {/* Primary KPI Grid */}
        <DashboardStatGrid columns={4}>
          <DashboardStatCard
            label="Total Assessments"
            value={assessments.total}
            icon={FaClipboardList}
            tone="indigo"
          />
          <DashboardStatCard
            label="Execution Rate"
            value={`${executionRate}%`}
            icon={FaCheckCircle}
            tone="emerald"
          />
          <DashboardStatCard
            label="Exam Attempts"
            value={attempts.total}
            icon={FaAward}
            tone="purple"
          />
          <DashboardStatCard
            label="Average Score"
            value={`${attempts.averageScore}%`}
            icon={FaChartBar}
            tone="rose"
          />
        </DashboardStatGrid>

        {/* Detailed Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 sm:mt-8">
          {/* 1. Assessment Lifecycle & Execution */}
          <div className={cn(card, "@container shadow-2xl p-6 sm:p-8")}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FaClipboardList className="text-indigo-500 dark:text-indigo-400" />
                Assessment Lifecycle
              </h2>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                {executionRate}% Live
              </span>
            </div>

            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Executed assessments have recorded student attempts and are locked from destructive modifications to preserve institutional audit integrity.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-secondary-foreground mb-1.5">
                  <span>Executed (Active Exam Sessions)</span>
                  <span className="font-bold text-foreground">{assessments.executed} / {assessments.total}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-input border border-border overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(4, executionRate))}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-input p-3.5 rounded-xl border border-border text-center">
                  <span className="text-xl font-bold text-foreground block">{assessments.executed}</span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Executed Live</span>
                </div>
                <div className="bg-input p-3.5 rounded-xl border border-border text-center">
                  <span className="text-xl font-bold text-foreground block">
                    {Math.max(0, assessments.total - assessments.executed)}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">Draft / Pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Examination Attempts & Completion */}
          <div className={cn(card, "@container shadow-2xl p-6 sm:p-8")}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FaAward className="text-emerald-500 dark:text-emerald-400" />
                Exam Attempt Completion
              </h2>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                {completionRate}% Completed
              </span>
            </div>

            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Student test submissions, completion ratios, and overall scoring health across all institutional evaluations.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-secondary-foreground mb-1.5">
                  <span>Submission Completion Ratio</span>
                  <span className="font-bold text-foreground">{attempts.completed} / {attempts.total}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-input border border-border overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(4, completionRate))}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-input p-3.5 rounded-xl border border-border text-center">
                  <span className="text-xl font-bold text-foreground block">{attempts.completed}</span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Completed Attempts</span>
                </div>
                <div className="bg-input p-3.5 rounded-xl border border-border text-center">
                  <span className="text-xl font-bold text-foreground block">{attempts.averageScore}%</span>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Mean Score</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. User Demographic Distribution */}
          <div className={cn(card, "@container shadow-2xl p-6 sm:p-8")}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FaUsers className="text-indigo-500 dark:text-indigo-400" />
                Role Demographics
              </h2>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-input border border-border text-secondary-foreground">
                {users.total} Total
              </span>
            </div>

            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Distribution of roles across administrators, instructors, and enrolled students.
            </p>

            <div className="space-y-3">
              {/* Students */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <FaGraduationCap className="text-emerald-500" /> Students
                  </span>
                  <span className="text-muted-foreground">{users.students} ({users.total > 0 ? Math.round((users.students / users.total) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-input border border-border overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${users.total > 0 ? (users.students / users.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Instructors */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <FaChalkboardTeacher className="text-indigo-500" /> Instructors
                  </span>
                  <span className="text-muted-foreground">{users.instructors} ({users.total > 0 ? Math.round((users.instructors / users.total) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-input border border-border overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${users.total > 0 ? (users.instructors / users.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Admins */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <FaCrown className="text-rose-500" /> Administrators
                  </span>
                  <span className="text-muted-foreground">{users.admins} ({users.total > 0 ? Math.round((users.admins / users.total) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-input border border-border overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${users.total > 0 ? (users.admins / users.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Verification & Platform Health */}
          <div className={cn(card, "@container shadow-2xl p-6 sm:p-8")}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FaCheckCircle className="text-sky-500 dark:text-sky-400" />
                Identity & Verification
              </h2>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/20">
                {verificationRate}% Verified
              </span>
            </div>

            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Verified email addresses vs pending activations across the institutional tenant.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-input border border-border text-center">
                <FaCheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-500 dark:text-emerald-400" />
                <span className="text-2xl font-bold text-foreground block">{users.verified}</span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Verified Accounts</span>
              </div>
              <div className="p-4 rounded-2xl bg-input border border-border text-center">
                <FaUsers className="w-6 h-6 mx-auto mb-2 text-amber-500 dark:text-amber-400" />
                <span className="text-2xl font-bold text-foreground block">{users.unverified}</span>
                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Pending Verification</span>
              </div>
            </div>
          </div>
        </div>
      </MainLandmark>
    </div>
  );
}
