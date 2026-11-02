"use client";

import { cn } from "@/lib/cn.js";
import { btn } from "@/lib/ui.js";
import { useState } from "react";
import {
  FaPlus,
  FaTrash,
  FaArrowLeft,
  FaDownload,
  FaFileAlt,
} from "react-icons/fa";
import LoadingSpinner from "@/components/ui/LoadingSpinner.jsx";

const QUESTION_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice (MCQ)" },
  { value: "short_answer", label: "Short Answer" },
  { value: "true_false", label: "True / False" },
  { value: "fill_in_the_blank", label: "Fill in the Blank" },
];

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function PaperQuestionsEditor({
  questions = [],
  onChangeQuestions,
  onSaveAndDownload,
  onCancel,
  loading = false,
  language = "en",
  assessmentTitle = "",
}) {
  const [localQuestions, setLocalQuestions] = useState(() => {
    if (questions && questions.length > 0) return JSON.parse(JSON.stringify(questions));
    return [
      {
        questionNumber: 1,
        questionText: "",
        questionType: "multiple_choice",
        options: ["Option A", "Option B", "Option C", "Option D"],
        marks: 1,
      },
    ];
  });

  const isRtl = ["ur", "ar", "fa"].includes(language?.toLowerCase());
  const isQuranic = ["ar", "fa", "ur"].includes(language?.toLowerCase());

  const handleUpdate = (updated) => {
    setLocalQuestions(updated);
    if (typeof onChangeQuestions === "function") {
      onChangeQuestions(updated);
    }
  };

  const handleQuestionTextChange = (idx, text) => {
    const next = [...localQuestions];
    next[idx] = { ...next[idx], questionText: text };
    handleUpdate(next);
  };

  const handleQuestionTypeChange = (idx, type) => {
    const next = [...localQuestions];
    const current = next[idx];
    let options = current.options;

    if (type === "multiple_choice" && (!options || options.length < 2)) {
      options = ["Option A", "Option B", "Option C", "Option D"];
    } else if (type === "true_false") {
      options = ["True", "False"];
    } else if (["short_answer", "fill_in_the_blank"].includes(type)) {
      options = undefined;
    }

    next[idx] = { ...current, questionType: type, options };
    handleUpdate(next);
  };

  const handleMarksChange = (idx, marksVal) => {
    const num = Math.max(0.5, Number(marksVal) || 1);
    const next = [...localQuestions];
    next[idx] = { ...next[idx], marks: num };
    handleUpdate(next);
  };

  const handleOptionChange = (qIdx, optIdx, optVal) => {
    const next = [...localQuestions];
    const q = { ...next[qIdx] };
    const opts = [...(q.options || [])];
    opts[optIdx] = optVal;
    q.options = opts;
    next[qIdx] = q;
    handleUpdate(next);
  };

  const handleAddOption = (qIdx) => {
    const next = [...localQuestions];
    const q = { ...next[qIdx] };
    const opts = [...(q.options || [])];
    if (opts.length >= 8) return;
    const nextLetter = OPTION_LETTERS[opts.length] || `Option ${opts.length + 1}`;
    opts.push(`Option ${nextLetter}`);
    q.options = opts;
    next[qIdx] = q;
    handleUpdate(next);
  };

  const handleRemoveOption = (qIdx, optIdx) => {
    const next = [...localQuestions];
    const q = { ...next[qIdx] };
    const opts = [...(q.options || [])];
    if (opts.length <= 2) return;
    opts.splice(optIdx, 1);
    q.options = opts;
    next[qIdx] = q;
    handleUpdate(next);
  };

  const handleAddQuestion = () => {
    const newQ = {
      questionNumber: localQuestions.length + 1,
      questionText: "",
      questionType: "multiple_choice",
      options: ["Option A", "Option B", "Option C", "Option D"],
      marks: 1,
    };
    handleUpdate([...localQuestions, newQ]);
  };

  const handleRemoveQuestion = (idx) => {
    if (localQuestions.length <= 1) return;
    const next = localQuestions.filter((_, i) => i !== idx).map((q, i) => ({
      ...q,
      questionNumber: i + 1,
    }));
    handleUpdate(next);
  };

  const totalCalculatedMarks = localQuestions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);

  const handleSubmit = () => {
    // Sanitize question numbers and text
    const sanitized = localQuestions.map((q, i) => ({
      questionNumber: i + 1,
      questionText: q.questionText?.trim() || `Question ${i + 1}`,
      questionType: q.questionType || "multiple_choice",
      options: q.questionType === "multiple_choice" || q.questionType === "true_false"
        ? (q.options || []).map((o) => String(o).trim()).filter(Boolean)
        : undefined,
      marks: Number(q.marks) || 1,
    }));

    if (typeof onSaveAndDownload === "function") {
      onSaveAndDownload(sanitized);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Editor Header */}
      <div className="bg-card/90 p-4 sm:p-5 rounded-2xl border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25">
              <FaFileAlt className="text-xs" /> Question Paper Editor
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Language: <strong className="text-foreground uppercase">{language}</strong>
            </span>
            {assessmentTitle ? (
              <span className="text-xs font-medium text-muted-foreground truncate max-w-[220px]">
                • {assessmentTitle}
              </span>
            ) : null}
          </div>
          <h3 className="text-xl font-bold text-foreground mt-1.5">
            Customize & Fix Exam Questions
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Add, edit, or adjust questions and options before generating the physical PDF.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Questions</p>
            <p className="text-lg font-extrabold text-foreground">{localQuestions.length}</p>
          </div>
          <div className="h-8 w-px bg-border/80" />
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Marks</p>
            <p className="text-lg font-extrabold text-teal-600 dark:text-teal-400">
              {totalCalculatedMarks}
            </p>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4 max-h-[55vh] overflow-y-auto overscroll-contain pr-1">
        {localQuestions.map((q, qIdx) => (
          <div
            key={qIdx}
            className="p-4 sm:p-5 rounded-2xl border border-border bg-card/60 hover:bg-card/90 transition-all duration-200 space-y-3.5 shadow-xs"
          >
            {/* Question Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-sm font-bold text-foreground shadow-xs">
                  {qIdx + 1}
                </span>

                <select
                  value={q.questionType}
                  onChange={(e) => handleQuestionTypeChange(qIdx, e.target.value)}
                  className="rounded-xl border border-border bg-input px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-accent"
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Marks:</label>
                  <input
                    type="number"
                    min="0.5"
                    max="100"
                    step="0.5"
                    value={q.marks || 1}
                    onChange={(e) => handleMarksChange(qIdx, e.target.value)}
                    className="w-16 rounded-lg border border-border bg-input px-2 py-1 text-xs text-center font-bold text-foreground focus:outline-none focus:border-accent"
                  />
                </div>

                {localQuestions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Delete Question"
                  >
                    <FaTrash className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Question Text */}
            <div>
              <textarea
                rows={2}
                value={q.questionText}
                onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                placeholder="Enter question text here..."
                dir={isRtl ? "rtl" : "ltr"}
                className={cn(
                  "w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all",
                  isQuranic && "font-quran text-base"
                )}
              />
            </div>

            {/* MCQ Options Editor */}
            {q.questionType === "multiple_choice" && (
              <div className="space-y-2 pt-1 border-t border-border/50">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1">
                  <span>Options / Choices:</span>
                  <span>({q.options?.length || 0} options)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(q.options || []).map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                        {OPTION_LETTERS[optIdx] || optIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                        placeholder={`Option ${optIdx + 1}`}
                        dir={isRtl ? "rtl" : "ltr"}
                        className={cn(
                          "flex-1 rounded-lg border border-border bg-input px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent",
                          isQuranic && "font-quran"
                        )}
                      />
                      {(q.options || []).length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(qIdx, optIdx)}
                          className="text-muted-foreground hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                          title="Remove this option"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {(q.options || []).length < 8 && (
                  <button
                    type="button"
                    onClick={() => handleAddOption(qIdx)}
                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg border border-border bg-btn-secondary hover:bg-surface-elevated text-xs font-semibold text-secondary-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <FaPlus className="w-2.5 h-2.5" />
                    <span>Add Option</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Question Button */}
      <button
        type="button"
        onClick={handleAddQuestion}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-border hover:border-accent/60 bg-card/40 hover:bg-accent/5 flex items-center justify-center gap-2 text-sm font-bold text-secondary-foreground hover:text-foreground transition-all cursor-pointer active:scale-98"
      >
        <FaPlus className="w-3.5 h-3.5 text-accent" />
        <span>Add Another Question</span>
      </button>

      {/* Action Footer */}
      <div className="border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className={cn(btn.secondary, "font-bold w-full sm:w-auto")}
        >
          <FaArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Paper Settings</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className={cn(btn.success, "font-bold w-full sm:w-auto text-sm sm:text-base py-3 sm:py-3.5 shadow-lg shadow-emerald-500/20")}
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" color="white" type="dots" />
              <span>Generating Paper...</span>
            </>
          ) : (
            <>
              <FaDownload className="text-base" />
              <span>Apply Changes & Download PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

