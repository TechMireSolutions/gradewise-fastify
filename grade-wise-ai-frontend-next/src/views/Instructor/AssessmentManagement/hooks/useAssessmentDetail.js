"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import useAssessmentStore from "@/features/assessments/store.js";
import useModal from "@/hooks/useModal.js";

export default function useAssessmentDetail() {
  const { id } = useParams();
  const router = useRouter();
  const {
    currentAssessment,
    getAssessmentById,
    cloneAssessment,
    loading: storeLoading,
    error,
  } = useAssessmentStore();

  const { modal, showModal, closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(true);
  const [isCloning, setIsCloning] = useState(false);
  const [paperModal, setPaperModal] = useState({
    isOpen: false,
    assessmentId: null,
    title: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!id || isNaN(parseInt(id, 10))) {
          showModal("error", "Invalid Assessment", "Invalid assessment ID.");
          router.push("/instructor/assessments");
          return;
        }
        await getAssessmentById(parseInt(id, 10));
      } catch (err) {
        const msg = err.response?.data?.message || err.message || "Failed to load assessment";
        showModal("error", "Error", msg);
        if (err.response?.status === 404) router.push("/instructor/assessments");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, getAssessmentById, router, showModal]);

  const handleClone = useCallback(async () => {
    if (!id || isCloning) return;
    setIsCloning(true);
    try {
      const cloned = await cloneAssessment(id);
      if (cloned?.id) {
        showModal(
          "success",
          "Success",
          "Assessment cloned successfully. Redirecting to new draft..."
        );
        setTimeout(() => {
          router.push(`/instructor/assessments/${cloned.id}/edit`);
        }, 1000);
      }
    } catch (err) {
      showModal("error", "Cloning Failed", err.message || "Failed to clone assessment.");
    } finally {
      setIsCloning(false);
    }
  }, [id, isCloning, cloneAssessment, router, showModal]);

  const openPaperModal = useCallback((assessment) => {
    if (!assessment) return;
    setPaperModal({
      isOpen: true,
      assessmentId: assessment.id,
      title: assessment.title,
    });
  }, []);

  const closePaperModal = useCallback(() => {
    setPaperModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    id,
    currentAssessment,
    isLoading: isLoading || storeLoading,
    error,
    isCloning,
    handleClone,
    paperModal,
    openPaperModal,
    closePaperModal,
    modal,
    closeModal,
  };
}
