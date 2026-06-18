import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import useStudentAnalyticsStore from "@/features/student-analytics/store.js";
import {
  FaEye,
  FaBook,
  FaTrophy,
  FaClock,
  FaCheckCircle,
  FaDownload,
  FaChartLine,
  FaTimesCircle,
  FaArrowUp
} from "react-icons/fa";
import Modal from "../../components/ui/Modal.jsx";

const StudentAnalytics = () => {
  const {
    assessments,
    selectedAssessment,
    selectedAssessmentDetails,
    loading,
    error,
    fetchAssessments,
    fetchAssessmentDetails,
    setSelectedAssessment,
    downloadReport,
    fetchAssessmentQuestions,
    questions,
    questionsLoading,

  } = useStudentAnalyticsStore();

  const [showType, setShowType] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "", title: "", message: "" });

  const resultsRef = useRef(null);
  const questionsRef = useRef(null);
  const assessmentsRef = useRef(null);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  // Handle scroll to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  useEffect(() => {
    if (selectedAssessment && showType === "results" && selectedAssessmentDetails) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 300);
    }
  }, [selectedAssessmentDetails, showType]);

  useEffect(() => {
    if (
      selectedAssessment &&
      showType === "questions" &&
      Array.isArray(questions) &&
      questions.length > 0
    ) {

      setTimeout(() => {
        questionsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 300);
    }
  }, [questions, showType]);

  const formatTime = (seconds) => {
    if (!seconds) return "0m 0s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSeeResults = (id) => {
    setSelectedAssessment(id);
    setShowType("results");
    fetchAssessmentDetails(id);
  };

  const handleSeeQuestions = async (id) => {
    setSelectedAssessment(id);
    setShowType("questions");
    await fetchAssessmentQuestions(id);
  };


  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <LoadingSpinner size="lg" type="spinner" color="blue" />
          </div>
          <p className="text-slate-400 text-sm">Loading analytics...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4">
        <div className="flex flex-col items-center justify-center py-28 text-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 flex items-center justify-center mb-6">
            <FaTimesCircle className="text-3xl text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Error Loading Data</h3>
          <p className="text-slate-400 max-w-sm">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">

      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                <FaChartLine className="text-white text-2xl sm:text-3xl" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">My Analytics</h1>
            <p className="text-slate-400 text-sm sm:text-base">Review your performance and track your progress</p>
          </div>
        </div>

        {/* Assessment List */}
        <div ref={assessmentsRef} className="space-y-4 sm:space-y-5 max-w-5xl mx-auto scroll-mt-24">
          {Array.isArray(assessments) && assessments.length > 0 ? (
            assessments.map((a) => (
              <div
                key={a.id}
                className={`bg-slate-800/40 backdrop-blur-sm border rounded-2xl shadow-2xl transition-all duration-200 hover:border-indigo-500/30 ${
                  selectedAssessment === a.id
                    ? "border-indigo-500/50 ring-1 ring-indigo-500/30"
                    : "border-slate-700/50"
                }`}
              >
                {/* Card header */}
                <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 rounded-t-2xl">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{a.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <FaClock className="text-slate-500" />
                    {new Date(a.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-slate-400 text-sm">
                      Click to review your answers and performance
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleSeeResults(a.id)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-200 active:scale-95 cursor-pointer"
                      >
                        <FaTrophy />
                        <span>Results</span>
                      </button>

                      <button
                        onClick={() => handleSeeQuestions(a.id)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 cursor-pointer"
                      >
                        <FaEye />
                        <span>Questions</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-28 text-center px-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                <FaBook className="text-3xl text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No assessments completed yet</h3>
              <p className="text-slate-400 max-w-sm mb-8">Complete assessments to see your analytics here</p>
            </div>
          )}
        </div>

        {/* Results View */}
        {showType === "results" && selectedAssessmentDetails && (
          <div
            ref={resultsRef}
            className="mt-10 sm:mt-12 space-y-6 sm:space-y-8 max-w-5xl mx-auto scroll-mt-24 animate-fade-in"
          >
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 overflow-hidden">
              {/* Results header */}
              <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-800/60 text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Performance Summary</p>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {selectedAssessmentDetails.assessment_title}
                </h2>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 text-center">
                  {/* Score */}
                  <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6 sm:p-8 flex flex-col items-center gap-3 hover:border-emerald-500/50 transition-all duration-200">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                      <FaTrophy className="text-white text-xl" />
                    </div>
                    <p className="text-4xl sm:text-5xl font-bold text-white leading-none">{selectedAssessmentDetails.score}%</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-semibold uppercase tracking-wider">Score</p>
                  </div>

                  {/* Time */}
                  <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-6 sm:p-8 flex flex-col items-center gap-3 hover:border-indigo-500/50 transition-all duration-200">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                      <FaClock className="text-white text-xl" />
                    </div>
                    <p className="text-3xl sm:text-4xl font-bold text-white leading-none">{formatTime(selectedAssessmentDetails.time_taken)}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-semibold uppercase tracking-wider">Time Taken</p>
                  </div>

                  {/* Correct */}
                  <div className="bg-gradient-to-br from-sky-500/20 to-blue-500/20 backdrop-blur-sm border border-sky-500/30 rounded-xl p-6 sm:p-8 flex flex-col items-center gap-3 hover:border-sky-500/50 transition-all duration-200">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25">
                      <FaCheckCircle className="text-white text-xl" />
                    </div>
                    <p className="text-3xl sm:text-4xl font-bold text-white leading-none">
                      {selectedAssessmentDetails.correct_answers} / {selectedAssessmentDetails.total_questions}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 font-semibold uppercase tracking-wider">Correct</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center animate-fade-in">
              <button
                onClick={() => downloadReport(selectedAssessment)}
                className="inline-flex items-center gap-3 px-8 sm:px-10 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 cursor-pointer text-sm sm:text-base"
              >
                <FaDownload />
                <span>Download Full Report (PDF)</span>
              </button>
            </div>
          </div>
        )}

        {/* Questions View */}
        {showType === "questions" && (
          <div
            ref={questionsRef}
            className="mt-10 sm:mt-12 space-y-5 sm:space-y-6 max-w-5xl mx-auto scroll-mt-24"
          >
            {/* Floating Back Arrow */}
            <button
              onClick={() => {
                setShowType(null);
                setTimeout(() => {
                  assessmentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="fixed left-1/2 -translate-x-1/2 top-24 z-40 group animate-fade-in"
              aria-label="Back to assessments"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-indigo-500 to-violet-600 p-4 rounded-full shadow-2xl shadow-indigo-500/30 transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                  <FaArrowUp className="text-white text-xl" />
                </div>
              </div>
              <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700/50 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform group-hover:translate-y-1">
                Back to Assessments
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-900"></div>
              </div>
            </button>

            {questionsLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                  <LoadingSpinner size="lg" type="spinner" color="blue" />
                </div>
                <p className="text-slate-400 text-sm">Loading questions...</p>
              </div>
            ) : Array.isArray(questions) && questions.length > 0 ? (
              <>
                <div className="text-center mb-6 animate-fade-in">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Assessment Review</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Question Review
                  </h2>
                  <p className="text-slate-400 text-sm">Review all questions and your answers</p>
                </div>

                {questions.map((q, i) => (
                  <div
                    key={i}
                    className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    {/* Question header */}
                    <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-200 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
                          <FaBook className="text-white text-xs" />
                        </div>
                        Question {q.question_order || i + 1}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 ml-1">
                          {q.type}
                        </span>
                      </h3>
                    </div>

                    <div className="p-5 sm:p-6 space-y-5">
                      {/* Question text */}
                      <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4 sm:p-5">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Question</p>
                        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{q.question}</p>
                      </div>

                      {/* Options (MCQ) */}
                      {["multiple_choice", "MCQ"].includes(q.type) && q.options && (
                        <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4 sm:p-5">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Options</p>
                          <div className="space-y-2">
                            {Object.entries(q.options).map(([k, v]) => (
                              <div key={k} className="bg-slate-900/50 border border-slate-700/40 hover:border-slate-600/60 p-3 rounded-xl text-slate-300 text-xs sm:text-sm transition-all duration-150">
                                <strong className="text-indigo-400 mr-1">{k}:</strong> {v}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Answer comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Correct answer */}
                        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-5 sm:p-6 text-center hover:border-emerald-500/50 transition-all duration-200">
                          <div className="flex justify-center mb-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                              <FaCheckCircle className="text-white text-lg" />
                            </div>
                          </div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Correct Answer</p>
                          <p className="font-bold text-lg text-emerald-400">
                            {q.type === 'true_false'
                              ? (q.correct_answer === true || q.correct_answer === 'true' ? 'True' : 'False')
                              : q.correct_answer || "N/A"
                            }
                          </p>
                        </div>

                        {/* Student answer */}
                        <div className={`backdrop-blur-sm rounded-xl p-5 sm:p-6 text-center transition-all duration-200 ${
                          q.is_correct
                            ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 hover:border-emerald-500/50"
                            : "bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 hover:border-red-500/50"
                        }`}>
                          <div className="flex justify-center mb-3">
                            {q.is_correct ? (
                              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                                <FaCheckCircle className="text-white text-lg" />
                              </div>
                            ) : (
                              <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25">
                                <FaTimesCircle className="text-white text-lg" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Your Answer</p>
                          <p className={`text-lg font-bold ${q.is_correct ? "text-emerald-400" : "text-red-400"}`}>
                            {q.type === 'true_false'
                              ? (q.student_answer === true || q.student_answer === 'true' ? 'True' : 'False')
                              : q.student_answer || "Not Answered"
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Floating Back Arrow (duplicate at end) */}
                <button
                  onClick={() => {
                    setShowType(null);
                    setTimeout(() => {
                      assessmentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className="fixed left-1/2 -translate-x-1/2 top-24 z-40 group animate-fade-in"
                  aria-label="Back to assessments"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-indigo-500 to-violet-600 p-4 rounded-full shadow-2xl shadow-indigo-500/30 transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                      <FaArrowUp className="text-white text-xl" />
                    </div>
                  </div>
                  <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700/50 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform group-hover:translate-y-1">
                    Back to Assessments
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-900"></div>
                  </div>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-28 text-center px-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                  <FaBook className="text-3xl text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No questions available</h3>
                <p className="text-slate-400 max-w-sm mb-8">There are no questions to display for this assessment.</p>
              </div>
            )}
          </div>
        )}
      </div>


      {/* Modal for notifications */}
      <Modal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ isOpen: false, type: "", title: "", message: "" })}
      />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-full shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:scale-110 transition-all duration-200 active:scale-95 cursor-pointer"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="text-lg" />
        </button>
      )}


      {/* Custom CSS for animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out;
        }

        .scroll-mt-24 {
          scroll-margin-top: 6rem;
        }
      ` }} />
    </div>
  );
};

export default StudentAnalytics;
