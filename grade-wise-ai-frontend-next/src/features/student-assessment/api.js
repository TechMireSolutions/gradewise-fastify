import apiClient from "@/lib/apiClient.js";

/* =========================
   Assessment Taking
========================= */

export const startAssessmentApi = (assessmentId, payload) =>
  apiClient.post(`/taking/assessments/${assessmentId}/start`, payload);

export const getAssessmentStatusApi = (assessmentId, attemptId) =>
  apiClient.get(`/taking/assessments/${assessmentId}/attempts/${attemptId}/status`);

export const submitAssessmentApi = (assessmentId, payload) =>
  apiClient.post(`/taking/assessments/${assessmentId}/submit`, payload);

export const printAssessmentApi = (assessmentId) =>
  apiClient.get(`/taking/assessments/${assessmentId}/print`, {
    responseType: "blob",
  });

export const getSubmissionDetailsApi = (submissionId) =>
  apiClient.get(`/taking/submissions/${submissionId}`);
