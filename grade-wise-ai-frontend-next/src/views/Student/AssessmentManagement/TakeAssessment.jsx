"use client";
import { cn } from "@/lib/cn.js";

import { btn, card, chip, examBar, focusRing, panel, select, textarea } from "@/lib/ui.js";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import useStudentAssessmentStore from "@/features/student-assessment/store.js";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import useModal from "../../../hooks/useModal.js";

function TakeAssessment() {
  const { assessmentId } = useParams();
  const router = useRouter();

  const {
    assessmentQuestions,
    timeRemaining,
    loading,
    error,
    startAssessment,
    updateAnswer,
    submitAssessment,
    isSubmitted,
    hasStarted,
    clearError,
  } = useStudentAssessmentStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { showModal } = useModal();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRTL, setIsRTL] = useState(false);

  const isQuranic = ["ar", "fa"].includes(selectedLanguage);

  useEffect(() => {
    if (hasStarted) setIsRTL(["ur", "ar", "fa"].includes(selectedLanguage));
  }, [hasStarted, selectedLanguage]);

  const handleStart = async () => {
    try {
      await startAssessment(assessmentId, selectedLanguage);
      toast.success("Assessment started!");
    } catch (err) {
      toast.error(err.message || "Failed to start");
    }
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || isSubmitted) return;
    setIsSubmitting(true);
    try {
      await submitAssessment(assessmentId);
      showModal("success", "Submitted!", "Your assessment has been submitted successfully.");
      toast.success("Submitted successfully!");
    } catch (err) {
      toast.error(err.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, isSubmitted, submitAssessment, assessmentId, showModal]);

  useEffect(() => {
    if (timeRemaining > 0 && hasStarted && !isSubmitted) {
      const timer = setInterval(() => {
        useStudentAssessmentStore.setState((prev) => {
          if (prev.timeRemaining <= 1) {
            handleSubmit();
            return { timeRemaining: 0 };
          }
          return { timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining <= 0 && hasStarted && !isSubmitted) {
      handleSubmit();
    }
  }, [timeRemaining, hasStarted, isSubmitted, handleSubmit]);

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const perQuestionTime = currentQuestion?.duration_per_question || currentQuestion?.durationPerQuestion || 30;
  const [questionTimeLeft, setQuestionTimeLeft] = useState(perQuestionTime);

  useEffect(() => setQuestionTimeLeft(perQuestionTime), [currentQuestionIndex, perQuestionTime]);

  useEffect(() => {
    if (!hasStarted || isSubmitted || questionTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1 && currentQuestionIndex < assessmentQuestions.length - 1) {
          setCurrentQuestionIndex((i) => i + 1);
          return perQuestionTime;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [questionTimeLeft, hasStarted, isSubmitted, currentQuestionIndex, assessmentQuestions.length, perQuestionTime]);

  const goPrevious = () => currentQuestionIndex > 0 && setCurrentQuestionIndex(i => i - 1);
  const goNext = () => currentQuestionIndex < assessmentQuestions.length - 1 && setCurrentQuestionIndex(i => i + 1);

  const handleAnswer = (qid, answer) => updateAnswer(qid, answer);

  useEffect(() => {
    if (error) {
      showModal("error", "Error", error);
      clearError();
    }
  }, [error, clearError, showModal]);

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        router.push("/student/dashboard");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, router]);

  const answeredCount = assessmentQuestions.filter(q => q.answer !== undefined && q.answer !== null).length;
  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (loading && !hasStarted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center gap-4 py-32">
          <div className="rounded-full border border-indigo-500/20 bg-indigo-500/10 p-4">
            <LoadingSpinner size="lg" type="spinner" color="blue" />
          </div>
          <p className="text-xl font-bold text-foreground">Loading Assessment...</p>
        </div>
      </div>
    );
  }

  // Pure data mappings fallbacks safely
  const rawText = currentQuestion?.question_text || currentQuestion?.questionText || "";
  const rawType = currentQuestion?.question_type || currentQuestion?.questionType || "multiple_choice";
  
  // Safe options parsing logic
  let rawOptions = currentQuestion?.options;
  if (typeof rawOptions === "string") {
    try {
      rawOptions = JSON.parse(rawOptions);
    } catch {
      rawOptions = [];
    }
  }
  if (!Array.isArray(rawOptions)) {
    rawOptions = [];
  }

  const optionBase = "rounded-xl border p-4 text-left text-sm font-medium transition-all duration-200 active:scale-[0.98] w-full";
  const optionIdle = "border-border bg-input text-secondary-foreground hover:border-accent/40 hover:bg-surface-elevated";
  const optionSelected = "border-indigo-500/50 bg-indigo-500/15 text-indigo-800 shadow-lg shadow-indigo-500/10 dark:text-indigo-300";

  return (
    <div className={cn("min-h-screen", isQuranic && "font-quran")} dir={isRTL ? "rtl" : "ltr"}>
      {!hasStarted && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className={cn("w-full", "max-w-2xl", card, "shadow-2xl", "p-6 sm:p-8 space-y-6")}>
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome to Your Assessment</h1>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">Select Language</label>
              <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className={cn(select, focusRing)}>
                <option value="en">English</option>
                <option value="ur">Urdu</option>
                <option value="ar">Arabic</option>
                <option value="fa">Persian</option>
              </select>
            </div>
            <button type="button" onClick={handleStart} className={cn(btn.primary, "w-full py-3.5")}>Start Assessment</button>
          </div>
        </div>
      )}

      {hasStarted && !isSubmitted && currentQuestion && (
        <div className="min-h-screen flex flex-col">
          <div className={examBar}>
            <div className="mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
              <div className="flex gap-2">
                <span className="bg-indigo-500/15 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold">Q {currentQuestionIndex + 1}/{assessmentQuestions.length}</span>
                <span className="bg-emerald-500/15 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">{answeredCount} Answered</span>
              </div>
              <div className="flex gap-2 text-xs font-semibold">
                <span className="bg-amber-500/15 text-amber-400 px-3 py-1 rounded-full">Q Time: {formatTime(questionTimeLeft)}</span>
                <span className={cn(chip, "rounded-full px-3")}>Total: {formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl space-y-6">
              <div className={cn(card, "p-6 sm:p-8 space-y-6 shadow-2xl")}>
                <div className={cn(panel, "text-center py-6")}>
                  <p className="text-xl font-semibold text-foreground">{rawText || "No Question Text Found"}</p>
                </div>

                {/* Multiple Choice Render */}
                {(rawType === "multiple_choice" || rawType === "multiple-choice") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rawOptions.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAnswer(currentQuestion.id, opt)}
                        className={cn(optionBase, currentQuestion.answer === opt ? optionSelected : optionIdle)}
                      >
                        <span className="font-bold mr-2 text-indigo-400">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* True/False Render */}
                {(rawType === "true_false" || rawType === "true-false") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                    {[true, false].map((val) => (
                      <button
                        key={val.toString()}
                        type="button"
                        onClick={() => handleAnswer(currentQuestion.id, val)}
                        className={cn("py-6 text-xl font-bold rounded-xl border transition-all text-center", 
                          currentQuestion.answer === val ? "bg-indigo-500/25 border-indigo-500 text-indigo-400" : "bg-input border-border text-foreground")}
                      >
                        {val ? "True" : "False"}
                      </button>
                    ))}
                  </div>
                )}

                {/* Short Answer Render */}
                {(rawType === "short_answer" || rawType === "short-answer") && (
                  <textarea
                    value={currentQuestion.answer || ""}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    placeholder="Type your answer here..."
                    rows={6}
                    className={cn(textarea, focusRing)}
                  />
                )}

                {/* Matching Render */}
                {rawType === "matching" && (() => {
                  let matchData = { leftItems: [], rightItems: [] };
                  try {
                    const raw = Array.isArray(currentQuestion.options) ? currentQuestion.options[0] : null;
                    if (typeof raw === "string") matchData = { ...matchData, ...JSON.parse(raw) };
                    else if (raw && typeof raw === "object") matchData = { ...matchData, ...raw };
                  } catch {
                    matchData = { leftItems: [], rightItems: [] };
                  }

                  const leftItems = Array.isArray(matchData.leftItems) ? matchData.leftItems : [];
                  const rightItems = Array.isArray(matchData.rightItems) ? matchData.rightItems : [];

                  if (leftItems.length === 0 || rightItems.length === 0) {
                    return <p className="text-muted-foreground text-sm">Matching items unavailable.</p>;
                  }

                  let selectedPairs = [];
                  try {
                    const parsed = JSON.parse(currentQuestion.answer || "[]");
                    if (Array.isArray(parsed)) selectedPairs = parsed;
                  } catch {
                    selectedPairs = [];
                  }

                  const handleMatchChange = (left, right) => {
                    const others = selectedPairs.filter(([, r]) => r !== right || r === "");
                    const next = [...others.filter(([l]) => l !== left), [left, right]];
                    handleAnswer(currentQuestion.id, JSON.stringify(next));
                  };

                  return (
                    <div className="space-y-4">
                      {leftItems.map((left, i) => {
                        const pair = selectedPairs.find(([l]) => l === left);
                        return (
                          <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-input rounded-xl border border-border">
                            <span className="font-semibold text-secondary-foreground flex-1 break-words">{left}</span>
                            <select
                              value={pair ? pair[1] : ""}
                              onChange={(e) => handleMatchChange(left, e.target.value)}
                              className={cn(select, focusRing, "sm:w-72")}
                            >
                              <option value="">Select match...</option>
                              {rightItems.map((r, ri) => (
                                <option key={ri} value={r}>{r}</option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-between items-center">
                <button type="button" onClick={goPrevious} disabled={currentQuestionIndex === 0} className={cn(chip, "px-4 py-2.5")}>Previous</button>
                {currentQuestionIndex === assessmentQuestions.length - 1 ? (
                  <button type="button" onClick={handleSubmit} disabled={isSubmitting} className={cn(btn.success)}>
                    {isSubmitting ? "Submitting..." : "Submit Exam"}
                  </button>
                ) : (
                  <button type="button" onClick={goNext} className={cn(btn.primary)}>Next Question</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isSubmitted && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className={cn(card, "p-8 text-center max-w-xl w-full space-y-4")}>
            <h1 className="text-2xl font-bold text-foreground">Assessment Submitted!</h1>
            <p className="text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TakeAssessment;
