"use client";

import { cn } from "@/lib/cn.js";
import { btn, page } from "@/lib/ui.js";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAssessmentStore from "@/features/assessments/store.js";
import useResourceStore from "@/features/resources/store.js";
import { Button, Modal } from "@/components/ui";
import { createAssessmentSchema } from "@/schemas/assessmentSchemas.js";
import { FiArrowLeft, FiZap } from "react-icons/fi";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import useModal from "@/hooks/useModal.js";
import useAssessmentForm from "./hooks/useAssessmentForm.js";
import AssessmentMetadataCard from "./components/AssessmentMetadataCard.jsx";
import QuestionBlockList from "./components/QuestionBlockList.jsx";
import AssessmentResourcePicker from "./components/AssessmentResourcePicker.jsx";
import AssessmentExternalLinks from "./components/AssessmentExternalLinks.jsx";

export default function CreateAssessment() {
  const router = useRouter();
  const { createAssessment } = useAssessmentStore();
  const { resources, fetchAllResources, loading: resourcesLoading } = useResourceStore();
  const { modal, showModal, closeModal } = useModal();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    formData,
    handleInputChange,
    handleLinkChange,
    addExternalLink,
    removeExternalLink,
    selectedResources,
    handleResourceToggle,
    questionBlocks,
    handleBlockChange,
    handleNegativeMarksBlur,
    addQuestionBlock,
    removeQuestionBlock,
    getSanitizedBlocks,
  } = useAssessmentForm();

  useEffect(() => {
    fetchAllResources();
  }, [fetchAllResources]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sanitizedBlocks = getSanitizedBlocks();

    const validationResult = createAssessmentSchema.safeParse({
      title: formData.title,
      prompt: formData.prompt,
      language: "en",
      selectedResources,
      externalLinks: formData.externalLinks.filter((l) => l.trim() !== ""),
      questionBlocks: sanitizedBlocks,
    });

    if (!validationResult.success) {
      showModal(
        "error",
        "Validation Error",
        validationResult.error.issues?.[0]?.message || "Invalid assessment form data."
      );
      return;
    }

    setIsProcessing(true);

    const payload = {
      title: formData.title.trim(),
      prompt: formData.prompt.trim(),
      language: "en",
      externalLinks: formData.externalLinks.filter((link) => link.trim()),
      selectedResources,
      questionBlocks: sanitizedBlocks.map((block) => ({
        questionType: block.questionType,
        questionCount: block.questionCount,
        durationPerQuestion: block.durationPerQuestion,
        ...(block.questionType === "multiple_choice" ? { numOptions: block.numOptions } : {}),
        leftCount: block.questionType === "matching" ? block.leftCount : undefined,
        rightCount: block.questionType === "matching" ? block.rightCount : undefined,
        positiveMarks: block.positiveMarks,
        negativeMarks: block.negativeMarks,
      })),
    };

    try {
      await createAssessment(payload);
      showModal("success", "Success", "Assessment created successfully!");
      setTimeout(() => {
        router.push("/instructor/assessments");
      }, 1500);
    } catch (err) {
      showModal("error", "Error", err.message || "Failed to create assessment");
    } finally {
      setIsProcessing(false);
    }
  };

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
              Create New Assessment
            </h1>
            <p className="text-muted-foreground leading-relaxed text-pretty">
              Design a comprehensive assessment with customizable question blocks and AI parameters
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/instructor/assessments")}
            className={cn(
              btn.secondary,
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm self-start sm:self-auto cursor-pointer"
            )}
          >
            <FiArrowLeft className="text-base" />
            Back to Assessments
          </button>
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
            titlePlaceholder="e.g., Data Structures Midterm Examination"
          />

          {/* Resources Picker */}
          <AssessmentResourcePicker
            resources={resources}
            selectedResources={selectedResources}
            onToggleResource={handleResourceToggle}
            loading={resourcesLoading}
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
              <FiZap className="text-lg" />
              {isProcessing ? "Generating Assessment..." : "Create Assessment"}
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
