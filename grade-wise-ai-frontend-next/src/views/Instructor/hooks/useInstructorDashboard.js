import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/features/auth/store.js";
import useAssessmentStore from "@/features/assessments/store.js";
import useInstructorAnalyticsStore from "@/features/instructor-analytics/store.js";
import useModal from "@/hooks/useModal.js";

export default function useInstructorDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { assessments, getInstructorAssessments } = useAssessmentStore();
  const { overview, getInstructorOverview } = useInstructorAnalyticsStore();
  const { modal, showModal, closeModal } = useModal();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const openPaperModal = (assessment) => {
    setPaperModal({
      isOpen: true,
      assessmentId: assessment.id,
      title: assessment.title,
      assessment,
    });
  };

  const closePaperModal = () => {
    setPaperModal({
      isOpen: false,
      assessmentId: null,
      title: "",
      assessment: null,
    });
  };

  const openDeleteConfirm = (assessment) => {
    setDeleteConfirm({
      isOpen: true,
      assessmentId: assessment.id,
      title: assessment.title,
    });
  };

  const closeDeleteConfirm = () => {
    if (!isDeleting) {
      setDeleteConfirm({
        isOpen: false,
        assessmentId: null,
        title: "",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.assessmentId) return;
    try {
      setIsDeleting(true);
      await useAssessmentStore.getState().deleteAssessment(deleteConfirm.assessmentId);
      await getInstructorOverview(true);
      setDeleteConfirm({ isOpen: false, assessmentId: null, title: "" });
      showModal("success", "Deleted!", "Assessment removed successfully");
    } catch {
      showModal("error", "Error", "Failed to delete assessment");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsInitialLoading(true);
        await Promise.all([
          getInstructorAssessments(),
          getInstructorOverview(),
        ]);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch dashboard data:", error);
        const errorMessage =
          error.response?.data?.message || error.message || "Failed to fetch dashboard data.";
        showModal("error", "Error", errorMessage);
        if (error.response?.status === 403 || error.message === "No authentication token found") {
          router.push("/login");
        }
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    user,
    assessments,
    overview,
    isInitialLoading,
    isDeleting,
    modal,
    closeModal,
    deleteConfirm,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleDeleteConfirm,
    paperModal,
    openPaperModal,
    closePaperModal,
  };
}
