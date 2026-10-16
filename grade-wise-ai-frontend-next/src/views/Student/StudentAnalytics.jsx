"use client";
import { cn } from "@/lib/cn.js";

import { card, page } from "@/lib/ui.js";
import { useState, useEffect, useRef } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import useStudentAnalyticsStore from "@/features/student-analytics/store.js";
import apiClient from "@/lib/apiClient.js";
import Modal from "../../components/ui/Modal.jsx";
import AmbientBackground from "../../components/layout/AmbientBackground.jsx";
import useModal from "../../hooks/useModal.js";

const StudentAnalytics = () => {
  const {
    assessments,
    selectedAssessment,
    loading,
    fetchAssessments,
    setSelectedAssessment,
    downloadReport,
  } = useStudentAnalyticsStore();

  const [showType, setShowType] = useState(null);
  const [liveDetails, setLiveDetails] = useState(null);
  const { modal, closeModal } = useModal();
  const resultsRef = useRef(null);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const formatTime = (seconds) => {
    const secs = parseInt(seconds, 10);
    if (isNaN(secs) || secs <= 0) return "0m 0s";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m + "m " + s + "s";
  };

  const handleSeeResults = async (attemptId, assessmentId) => {
    const targetId = attemptId || assessmentId;
    setSelectedAssessment(targetId);
    setShowType("results");
    
    const fallbackItem = assessments.find(a => String(a.attemptId) === String(targetId) || String(a.id) === String(assessmentId));
    if (fallbackItem) {
      setLiveDetails(fallbackItem);
    }
    
    try {
      const res = await apiClient.get("/taking/submissions/" + targetId);
      const payload = res.data?.data || res.data || {};
      if (payload) {
        setLiveDetails(payload);
      }
    } catch (err) {
      console.error("Live fetch error:", err);
    }
  };

  if (loading)
    return (
      <div className={cn(page, "flex", "items-center", "justify-center")}>
        <LoadingSpinner size="lg" type="spinner" color="blue" />
      </div>
    );

  const rawScore = liveDetails?.scorePercentage !== undefined 
    ? liveDetails.scorePercentage 
    : (liveDetails?.score !== undefined ? liveDetails.score : 0);
  const resScore = parseFloat(rawScore);
  
  // Real-time calculation using timestamps difference on screen
  let calculatedSeconds = 0;
  if (liveDetails?.startedAt && liveDetails?.completedAt) {
    const start = new Date(liveDetails.startedAt).getTime();
    const end = new Date(liveDetails.completedAt).getTime();
    if (!isNaN(start) && !isNaN(end) && end > start) {
      calculatedSeconds = Math.floor((end - start) / 1000);
    }
  }
  const resTime = calculatedSeconds;
  
  const resCorrect = liveDetails?.correctAnswersCount !== undefined 
    ? liveDetails.correctAnswersCount 
    : (liveDetails?.correct_answers !== undefined ? liveDetails.correct_answers : 0);
    
  const resTotal = liveDetails?.totalQuestionsCount !== undefined 
    ? liveDetails.totalQuestionsCount 
    : (liveDetails?.total_questions !== undefined ? liveDetails.total_questions : 5);
    
  const resTitle = liveDetails?.title || liveDetails?.assessmentTitle || "Assessment Summary";

  return (
    <div className={page}>
      <AmbientBackground />
      <div className="relative w-full mx-auto px-4 py-8">
        <div className="mb-8">
          <div className={cn(card, "p-6 text-center shadow-2xl")}>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Analytics</h1>
            <p className="text-muted-foreground text-sm">Review performance and track progress</p>
          </div>
        </div>

        <div className="space-y-4 max-w-5xl mx-auto">
          {Array.isArray(assessments) && assessments.length > 0 ? (
            assessments.map((a) => (
              <div key={a.attemptId || a.id} className={cn("bg-card/60 backdrop-blur-sm border p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4", selectedAssessment === (a.attemptId || a.id) ? "border-indigo-500" : "border-border")}>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{a.title || "Assessment"}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Status: Completed</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleSeeResults(a.attemptId, a.id)} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-xs font-semibold">Results</button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-muted-foreground">No assessments completed yet</div>
          )}
        </div>

        {showType === "results" && liveDetails && (
          <div ref={resultsRef} className="mt-10 max-w-5xl mx-auto space-y-6">
            <div className={cn(card, "overflow-hidden shadow-2xl")}>
              <div className="px-6 py-5 border-b border-border bg-input text-center">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Performance Summary</p>
                <h2 className="text-xl font-bold text-foreground">{resTitle}</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-6">
                    <p className="text-3xl font-bold text-foreground">{resScore}%</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Score</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 rounded-xl p-6">
                    <p className="text-3xl font-bold text-foreground">{formatTime(resTime)}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Time Taken</p>
                  </div>
                  <div className="bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30 rounded-xl p-6">
                    <p className="text-3xl font-bold text-foreground">{resCorrect} / {resTotal}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Correct</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <button onClick={() => downloadReport(selectedAssessment, liveDetails)} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl text-sm">Download Full Report (PDF)</button>
            </div>
          </div>
        )}
      </div>
      <Modal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onClose={closeModal} />
    </div>
  );
};

export default StudentAnalytics;
