"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import useAssessmentsStore from "@/features/assessments/store.js";
import useModal from "@/hooks/useModal.js";

export default function useAssessmentList() {
  const {
    assessments,
    loading,
    getInstructorAssessments,
    deleteAssessment,
    cloneAssessment,
  } = useAssessmentsStore();

  const { modal, showModal, closeModal } = useModal();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [isDeleting, setIsDeleting] = useState(false);
  const [cloningId, setCloningId] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    assessmentId: null,
    title: "",
  });

  const [paperModal, setPaperModal] = useState({
    isOpen: false,
    assessmentId: null,
    title: "",
    assessment: null,
  });

  useEffect(() => {
    if (typeof getInstructorAssessments === "function") {
      getInstructorAssessments();
    }
  }, [getInstructorAssessments]);

  const openPaperModal = useCallback((assessment) => {
    setPaperModal({
      isOpen: true,
      assessmentId: assessment.id,
      title: assessment.title,
      assessment,
    });
  }, []);

  const closePaperModal = useCallback(() => {
    setPaperModal({
      isOpen: false,
      assessmentId: null,
      title: "",
      assessment: null,
    });
  }, []);

  const requestDelete = useCallback((assessment) => {
    setDeleteConfirm({
      isOpen: true,
      assessmentId: assessment.id,
      title: assessment.title,
    });
  }, []);

  const cancelDelete = useCallback(() => {
    if (!isDeleting) {
      setDeleteConfirm({ isOpen: false, assessmentId: null, title: "" });
    }
  }, [isDeleting]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirm.assessmentId) return;
    try {
      setIsDeleting(true);
      await deleteAssessment(deleteConfirm.assessmentId);
      setDeleteConfirm({ isOpen: false, assessmentId: null, title: "" });
      showModal("success", "Deleted!", "Assessment removed successfully");
    } catch {
      showModal("error", "Error", "Failed to delete assessment");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteConfirm.assessmentId, deleteAssessment, showModal]);

  const handleCloneAssessment = useCallback(async (assessmentId) => {
    if (!assessmentId || cloningId) return;
    setCloningId(assessmentId);
    try {
      const cloned = await cloneAssessment(assessmentId);
      if (cloned) {
        showModal("success", "Success", "Assessment cloned successfully!");
      }
    } catch (err) {
      showModal("error", "Cloning Failed", err.message || "Failed to clone assessment.");
    } finally {
      setCloningId(null);
    }
  }, [cloningId, cloneAssessment, showModal]);

  const filteredAssessments = useMemo(() => {
    if (!Array.isArray(assessments)) return [];
    const query = searchTerm.trim().toLowerCase();
    if (!query) return assessments;
    return assessments.filter((a) =>
      a?.title?.toLowerCase().includes(query)
    );
  }, [assessments, searchTerm]);

  return {
    assessments,
    filteredAssessments,
    loading,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    cloningId,
    handleCloneAssessment,
    isDeleting,
    deleteConfirm,
    requestDelete,
    cancelDelete,
    handleDeleteConfirm,
    paperModal,
    openPaperModal,
    closePaperModal,
    modal,
    closeModal,
  };
}
