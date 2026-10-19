"use client";

import { cn } from "@/lib/cn.js";
import { card, cardInteractive } from "@/lib/ui.js";
import { FaTable, FaArrowUp } from "react-icons/fa";

export const isAnswerCorrect = (correct, student) => {
  if (!student) return false;

  let c = String(correct || "").trim();
  let s = String(student || "").trim();

  c = c.replace(/\\"/g, '"').replace(/^["'\s]+|["'\s]+$/g, "").trim();
  s = s.replace(/\\"/g, '"').replace(/^["'\s]+|["'\s]+$/g, "").trim();

  return c.toLowerCase() === s.toLowerCase();
};

export default function AnalyticsQuestionReview({
  studentQuestions = [],
  onScrollToAssessments,
}) {
  if (!studentQuestions || studentQuestions.length === 0) return null;

  return (
    <div className="animate-fade-in relative">
      {/* Floating Back Arrow */}
      <button
        type="button"
        onClick={onScrollToAssessments}
        className="fixed left-1/2 -translate-x-1/2 top-24 z-40 group animate-fade-in cursor-pointer"
        aria-label="Back to assessments"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
          <div className="relative bg-gradient-to-r from-indigo-500 to-violet-600 p-4 rounded-full shadow-2xl shadow-indigo-500/30 transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1">
            <FaArrowUp className="text-white text-2xl" />
          </div>
        </div>
        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-surface-elevated border border-border text-secondary-foreground px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform group-hover:translate-y-1 shadow-2xl">
          Back to Assessments
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-border" />
        </div>
      </button>

      <div className={cn(card, cardInteractive, "shadow-2xl mt-10 overflow-hidden")}>
        <div className="px-6 py-4 border-b border-border bg-input flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/15 border border-violet-500/20">
            <FaTable className="text-violet-400 text-sm" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Student Answer Details</h3>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {studentQuestions.map((q, i) => {
            const isCorrect = isAnswerCorrect(q.correct_answer, q.student_answer);

            let parsedOptions = [];
            if (q.options) {
              if (typeof q.options === "string") {
                try {
                  parsedOptions = JSON.parse(q.options);
                } catch {
                  parsedOptions = [];
                }
              } else if (Array.isArray(q.options)) {
                parsedOptions = q.options;
              }
            }

            return (
              <div
                key={i}
                style={{ contentVisibility: "auto", containIntrinsicSize: "auto 180px" }}
                className="bg-input border border-border rounded-xl p-5 sm:p-6 hover:border-indigo-500/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-bold text-lg text-foreground flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                      Question {q.question_order || i + 1}
                    </span>
                    <span className="text-sm font-normal text-muted-foreground capitalize">
                      ({q.question_type?.replace(/_/g, " ")})
                    </span>
                  </h4>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 mb-4">
                  <p className="text-secondary-foreground font-medium leading-relaxed">
                    {q.question_text}
                  </p>
                </div>

                {parsedOptions.length > 0 && (
                  <div className="mb-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                    <strong className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2">
                      Options:
                    </strong>
                    <ul className="space-y-1.5">
                      {parsedOptions.map((opt, idx) => (
                        <li key={idx} className="text-sm text-secondary-foreground flex items-start gap-2">
                          <span className="text-indigo-400 font-bold mt-0.5">•</span>
                          <span>{opt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-4">
                    <strong className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2">
                      Correct Answer
                    </strong>
                    <p className="font-bold text-base text-emerald-400">
                      {q.question_type === "true_false"
                        ? q.correct_answer === true || q.correct_answer === "true"
                          ? "True"
                          : "False"
                        : q.correct_answer || "N/A"}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "border rounded-xl p-4 backdrop-blur-sm",
                      isCorrect
                        ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30"
                        : "bg-gradient-to-br from-red-500/20 to-rose-500/20 border-red-500/30"
                    )}
                  >
                    <strong className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2">
                      Student Answer
                    </strong>
                    <p className={cn("font-bold text-base", isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400")}>
                      {q.question_type === "true_false"
                        ? q.student_answer === true || q.student_answer === "true"
                          ? "True"
                          : "False"
                        : q.student_answer || "—"}
                    </p>
                  </div>

                  <div className="bg-input border border-border rounded-xl p-4">
                    <strong className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2">
                      Score Awarded
                    </strong>
                    <p className="font-bold text-base text-foreground">
                      {isCorrect
                        ? `+${q.positive_marks || 1}`
                        : `${q.score ?? -Math.abs(q.negative_marks || 0)}`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
