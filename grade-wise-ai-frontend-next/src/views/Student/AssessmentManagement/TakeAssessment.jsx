import { cn } from "@/lib/cn.js";
import { btn, card, cardHeader, chip, examBar, focusRing, panel, select, textarea } from "@/lib/ui.js";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useStudentAssessmentStore from "@/features/student-assessment/store.js";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import Modal from "../../../components/ui/Modal";
import toast from "react-hot-toast";
import useModal from "../../../hooks/useModal.js";
import {
  FaClock,
  FaQuestionCircle,
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaGraduationCap,
  FaFileAlt,
  FaLanguage
} from "react-icons/fa";

function TakeAssessment() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

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
    const { modal, showModal, closeModal } = useModal();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRTL, setIsRTL] = useState(false);

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

  const handleSubmit = async () => {
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
  };

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
  }, [timeRemaining, hasStarted, isSubmitted]);

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const perQuestionTime = currentQuestion?.duration_per_question || 30;
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
  }, [error, clearError]);

  // Auto-redirect after success
  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        navigate("/student/dashboard");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, navigate]);

  const answeredCount = assessmentQuestions.filter(q => q.answer !== undefined).length;
  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (loading && !hasStarted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4" role="status" aria-live="polite">
        <div className="flex flex-col items-center justify-center gap-4 py-32">
          <div className="rounded-full border border-indigo-500/20 bg-indigo-500/10 p-4">
            <LoadingSpinner size="lg" type="spinner" color="blue" />
          </div>
          <p className="text-xl font-bold text-foreground">Loading Assessment...</p>
          <p className="text-sm text-muted-foreground">Please wait while we prepare your exam</p>
        </div>
      </div>
    );
  }

  const optionBase =
    "rounded-xl border p-4 text-left text-sm font-medium transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100";
  const optionIdle =
    "border-border bg-input text-secondary-foreground hover:border-accent/40 hover:bg-surface-elevated";
  const optionSelected =
    "border-indigo-500/50 bg-indigo-500/15 text-indigo-800 shadow-lg shadow-indigo-500/10 dark:text-indigo-300";

  return (
    <div className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>

      {/* START SCREEN */}
      {!hasStarted && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className={cn("w-full", "max-w-2xl", card, "shadow-2xl", "overflow-hidden", "animate-fade-in")}>
            {/* Card Header */}
            <div className={cn(cardHeader, "text-center")}>
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                  <FaGraduationCap className="text-white text-2xl" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Welcome to Your Assessment</h1>
              <p className={cn("text-muted-foreground", "text-sm", "mt-1")}>Select your preferred language and begin</p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Language Select */}
              <div>
                <label htmlFor="exam-language" className={cn("mb-1.5", "flex", "items-center", "gap-2", "text-sm", "font-medium", "text-muted-foreground")}>
                  <FaLanguage className="text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
                  Select Language
                </label>
                <div className="relative">
                  <select
                    id="exam-language"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className={cn(select, focusRing)}
                  >
                    <option value="en">English</option>
                    <option value="ur">Urdu</option>
                    <option value="ar">Arabic</option>
                    <option value="fa">Persian</option>
                  </select>
                </div>
              </div>

              {/* Instructions */}
              <div className={panel}>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-secondary-foreground">
                  <FaFileAlt className="text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
                  Instructions
                </h3>
                <ul className={cn("text-sm", "text-muted-foreground", "space-y-2", "leading-relaxed")}>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    Read each question carefully before answering
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    You can navigate between questions using Previous/Next buttons
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    Make sure to submit before time runs out
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    Your progress is automatically saved
                  </li>
                </ul>
              </div>

              {/* Start Button */}
              <button
                type="button"
                onClick={handleStart}
                disabled={loading}
                aria-busy={loading}
                className={cn(btn.primary, "w-full", "py-3.5")}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" type="dots" />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <FaGraduationCap />
                    <span>Start Assessment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXAM IN PROGRESS */}
      {hasStarted && !isSubmitted && currentQuestion && (
        <div className="min-h-screen flex flex-col">
          {/* Top Status Bar */}
          <div className={examBar} role="region" aria-label="Exam progress">
            <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Left: Question progress + answered count */}
                <div className="flex items-center gap-3">
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/15 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400"
                    aria-label={`Question ${currentQuestionIndex + 1} of ${assessmentQuestions.length}`}
                  >
                    <FaQuestionCircle className="text-xs" aria-hidden="true" />
                    Q {currentQuestionIndex + 1}/{assessmentQuestions.length}
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400"
                    aria-label={`${answeredCount} questions answered`}
                  >
                    <FaCheckCircle className="text-xs" aria-hidden="true" />
                    {answeredCount} Answered
                  </div>
                </div>
                {/* Right: Timers */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold sm:px-4 motion-reduce:animate-none",
                      questionTimeLeft <= 5
                        ? "animate-pulse border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-400"
                        : "border-amber-500/20 bg-amber-500/15 text-amber-800 dark:text-amber-400"
                    )}
                    role="timer"
                    aria-live="polite"
                    aria-label={`Time remaining for this question: ${formatTime(questionTimeLeft)}`}
                  >
                    <FaClock className="text-xs" aria-hidden="true" />
                    {formatTime(questionTimeLeft)}
                  </div>
                  <div
                    className={cn(chip, "rounded-full px-3 sm:px-4")}
                    role="timer"
                    aria-label={`Total time remaining: ${formatTime(timeRemaining)}`}
                  >
                    <FaClock className="text-xs" />
                    Total: {formatTime(timeRemaining)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="flex-1 flex items-center justify-center p-3 sm:p-6">
            <div className="w-full max-w-4xl">
              <div className={cn(card, "animate-fade-in", "overflow-hidden", "shadow-2xl", "transition-all", "duration-200", "hover:border-indigo-500/30")}>
                {/* Question Header */}
                <div className={cn(cardHeader, "text-center")}>
                  <div className="flex items-center justify-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                      <FaQuestionCircle className="text-white text-sm" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">
                      Question {currentQuestionIndex + 1} <span className={cn("text-muted-foreground", "font-normal")}>of {assessmentQuestions.length}</span>
                    </h2>
                  </div>
                </div>

                {/* Question Content */}
                <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
                  {/* Question Text */}
                  <div className={cn(panel, "text-center")}>
                    <p className="text-lg font-semibold leading-relaxed text-secondary-foreground sm:text-xl">
                      {currentQuestion.question_text}
                    </p>
                  </div>

                  {/* Marks Display */}
                  <div className="flex justify-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      +{currentQuestion.positive_marks || 1} marks
                    </span>
                    {currentQuestion.negative_marks > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400">
                        -{currentQuestion.negative_marks} marks
                      </span>
                    )}
                  </div>

                  {/* Multiple Choice */}
                  {currentQuestion.question_type === "multiple_choice" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentQuestion.options?.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAnswer(currentQuestion.id, opt)}
                          aria-pressed={currentQuestion.answer === opt}
                          aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt}`}
                          className={cn(
                            optionBase,
                            focusRing,
                            "sm:p-5",
                            currentQuestion.answer === opt ? optionSelected : optionIdle
                          )}
                        >
                          <span className="mr-2 font-bold text-indigo-600 dark:text-indigo-400" aria-hidden="true">
                            {String.fromCharCode(65 + i)}.
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* True/False */}
                  {currentQuestion.question_type === "true_false" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      {["True", "False"].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleAnswer(currentQuestion.id, val === "True")}
                          aria-pressed={currentQuestion.answer === (val === "True")}
                          aria-label={`Answer: ${val}`}
                          className={cn(
                            "cursor-pointer rounded-2xl border-2 py-8 text-xl font-bold transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 sm:py-10 sm:text-2xl",
                            focusRing,
                            currentQuestion.answer === (val === "True")
                              ? val === "True"
                                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-800 shadow-lg shadow-emerald-500/10 dark:text-emerald-300"
                                : "border-red-500/40 bg-red-500/15 text-red-800 shadow-lg shadow-red-500/10 dark:text-red-300"
                              : "border-border bg-input text-secondary-foreground hover:border-accent/40 hover:bg-surface-elevated"
                          )}
                        >
                          {val === "True" ? "True" : "False"}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Short Answer */}
                  {currentQuestion.question_type === "short_answer" && (
                    <textarea
                      id="short-answer"
                      value={currentQuestion.answer || ""}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      placeholder="Type your answer here..."
                      rows={6}
                      aria-label="Short answer response"
                      className={cn(textarea, focusRing)}
                    />
                  )}
                </div>

                {/* Navigation Footer */}
                <div className={cn(cardHeader, "flex flex-col items-center justify-between gap-3 sm:flex-row")}>
                  <button
                    type="button"
                    onClick={goPrevious}
                    disabled={currentQuestionIndex === 0}
                    aria-label="Go to previous question"
                    className={cn(chip, "w-full", "px-4", "py-2.5", "sm:w-auto")}
                  >
                    <FaArrowLeft aria-hidden="true" />
                    <span>Previous</span>
                  </button>

                  {currentQuestionIndex === assessmentQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      aria-busy={isSubmitting}
                      className={cn(btn.success, "w-full", "sm:w-auto")}
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner size="sm" color="white" type="dots" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <FaCheckCircle />
                          <span>Submit Exam</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={goNext}
                      aria-label="Go to next question"
                      className={cn(btn.primary, "w-full", "sm:w-auto")}
                    >
                      <span>Next Question</span>
                      <FaArrowRight />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS SCREEN */}
      {isSubmitted && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className={cn("w-full", "max-w-xl", card, "shadow-2xl", "p-8", "sm:p-10", "text-center", "animate-fade-in")}>
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                <FaCheckCircle className="text-white text-4xl" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Assessment Submitted!</h1>
            <p className={cn("text-muted-foreground", "leading-relaxed", "mb-8")}>
              Your exam has been recorded successfully.<br />
              Redirecting you to the dashboard in a few seconds...
            </p>
            <button
              type="button"
              onClick={() => navigate("/student/dashboard")}
              className={cn(btn.primary)}
            >
              Go to Dashboard Now
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => {
          closeModal();
          if (modal.type === "success") navigate("/student/dashboard");
        }}
        type={modal.type}
        title={modal.title}
      >
        <div className="text-center p-4">
          <p className={cn("text-secondary-foreground", "text-base", "mb-6")}>{modal.message}</p>
          {modal.type === "success" && (
            <button
              type="button"
              onClick={() => navigate("/student/dashboard")}
              className={cn(btn.success, "w-full")}
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </Modal>

      {/* Animations — global utilities respect prefers-reduced-motion */}
    </div>
  );
}

export default TakeAssessment;
