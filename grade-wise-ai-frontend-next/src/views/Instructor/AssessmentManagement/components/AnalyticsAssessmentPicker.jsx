"use client";

import { cn } from "@/lib/cn.js";
import { card, cardInteractive } from "@/lib/ui.js";
import EmptyState from "@/components/ui/EmptyState";
import { FaList, FaCalendarAlt, FaCheckCircle, FaChartBar } from "react-icons/fa";

export default function AnalyticsAssessmentPicker({
  assessments = [],
  selectedAssessmentId,
  onSelectAssessment,
}) {
  return (
    <div className={cn(card, cardInteractive, "shadow-2xl overflow-hidden")}>
      <div className="px-6 py-4 border-b border-border bg-input flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/20">
          <FaList className="text-indigo-500 dark:text-indigo-400 text-sm" />
        </div>
        <h3 className="text-xl font-bold text-foreground">My Executed Assessments</h3>
      </div>
      <div className="p-6 sm:p-8">
        {assessments.length > 0 ? (
          <div className="space-y-4">
            {assessments.map((assessment) => {
              const isSelected = assessment.id === Number(selectedAssessmentId);
              return (
                <div
                  key={assessment.id}
                  onClick={() => onSelectAssessment(assessment.id)}
                  className={cn(
                    "p-5 sm:p-6 rounded-xl border cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5",
                    isSelected
                      ? "border-indigo-500/60 bg-indigo-500/10 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30"
                      : "border-border bg-input hover:border-indigo-500/30 hover:bg-surface-elevated/40"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                        {assessment.title}
                      </h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <FaCalendarAlt className="me-2 text-indigo-500 dark:text-indigo-400" />
                        Created: {new Date(assessment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-center sm:text-end bg-gradient-to-br from-indigo-500/20 to-violet-500/20 backdrop-blur-sm border border-indigo-500/30 rounded-xl px-6 py-3">
                      <div className="text-3xl font-bold text-foreground flex items-center justify-center sm:justify-end gap-2 leading-none">
                        <FaCheckCircle className="text-emerald-500 dark:text-emerald-400 text-xl" />
                        {assessment.completed_attempts}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Completed</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={FaChartBar}
            title="No Executed Assessments"
            description="Execute an assessment to see analytics here."
          />
        )}
      </div>
    </div>
  );
}
