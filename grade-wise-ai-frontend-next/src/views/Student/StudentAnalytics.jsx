"use client";

import { page, pageInner } from "@/lib/ui.js";
import { useState, useEffect, useRef } from "react";
import useStudentAnalyticsStore from "@/features/student-analytics/store.js";
import apiClient from "@/lib/apiClient.js";
import Modal from "@/components/ui/Modal.jsx";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import useModal from "@/hooks/useModal.js";
import WelcomeBanner from "@/components/layout/WelcomeBanner.jsx";
import { FaGraduationCap } from "react-icons/fa";
import StudentAnalyticsList from "./components/StudentAnalyticsList.jsx";
import StudentAnalyticsSummary from "./components/StudentAnalyticsSummary.jsx";

export default function StudentAnalytics() {
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
  const [downloadLoading, setDownloadLoading] = useState(false);
  const { modal, closeModal } = useModal();
  const resultsRef = useRef(null);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const handleSeeResults = async (attemptId, assessmentId) => {
    const targetId = attemptId || assessmentId;
    setSelectedAssessment(targetId);
    setShowType("results");

    const fallbackItem = assessments.find(
      (a) => String(a.attemptId) === String(targetId) || String(a.id) === String(assessmentId)
    );
    if (fallbackItem) {
      setLiveDetails(fallbackItem);
    }

    try {
      const res = await apiClient.get(`/taking/submissions/${targetId}`);
      const payload = res.data?.data || res.data || {};
      if (payload) {
        setLiveDetails(payload);
      }
    } catch (err) {
      console.error("Live fetch error:", err);
    }
  };

  const handleDownload = async () => {
    if (!selectedAssessment || !liveDetails) return;
    try {
      setDownloadLoading(true);
      await downloadReport(selectedAssessment, liveDetails);
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className={page}>
      <AmbientBackground />

      <div className={pageInner}>
        <div className="max-w-5xl mx-auto mb-8 sm:mb-10">
          <WelcomeBanner
            eyebrow="Student Portal"
            title="My Analytics"
            description="Review your assessment outcomes, track historical scores, and export detailed performance reports."
            icon={FaGraduationCap}
          />
        </div>

        <StudentAnalyticsList
          assessments={assessments}
          selectedAssessment={selectedAssessment}
          onSeeResults={handleSeeResults}
          loading={loading && (!assessments || assessments.length === 0)}
        />

        {showType === "results" && liveDetails && (
          <div ref={resultsRef}>
            <StudentAnalyticsSummary
              liveDetails={liveDetails}
              onDownloadReport={handleDownload}
              downloadLoading={downloadLoading}
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
      />
    </div>
  );
}
