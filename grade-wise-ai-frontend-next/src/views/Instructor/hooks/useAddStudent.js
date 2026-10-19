"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import useAssessmentStore from "@/features/assessments/store.js";
import useAuthStore from "@/features/auth/store.js";
import useModal from "@/hooks/useModal.js";
import { parseZodFieldErrors } from "@/utils/parseZodFieldErrors.js";
import {
  registerStudentSchema,
  enrollStudentSchema,
} from "@/schemas/studentSchemas.js";

export default function useAddStudent({ assessmentId, onStudentAdded }) {
  const router = useRouter();
  const { enrollStudent, assessments, getInstructorAssessments, loading: enrollLoading } =
    useAssessmentStore();
  const { registerStudent, user: currentUser } = useAuthStore();

  const [mode, setMode] = useState(assessmentId ? "enroll" : "register");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(
    assessmentId ? String(assessmentId) : ""
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { modal, showModal: openModal, closeModal } = useModal();

  useEffect(() => {
    if (!assessmentId && assessments.length === 0) {
      getInstructorAssessments().catch(() => {});
    }
  }, [assessmentId, assessments.length, getInstructorAssessments]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  }, []);

  const showModal = useCallback(
    (type, title, message, redirect = false) => {
      openModal(type, title, message);

      if (type === "success" && redirect) {
        setTimeout(() => {
          closeModal();
          if (currentUser?.role === "super_admin") {
            router.push("/super-admin/dashboard");
          } else if (currentUser?.role === "admin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/instructor/dashboard");
          }
        }, 1500);
      }
    },
    [openModal, closeModal, currentUser, router]
  );

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
  }, []);

  const handleRegister = useCallback(
    async (e) => {
      e.preventDefault();
      setErrors({});

      try {
        registerStudentSchema.parse(formData);
      } catch (err) {
        const fieldErrors = parseZodFieldErrors(err);
        if (fieldErrors) {
          setErrors(fieldErrors);
          const firstKey = Object.keys(fieldErrors)[0];
          if (firstKey) {
            document.getElementById(`student-${firstKey}`)?.focus();
          }
          return;
        }
        showModal("error", "Invalid Input", err.message || "Invalid form data");
        return;
      }

      setIsLoading(true);
      try {
        await registerStudent({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });

        const targetAssId =
          assessmentId || (selectedAssessmentId ? Number(selectedAssessmentId) : null);
        if (targetAssId) {
          await enrollStudent(targetAssId, formData.email.trim());
          onStudentAdded?.();
          resetForm();
          showModal("success", "Success", "Student registered and enrolled successfully!");
        } else {
          resetForm();
          showModal("success", "Success", "Student registered successfully!", true);
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "Registration failed. Please try again.";
        showModal("error", "Registration Failed", errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, assessmentId, selectedAssessmentId, registerStudent, enrollStudent, onStudentAdded, resetForm, showModal]
  );

  const handleEnroll = useCallback(
    async (e) => {
      e.preventDefault();
      setErrors({});

      const targetAssId =
        assessmentId || (selectedAssessmentId ? Number(selectedAssessmentId) : null);
      if (!targetAssId) {
        showModal("error", "Selection Required", "Please select an assessment to enroll the student into.");
        return;
      }

      try {
        enrollStudentSchema.parse({ email: formData.email });
      } catch (err) {
        const fieldErrors = parseZodFieldErrors(err);
        if (fieldErrors?.email) {
          setErrors({ email: fieldErrors.email });
          document.getElementById("enroll-email")?.focus();
          return;
        }
        showModal("error", "Invalid Input", err.message || "Invalid email address");
        return;
      }

      try {
        await enrollStudent(targetAssId, formData.email.trim());
        onStudentAdded?.();
        resetForm();
        showModal("success", "Success", "Student enrolled successfully!");
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "Enrollment failed. Please try again.";
        showModal("error", "Enrollment Failed", errorMessage);
      }
    },
    [formData.email, assessmentId, selectedAssessmentId, enrollStudent, onStudentAdded, resetForm, showModal]
  );

  return {
    mode,
    setMode,
    selectedAssessmentId,
    setSelectedAssessmentId,
    formData,
    errors,
    isLoading,
    enrollLoading,
    assessments,
    currentUser,
    handleChange,
    handleRegister,
    handleEnroll,
    modal,
    closeModal,
  };
}
