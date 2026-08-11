"use client";

import { cn } from "@/lib/cn.js";
import { card, pageTitle, pageDesc } from "@/lib/ui.js";
import { useState, useEffect } from "react";
import Link from "next/link";
import useAssessmentsStore from "@/features/assessments/store.js";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  FaPlus,
  FaSearch,
  FaChartBar,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaList,
  FaThLarge
} from "react-icons/fa";

export default function AssessmentList() {
  const {
    assessments,
    loading,
    getInstructorAssessments,
    deleteAssessment
  } = useAssessmentsStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    if (typeof getInstructorAssessments === "function") {
      getInstructorAssessments();
    }
  }, [getInstructorAssessments]);

  const handleDelete = async (id) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this assessment?")) {
      if (typeof deleteAssessment === "function") {
        await deleteAssessment(id);
      }
    }
  };

  const filteredAssessments = Array.isArray(assessments)
    ? assessments.filter((a) =>
        a?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" type="spinner" color="blue" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={pageTitle}>Assessments</h1>
          <p className={pageDesc}>Manage and monitor created assessments</p>
        </div>
        <Link
          href="/instructor/assessments/create"
          className={cn(
            "inline-flex items-center justify-center gap-2 px-5 py-2.5",
            "bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold",
            "rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all text-sm"
          )}
        >
          <FaPlus /> Create Assessment
        </Link>
      </div>

      <div className={cn("mb-6", card, "shadow-xl", "p-5")}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-input border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-2.5 rounded-xl border border-border text-sm transition-colors",
                viewMode === "table" ? "bg-indigo-500/10 border-indigo-500 text-indigo-400" : "text-muted-foreground hover:bg-input"
              )}
            >
              <FaList />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2.5 rounded-xl border border-border text-sm transition-colors",
                viewMode === "grid" ? "bg-indigo-500/10 border-indigo-500 text-indigo-400" : "text-muted-foreground hover:bg-input"
              )}
            >
              <FaThLarge />
            </button>
          </div>
        </div>
      </div>

      {filteredAssessments.length === 0 ? (
        <div className={cn(card, "p-12 text-center text-muted-foreground")}>
          No assessments found.
        </div>
      ) : viewMode === "table" ? (
        <div className={cn(card, "overflow-hidden shadow-xl")}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-input/50">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">Title</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">Created</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAssessments.map((assessment) => (
                  <tr key={assessment.id} className="hover:bg-indigo-500/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      {assessment.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 text-right pr-6 space-x-2">
                      <Link
                        href={`/instructor/assessments/${assessment.id}/analytics`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-btn-secondary hover:bg-indigo-500/20 border border-border hover:border-indigo-500/40 text-secondary-foreground hover:text-indigo-300 rounded-lg font-medium text-xs transition-all duration-200 cursor-pointer"
                      >
                        <FaChartBar /> Analytics
                      </Link>
                      <Link
                        href={`/instructor/assessments/${assessment.id}/enroll`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-btn-secondary hover:bg-emerald-500/20 border border-border hover:border-emerald-500/40 text-secondary-foreground hover:text-emerald-300 rounded-lg font-medium text-xs transition-all duration-200 cursor-pointer"
                      >
                        <FaUserPlus /> Enroll
                      </Link>
                      <Link
                        href={`/instructor/assessments/${assessment.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-btn-secondary hover:bg-violet-500/20 border border-border hover:border-violet-500/40 text-secondary-foreground hover:text-violet-300 rounded-lg font-medium text-xs transition-all duration-200 cursor-pointer"
                      >
                        <FaEdit /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(assessment.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-btn-secondary hover:bg-amber-500/20 border border-border hover:border-amber-500/40 text-secondary-foreground hover:text-amber-300 rounded-lg font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map((assessment) => (
            <div key={assessment.id} className={cn(card, "p-6 flex flex-col justify-between space-y-4 shadow-xl")}>
              <div>
                <h3 className="font-semibold text-secondary-foreground truncate">{assessment.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Created: {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : "—"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                <Link
                  href={`/instructor/assessments/${assessment.id}/analytics`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-btn-secondary hover:bg-indigo-500/20 border border-border hover:border-indigo-500/40 text-secondary-foreground hover:text-indigo-300 rounded-xl font-medium transition-all duration-200 cursor-pointer"
                >
                  <FaChartBar /> Analytics
                </Link>
                <Link
                  href={`/instructor/assessments/${assessment.id}/enroll`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-btn-secondary hover:bg-emerald-500/20 border border-border hover:border-emerald-500/40 text-secondary-foreground hover:text-emerald-300 rounded-xl font-medium transition-all duration-200 cursor-pointer"
                >
                  <FaUserPlus /> Enroll
                </Link>
                <Link
                  href={`/instructor/assessments/${assessment.id}/edit`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-btn-secondary hover:bg-violet-500/20 border border-border hover:border-violet-500/40 text-secondary-foreground hover:text-violet-300 rounded-xl font-medium transition-all duration-200 cursor-pointer"
                >
                  <FaEdit /> Edit
                </Link>
                <button
                  onClick={() => handleDelete(assessment.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-btn-secondary hover:bg-amber-500/20 border border-border hover:border-amber-500/40 text-secondary-foreground hover:text-amber-300 rounded-xl font-medium transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
