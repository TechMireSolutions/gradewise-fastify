"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import useAssessmentStore from "@/features/assessments/store.js";
import useModal from "@/hooks/useModal.js";

export default function useEnrollStudents(assessmentId) {
  const { getEnrolledStudents, unenrollStudent, enrolledStudents, loading } = useAssessmentStore();
  const { modal, showModal, closeModal } = useModal();
  const [searchTerm, setSearchTerm] = useState("");
  const [isUnenrolling, setIsUnenrolling] = useState(false);

  const [unenrollConfirm, setUnenrollConfirm] = useState({
    isOpen: false,
    studentId: null,
    name: "",
  });

  const fetchStudents = useCallback(async () => {
    if (!assessmentId) return;
    try {
      await getEnrolledStudents(assessmentId);
    } catch (err) {
      showModal("error", "Error", err.message || "Failed to load enrolled students.");
    }
  }, [assessmentId, getEnrolledStudents, showModal]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const requestUnenroll = useCallback((student) => {
    setUnenrollConfirm({
      isOpen: true,
      studentId: student?.id,
      name: student?.name || "Student",
    });
  }, []);

  const cancelUnenroll = useCallback(() => {
    if (!isUnenrolling) {
      setUnenrollConfirm({ isOpen: false, studentId: null, name: "" });
    }
  }, [isUnenrolling]);

  const handleUnenrollConfirm = useCallback(async () => {
    if (!unenrollConfirm.studentId || !assessmentId) return;
    try {
      setIsUnenrolling(true);
      await unenrollStudent(assessmentId, unenrollConfirm.studentId);
      setUnenrollConfirm({ isOpen: false, studentId: null, name: "" });
      showModal("success", "Success", "Student unenrolled successfully.");
      await getEnrolledStudents(assessmentId);
    } catch (err) {
      showModal("error", "Error", err.message || "Failed to unenroll student.");
    } finally {
      setIsUnenrolling(false);
    }
  }, [unenrollConfirm.studentId, assessmentId, unenrollStudent, getEnrolledStudents, showModal]);

  const handleStudentAdded = useCallback(() => {
    if (assessmentId) {
      getEnrolledStudents(assessmentId);
    }
  }, [assessmentId, getEnrolledStudents]);

  const filteredStudents = useMemo(() => {
    if (!Array.isArray(enrolledStudents)) return [];
    const query = searchTerm.trim().toLowerCase();
    if (!query) return enrolledStudents;
    return enrolledStudents.filter(
      (s) =>
        s?.name?.toLowerCase().includes(query) ||
        s?.email?.toLowerCase().includes(query)
    );
  }, [enrolledStudents, searchTerm]);

  return {
    enrolledStudents,
    filteredStudents,
    loading,
    searchTerm,
    setSearchTerm,
    isUnenrolling,
    unenrollConfirm,
    requestUnenroll,
    cancelUnenroll,
    handleUnenrollConfirm,
    handleStudentAdded,
    modal,
    closeModal,
  };
}
