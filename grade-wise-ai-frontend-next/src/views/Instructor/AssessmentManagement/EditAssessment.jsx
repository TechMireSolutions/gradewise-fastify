"use client";

import { cn } from "@/lib/cn.js";
import { btn, card, page } from "@/lib/ui.js";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useAssessmentStore from "@/features/assessments/store.js";
import useResourceStore from "@/features/resources/store.js";
import { Button, LoadingSpinner, Modal } from "@/components/ui";
import { validateAssessmentForm, validateFiles } from "@/schemas/editAssessmentSchemas.js";
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaSave,
  FaCopy,
} from "react-icons/fa";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import useModal from "@/hooks/useModal.js";
import useAssessmentForm from "./hooks/useAssessmentForm.js";
import AssessmentMetadataCard from "./components/AssessmentMetadataCard.jsx";
import AssessmentLockedNotice from "./components/AssessmentLockedNotice.jsx";
import QuestionBlockList from "./components/QuestionBlockList.jsx";
import AssessmentResourcePicker from "./components/AssessmentResourcePicker.jsx";
import AssessmentExternalLinks from "./components/AssessmentExternalLinks.jsx";

export default function EditAssessment() {
  const { id } = useParams();
  const router = useRouter();
  const {
    currentAssessment,
    loading,
    error,
    getAssessmentById,
    updateAssessment,
    cloneAssessment,
  } = useAssessmentStore();

  const {
    resources,
    fetchAllResources,
    uploadResources,
    loading: resourcesLoading,
  } = useResourceStore();

  const { modal, showModal, closeModal } = useModal();
  const [isCloning, setIsCloning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    formData,
    handleInputChange,
    handleLinkChange,
    addExternalLink,
    removeExternalLink,
    selectedResources,
    handleResourceToggle,
    newFiles,
    setNewFiles,
    questionBlocks,
    handleBlockChange,
    handleNegativeMarksBlur,
    addQuestionBlock,
    removeQuestionBlock,
    hydrateFromAssessment,
    getSanitizedBlocks,
  } = useAssessmentForm();

  useEffect(() => {
    fetchAllResources();
  }, [fetchAllResources]);

  useEffect(() => {
    if (id) {
      getAssessmentById(id);
    }
  }, [id, getAssessmentById]);

  useEffect(() => {
    if (currentAssessment && currentAssessment.id === Number(id)) {
      hydrateFromAssessment(currentAssessment);
    }
  }, [currentAssessment, id, hydrateFromAssessment]);

  const handleClone = async () => {
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
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validation = validateFiles(files);
    if (!validation.success) {
      showModal("error", "File Validation Error", validation.error);
      e.target.value = "";
      return;
    }
    setNewFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sanitizedBlocks = getSanitizedBlocks();

    // Map to validation schema expectations
    const validationBlocks = sanitizedBlocks.map((b) => ({
      question_type: b.questionType,
      question_count: b.questionCount,
      duration_per_question: b.durationPerQuestion,
      num_options: b.questionType === "multiple_choice" ? b.numOptions : null,
      positive_marks: b.positiveMarks,
      negative_marks: b.negativeMarks,
    }));

    const validation = validateAssessmentForm({
      title: formData.title,
      prompt: formData.prompt,
      externalLinks: formData.externalLinks,
      questionBlocks: validationBlocks,
      selectedResources,
      newFiles,
    });

    if (!validation.success) {
      showModal("error", "Validation Error", validation.error);
      return;
    }

    setIsProcessing(true);

    let finalResources = [...selectedResources];
    if (newFiles && newFiles.length > 0) {
      try {
        const uploaded = await uploadResources(newFiles);
        const newIds = (Array.isArray(uploaded) ? uploaded : [])
          .map((r) => r.id)
          .filter(Boolean);
        finalResources = [...new Set([...finalResources, ...newIds])];
      } catch (uploadErr) {
        showModal(
          "error",
          "Resource Upload Failed",
          uploadErr.message || "Failed to upload new files."
        );
        setIsProcessing(false);
        return;
      }
    }

    const assessmentData = {
      title: formData.title.trim(),
      prompt: formData.prompt !== undefined ? formData.prompt.trim() : "",
      language: formData.language || "en",
      externalLinks: (formData.externalLinks || []).filter((l) => l && l.trim()),
      selectedResources: finalResources,
      questionBlocks: sanitizedBlocks.map((b) => ({
        questionType: b.questionType,
        questionCount: b.questionCount,
        durationPerQuestion: b.durationPerQuestion,
        numOptions: b.questionType === "multiple_choice" ? b.numOptions : 4,
        leftCount: b.questionType === "matching" ? (Number(b.leftCount) || 3) : 3,
        rightCount: b.questionType === "matching" ? (Number(b.rightCount) || 4) : 4,
        positiveMarks: b.positiveMarks,
        negativeMarks: b.negativeMarks,
      })),
    };

    try {
      await updateAssessment(parseInt(id, 10), assessmentData);
      showModal("success", "Success!", "Assessment updated successfully!");
      setTimeout(() => router.push("/instructor/assessments"), 1500);
    } catch (err) {
      showModal("error", "Error", err.message || "Update failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !currentAssessment || currentAssessment.id !== Number(id)) {
    return (
      <div className={cn(page, "flex flex-col justify-center items-center")}>
        <AmbientBackground />
        <div className="relative flex flex-col items-center justify-center py-32 gap-4">
          <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <LoadingSpinner size="lg" type="spinner" color="blue" />
          </div>
          <p className="text-muted-foreground text-sm">Loading assessment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={page}>
        <AmbientBackground />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className={cn(card, "shadow-2xl p-8 text-center")}>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 flex items-center justify-center mb-6 mx-auto">
              <FaExclamationTriangle className="text-red-400 text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Error</h1>
            <p className="text-muted-foreground mb-8">{error}</p>
            <button
              onClick={() => router.push("/instructor/assessments")}
              className={cn(btn.primary, "px-5 py-3 inline-flex items-center gap-2 cursor-pointer")}
            >
              <FaArrowLeft />
              Back to Assessments
            </button>
          </div>
        </div>
        <Modal
          isOpen={modal.isOpen}
          onClose={closeModal}
          type={modal.type}
          title={modal.title}
          message={modal.message}
        />
      </div>
    );
  }

  if (currentAssessment.is_executed) {
    return (
      <AssessmentLockedNotice
        assessment={currentAssessment}
        isCloning={isCloning}
        onClone={handleClone}
      />
    );
  }

  return (
    <div className={page}>
      <AmbientBackground />

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Instructor Portal
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2 text-balance">
              Edit Assessment
            </h1>
            <p className="text-muted-foreground leading-relaxed text-pretty">
              Update assessment parameters, modify question blocks, or assign additional resources
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleClone}
              disabled={isCloning}
              className={cn(btn.secondary, "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl")}
            >
              <FaCopy />
              <span>{isCloning ? "Cloning..." : "Clone Assessment"}</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/instructor/assessments")}
              className={cn(btn.secondary, "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl")}
            >
              <FaArrowLeft />
              <span>Back</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assessment Metadata Card */}
          <AssessmentMetadataCard
            title={formData.title}
            language={formData.language}
            prompt={formData.prompt}
            onChange={handleInputChange}
            disabled={isProcessing}
            showLanguage={true}
            titlePlaceholder="e.g., Computer Systems Final Exam"
          />

          {/* Resources Picker */}
          <AssessmentResourcePicker
            resources={resources}
            selectedResources={selectedResources}
            onToggleResource={handleResourceToggle}
            loading={resourcesLoading}
            allowUpload={true}
            newFiles={newFiles}
            onFileChange={handleFileChange}
            disabled={isProcessing}
          />

          {/* External Links */}
          <AssessmentExternalLinks
            externalLinks={formData.externalLinks}
            onLinkChange={handleLinkChange}
            onAddLink={addExternalLink}
            onRemoveLink={removeExternalLink}
            disabled={isProcessing}
          />

          {/* Question Blocks */}
          <QuestionBlockList
            questionBlocks={questionBlocks}
            onChange={handleBlockChange}
            onNegativeMarksBlur={handleNegativeMarksBlur}
            onAddBlock={addQuestionBlock}
            onRemoveBlock={removeQuestionBlock}
            disabled={isProcessing}
          />

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/instructor/assessments")}
              disabled={isProcessing}
              className={cn(btn.secondary, "w-full sm:w-auto px-6 py-3 rounded-xl")}
            >
              Cancel
            </button>
            <Button
              type="submit"
              variant="primary"
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-indigo-500/20"
            >
              <FaSave />
              {isProcessing ? "Updating Assessment..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
}
