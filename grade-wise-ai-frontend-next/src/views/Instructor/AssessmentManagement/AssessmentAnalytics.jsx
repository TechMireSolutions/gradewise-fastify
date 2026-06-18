import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "../../../components/ui/Card";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import useInstructorAnalyticsStore from "@/features/instructor-analytics/store.js";
import { FaList, FaTable, FaCalendarAlt, FaCheckCircle, FaEye, FaChartBar, FaArrowUp, FaUsers, FaExclamationTriangle } from "react-icons/fa";

function AssessmentAnalytics() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const {
    loading,
    error,
    assessments,
    students,
    fetchAssessments,
    fetchAssessmentStudents,
    fetchStudentQuestions,
    studentQuestions,
    selectedStudentId,
  } = useInstructorAnalyticsStore();

  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const assessmentsRef = useRef(null);
  const studentsRef = useRef(null);
  const questionsRef = useRef(null);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  useEffect(() => {
    const isValid = assessmentId && !isNaN(assessmentId) && assessmentId !== ":assessmentId";
    if (isValid) {
      fetchAssessmentStudents(assessmentId);
      const assessment = assessments.find(a => a.id === Number(assessmentId));
      setSelectedAssessment(assessment || null);
    } else {
      setSelectedAssessment(null);
    }
  }, [assessmentId, assessments, fetchAssessmentStudents]);

  // Handle scroll to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto scroll to students section when assessment is selected
  useEffect(() => {
    if (assessmentId && !isNaN(assessmentId) && assessmentId !== ":assessmentId" && students.length > 0) {
      setTimeout(() => {
        studentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [assessmentId, students]);

  // Auto scroll to questions when student questions are loaded
  useEffect(() => {
    if (selectedStudentId && studentQuestions.length > 0) {
      setTimeout(() => {
        questionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [selectedStudentId, studentQuestions]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <LoadingSpinner size="lg" type="spinner" color="blue" />
          </div>
          <p className="text-slate-400 text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
            <FaExclamationTriangle className="text-red-400 text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Error</h3>
          <p className="text-red-400 font-medium text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // SMART COMPARISON — WORKS FOR ALL QUESTION TYPES
  const isAnswerCorrect = (correct, student) => {
    if (!student) return false;

    let c = String(correct || "").trim();
    let s = String(student || "").trim();

    // Remove escaped quotes and extra spaces
    c = c.replace(/\\"/g, '"').replace(/^["'\s]+|["'\s]+$/g, '').trim();
    s = s.replace(/\\"/g, '"').replace(/^["'\s]+|["'\s]+$/g, '').trim();

    return c.toLowerCase() === s.toLowerCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
              <FaChartBar className="text-white text-xl" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Assessment Analytics
            </h1>
          </div>
          <p className="text-slate-400 ml-0 sm:ml-14">Monitor student performance and assessment results</p>
        </div>

        {/* Executed Assessments List */}
        <div ref={assessmentsRef} className="scroll-mt-24 mb-8">
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 overflow-hidden">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/20">
                <FaList className="text-indigo-400 text-sm" />
              </div>
              <h3 className="text-xl font-bold text-white">My Executed Assessments</h3>
            </div>
            <div className="p-6 sm:p-8">
              {assessments.length > 0 ? (
                <div className="space-y-4">
                  {assessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      onClick={() => navigate(`/instructor/assessments/${assessment.id}/analytics`)}
                      className={`p-5 sm:p-6 rounded-xl border cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5 ${assessment.id === Number(assessmentId)
                          ? "border-indigo-500/60 bg-indigo-500/10 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30"
                          : "border-slate-700/50 bg-slate-800/60 hover:border-indigo-500/30 hover:bg-slate-700/40"
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="flex-1">
                          <h4 className="text-lg sm:text-xl font-bold text-white mb-2">
                            {assessment.title}
                          </h4>
                          <div className="flex items-center text-sm text-slate-400">
                            <FaCalendarAlt className="mr-2 text-indigo-400" />
                            Created: {new Date(assessment.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-center sm:text-right bg-gradient-to-br from-indigo-500/20 to-violet-500/20 backdrop-blur-sm border border-indigo-500/30 rounded-xl px-6 py-3">
                          <div className="text-3xl font-bold text-white flex items-center justify-center sm:justify-end gap-2 leading-none">
                            <FaCheckCircle className="text-emerald-400 text-xl" />
                            {assessment.completed_attempts}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Completed</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-28 text-center px-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                    <FaChartBar className="text-indigo-400 text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Executed Assessments</h3>
                  <p className="text-slate-400 max-w-sm">Execute an assessment to see analytics here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Student Results */}
        {assessmentId && !isNaN(assessmentId) && assessmentId !== ":assessmentId" && (
          <div ref={studentsRef} className="scroll-mt-24 animate-fadeIn">
            {/* Desktop Table */}
            <div className="hidden lg:block mb-10">
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/15 border border-violet-500/20">
                    <FaUsers className="text-violet-400 text-sm" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{selectedAssessment?.title}</h3>
                </div>
                {students.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-slate-800/60">
                          <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Student</th>
                          <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Questions</th>
                          <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Correct</th>
                          <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Score</th>
                          <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Time Used</th>
                          <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {students.map((s) => (
                          <tr key={s.student_id} className="hover:bg-indigo-500/5 transition-colors duration-150">
                            <td className="px-6 py-4 font-semibold text-white text-sm">{s.name || `Student ${s.student_id}`}</td>
                            <td className="px-6 py-4 text-slate-300 font-medium text-sm">{s.total_questions || 0}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                {s.correct_answers || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                                {s.percentage}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-300 text-sm">{s.time_used}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => fetchStudentQuestions(assessmentId, s.student_id)}
                                className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
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
                  <div className="flex flex-col items-center justify-center py-28 text-center px-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                      <FaUsers className="text-indigo-400 text-3xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Students Yet</h3>
                    <p className="text-slate-400 max-w-sm">No students have completed this assessment</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4 mb-10">
              {students.length > 0 ? students.map((s, idx) => (
                <div
                  key={s.student_id}
                  className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 p-5 animate-slideInUp"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 rounded-xl p-4 mb-4">
                    <h4 className="font-bold text-lg text-white">{s.name || `Student ${s.student_id}`}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-3">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-1">Questions</span>
                      <span className="text-xl font-bold text-white">{s.total_questions}</span>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-3">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-1">Correct</span>
                      <span className="text-xl font-bold text-emerald-400">{s.correct_answers}</span>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-3">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-1">Score</span>
                      <span className="text-xl font-bold text-indigo-400">{s.percentage}%</span>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-3">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-1">Time</span>
                      <span className="text-xl font-bold text-white">{s.time_used}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => fetchStudentQuestions(assessmentId, s.student_id)}
                    className="w-full py-3 px-5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FaEye /> View Detailed Answers
                  </button>
                </div>
              )) : (
                <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl p-8">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                      <FaUsers className="text-indigo-400 text-2xl" />
                    </div>
                    <p className="text-slate-400 font-medium">No results yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STUDENT QUESTIONS — FINAL 100% ACCURATE */}
        {selectedStudentId && studentQuestions.length > 0 && (
          <div ref={questionsRef} className="scroll-mt-24 animate-fadeIn">
            {/* Floating Back Arrow */}
            <button
              onClick={() => {
                setTimeout(() => {
                  assessmentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="fixed left-1/2 -translate-x-1/2 top-24 z-40 group animate-fadeIn"
              aria-label="Back to assessments"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-indigo-500 to-violet-600 p-4 rounded-full shadow-2xl shadow-indigo-500/30 transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                  <FaArrowUp className="text-white text-2xl" />
                </div>
              </div>
              <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700/50 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform group-hover:translate-y-1 shadow-2xl">
                Back to Assessments
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-900"></div>
              </div>
            </button>

            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 mt-10 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/15 border border-violet-500/20">
                  <FaTable className="text-violet-400 text-sm" />
                </div>
                <h3 className="text-xl font-bold text-white">Student Answer Details</h3>
              </div>
              <div className="p-6 sm:p-8">
                <div className="space-y-6">
                  {studentQuestions.map((q, i) => {
                    const isCorrect = isAnswerCorrect(q.correct_answer, q.student_answer, q.question_type);

                    return (
                      <div
                        key={i}
                        className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-5 sm:p-6 hover:border-indigo-500/30 transition-all duration-200 animate-slideInUp"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-bold text-lg text-white flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                              Question {q.question_order || i + 1}
                            </span>
                            <span className="text-sm font-normal text-slate-400">({q.question_type})</span>
                          </h4>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-700/40 rounded-xl p-4 mb-4">
                          <p className="text-slate-200 font-medium leading-relaxed">{q.question_text}</p>
                        </div>

                        {q.options && (
                          <div className="mb-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                            <strong className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-2">Options:</strong>
                            <ul className="space-y-1.5">
                              {(typeof q.options === "string" ? JSON.parse(q.options) : q.options).map((opt, idx) => (
                                <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                  <span className="text-indigo-400 font-bold mt-0.5">•</span>
                                  <span>{opt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-4 transition-transform hover:scale-[1.02]">
                            <strong className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-2">Correct Answer</strong>
                            <p className="font-bold text-lg text-emerald-400">
                              {q.question_type === 'true_false'
                                ? (q.correct_answer === true || q.correct_answer === 'true' ? 'True' : 'False')
                                : q.correct_answer || "N/A"
                              }
                            </p>
                          </div>
                          <div className={`border rounded-xl p-4 backdrop-blur-sm transition-transform hover:scale-[1.02] ${isCorrect
                              ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30"
                              : "bg-gradient-to-br from-red-500/20 to-rose-500/20 border-red-500/30"
                            }`}>
                            <strong className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-2">Student Answer</strong>
                            <p className={`font-bold text-lg ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                              {q.question_type === 'true_false'
                                ? (q.student_answer === true || q.student_answer === 'true' ? 'True' : 'False')
                                : q.student_answer || "—"
                              }
                            </p>
                          </div>
                          <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 transition-transform hover:scale-[1.02]">
                            <strong className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-2">Score</strong>
                            <p className="font-bold text-lg text-white">
                              {isCorrect ? (q.positive_marks || 1) : (q.score || -Math.abs(q.negative_marks || 0))}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-full shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:scale-110 transition-all duration-300 animate-fadeIn cursor-pointer"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="text-xl" />
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

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out;
        }

        .scroll-mt-24 {
          scroll-margin-top: 6rem;
        }
      ` }} />
    </div>
  );
}

export default AssessmentAnalytics;
