import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useStudentAssessmentStore from "@/features/student-assessment/store.js";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import Modal from "../../../components/ui/Modal";
import toast from "react-hot-toast";
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
  const [modal, setModal] = useState({ isOpen: false, type: "", title: "", message: "" });
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
      setModal({
        isOpen: true,
        type: "success",
        title: "Submitted!",
        message: "Your assessment has been submitted successfully."
      });
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
      setModal({ isOpen: true, type: "error", title: "Error", message: error });
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <LoadingSpinner size="lg" type="spinner" color="blue" />
          </div>
          <p className="text-white text-xl font-bold">Loading Assessment...</p>
          <p className="text-slate-400 text-sm">Please wait while we prepare your exam</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" dir={isRTL ? "rtl" : "ltr"}>

      {/* START SCREEN */}
      {!hasStarted && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                  <FaGraduationCap className="text-white text-2xl" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Welcome to Your Assessment</h1>
              <p className="text-slate-400 text-sm mt-1">Select your preferred language and begin</p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Language Select */}
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-1.5 flex items-center gap-2">
                  <FaLanguage className="text-indigo-400" />
                  Select Language
                </label>
                <div className="relative">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-200 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 appearance-none cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="ur">Urdu</option>
                    <option value="ar">Arabic</option>
                    <option value="fa">Persian</option>
                  </select>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  <FaFileAlt className="text-indigo-400" />
                  Instructions
                </h3>
                <ul className="text-sm text-slate-400 space-y-2 leading-relaxed">
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
                onClick={handleStart}
                disabled={loading}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
          <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50 shadow-2xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Left: Question progress + answered count */}
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                    <FaQuestionCircle className="text-xs" />
                    Q {currentQuestionIndex + 1}/{assessmentQuestions.length}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    <FaCheckCircle className="text-xs" />
                    {answeredCount} Answered
                  </div>
                </div>
                {/* Right: Timers */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                    questionTimeLeft <= 5
                      ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
                      : "bg-amber-500/15 text-amber-400 border-amber-500/20"
                  }`}>
                    <FaClock className="text-xs" />
                    {formatTime(questionTimeLeft)}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-400 border border-slate-600/40">
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
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-200 animate-slide-in">
                {/* Question Header */}
                <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                      <FaQuestionCircle className="text-white text-sm" />
                    </div>
                    <h2 className="text-lg font-bold text-white">
                      Question {currentQuestionIndex + 1} <span className="text-slate-500 font-normal">of {assessmentQuestions.length}</span>
                    </h2>
                  </div>
                </div>

                {/* Question Content */}
                <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
                  {/* Question Text */}
                  <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-5 sm:p-6 text-center">
                    <p className="text-lg sm:text-xl font-semibold leading-relaxed text-slate-200">
                      {currentQuestion.question_text}
                    </p>
                  </div>

                  {/* Marks Display */}
                  <div className="flex justify-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      +{currentQuestion.positive_marks || 1} marks
                    </span>
                    {currentQuestion.negative_marks > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
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
                          onClick={() => handleAnswer(currentQuestion.id, opt)}
                          className={`p-4 sm:p-5 rounded-xl text-sm font-medium text-left transition-all duration-200 border active:scale-95 cursor-pointer ${
                            currentQuestion.answer === opt
                              ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-lg shadow-indigo-500/10"
                              : "bg-slate-800/60 border-slate-700/40 hover:border-slate-600 hover:bg-slate-700/60 text-slate-300"
                          }`}
                        >
                          <span className="font-bold text-indigo-400 mr-2">{String.fromCharCode(65 + i)}.</span>
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
                          onClick={() => handleAnswer(currentQuestion.id, val === "True")}
                          className={`py-8 sm:py-10 rounded-2xl text-xl sm:text-2xl font-bold transition-all duration-200 border-2 active:scale-95 cursor-pointer ${
                            currentQuestion.answer === (val === "True")
                              ? val === "True"
                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/10"
                                : "bg-red-500/20 border-red-500/40 text-red-300 shadow-lg shadow-red-500/10"
                              : "bg-slate-800/60 border-slate-700/40 hover:border-slate-600 hover:bg-slate-700/60 text-slate-300"
                          }`}
                        >
                          {val === "True" ? "True" : "False"}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Short Answer */}
                  {currentQuestion.question_type === "short_answer" && (
                    <textarea
                      value={currentQuestion.answer || ""}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      placeholder="Type your answer here..."
                      rows={6}
                      className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                    />
                  )}
                </div>

                {/* Navigation Footer */}
                <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <button
                    onClick={goPrevious}
                    disabled={currentQuestionIndex === 0}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaArrowLeft />
                    <span>Previous</span>
                  </button>

                  {currentQuestionIndex === assessmentQuestions.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                      onClick={goNext}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 cursor-pointer"
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
          <div className="w-full max-w-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl p-8 sm:p-10 text-center animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                <FaCheckCircle className="text-white text-4xl" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Assessment Submitted!</h1>
            <p className="text-slate-400 leading-relaxed mb-8">
              Your exam has been recorded successfully.<br />
              Redirecting you to the dashboard in a few seconds...
            </p>
            <button
              onClick={() => navigate("/student/dashboard")}
              className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
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
          setModal({ ...modal, isOpen: false });
          if (modal.type === "success") navigate("/student/dashboard");
        }}
        type={modal.type}
        title={modal.title}
      >
        <div className="text-center p-4">
          <p className="text-slate-300 text-base mb-6">{modal.message}</p>
          {modal.type === "success" && (
            <button
              onClick={() => navigate("/student/dashboard")}
              className="w-full py-3 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/30 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </Modal>

      {/* Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(${isRTL ? "-100%" : "100%"}) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      ` }} />
    </div>
  );
}

export default TakeAssessment;
