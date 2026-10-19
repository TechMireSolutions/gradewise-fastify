"use client";

import { cn } from "@/lib/cn.js";
import { accentPanel, btn, card, cardInteractive, statSurface, tableHead, tableRowHover } from "@/lib/ui.js";
import EmptyState from "@/components/ui/EmptyState";
import { FaUsers, FaEye } from "react-icons/fa";

export default function AnalyticsStudentTable({
  students = [],
  assessmentTitle = "",
  onViewStudentAnswers,
}) {
  return (
    <div>
      {/* Desktop Table */}
      <div className="hidden lg:block mb-10">
        <div className={cn(card, cardInteractive, "shadow-2xl overflow-hidden")}>
          <div className="px-6 py-4 border-b border-border bg-input flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/15 border border-violet-500/20">
              <FaUsers className="text-violet-400 text-sm" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {assessmentTitle || "Enrolled Students Results"}
            </h3>
          </div>
          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className={tableHead}>
                    <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Questions
                    </th>
                    <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Correct
                    </th>
                    <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Time Used
                    </th>
                    <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((s) => (
                    <tr key={s.student_id} className={cn(tableRowHover, "transition-colors duration-150")}>
                      <td className="px-6 py-4 font-semibold text-foreground text-sm">
                        {s.name || `Student ${s.student_id}`}
                      </td>
                      <td className="px-6 py-4 text-secondary-foreground font-medium text-sm">
                        {s.total_questions || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          {s.correct_answers || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                          {s.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-secondary-foreground text-sm">
                        {s.time_used}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => onViewStudentAnswers(s.student_id)}
                          className={cn(btn.primary, "px-5 py-2.5 min-h-11 inline-flex items-center gap-2 cursor-pointer")}
                        >
                          <FaEye /> View Answers
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={FaUsers}
              title="No Students Yet"
              description="No students have completed this assessment."
            />
          )}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 mb-10">
        {students.length > 0 ? (
          students.map((s) => (
            <div
              key={s.student_id}
              style={{ contentVisibility: "auto", containIntrinsicSize: "auto 240px" }}
              className={cn(card, cardInteractive, "shadow-2xl p-5")}
            >
              <div className={cn(accentPanel, "rounded-xl p-4 mb-4")}>
                <h4 className="font-bold text-lg text-white">
                  {s.name || `Student ${s.student_id}`}
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-input rounded-xl border border-border p-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1">
                    Questions
                  </span>
                  <span className="text-xl font-bold text-foreground">{s.total_questions}</span>
                </div>
                <div className={cn(statSurface.emerald, "p-3")}>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1">
                    Correct
                  </span>
                  <span className="text-xl font-bold text-emerald-400">{s.correct_answers}</span>
                </div>
                <div className={cn(statSurface.indigo, "p-3")}>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1">
                    Score
                  </span>
                  <span className="text-xl font-bold text-indigo-400">{s.percentage}%</span>
                </div>
                <div className="bg-input rounded-xl border border-border p-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1">
                    Time
                  </span>
                  <span className="text-xl font-bold text-foreground">{s.time_used}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onViewStudentAnswers(s.student_id)}
                className={cn(btn.primary, "w-full py-3 px-5 min-h-11 flex items-center justify-center gap-2 cursor-pointer")}
              >
                <FaEye /> View Detailed Answers
              </button>
            </div>
          ))
        ) : (
          <EmptyState
            icon={FaUsers}
            title="No Results Yet"
            description="No students have completed this assessment yet."
          />
        )}
      </div>
    </div>
  );
}
