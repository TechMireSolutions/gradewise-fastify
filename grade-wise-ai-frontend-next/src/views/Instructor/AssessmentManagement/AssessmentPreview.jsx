import { cn } from "@/lib/cn.js";
import { btn, card, page, pageInner } from "@/lib/ui.js";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaExclamationTriangle } from "react-icons/fa";
import LoadingSpinner from "@/components/ui/LoadingSpinner.jsx";
import {
  AssessmentHeader,
  AssessmentInfoCard,
  PromptTab,
  SampleQuestionsTab,
} from "@/components/assessments";
import useAssessmentPreview from "@/hooks/useAssessmentPreview.js";
import useAssessmentStore from "@/features/assessments/store.js";
import { generateAIPrompt } from "@/utils/promptGenerator.js";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import MainLandmark from "@/components/layout/MainLandmark.jsx";
import toast from "react-hot-toast";

function AssessmentPreview() {
  const { id } = useParams();
  const router = useRouter();
  const [tab, setTab] = useState("prompt");
  const [copied, setCopied] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const { cloneAssessment } = useAssessmentStore();

  const {
    assessment,
    questions,
    loading,
    error,
    questionError,
    questionsLoading,
    aiPrompt,
    aiPromptLoading,
    selectedLanguage,
    selectLanguage,
    promptLanguage,
    selectPromptLanguage,
    loadPreviewQuestions,
    loadAIPrompt
  } = useAssessmentPreview(id);

  // Load questions when switching to assessment tab
  useEffect(() => {
    if (tab === "assessment" && assessment && selectedLanguage) {
      loadPreviewQuestions(selectedLanguage);
    }
  }, [tab, assessment, selectedLanguage, loadPreviewQuestions]);

  // Load the real AI prompt when switching to prompt tab
  useEffect(() => {
    if (tab === "prompt" && assessment && promptLanguage) {
      loadAIPrompt(promptLanguage);
    }
  }, [tab, assessment, promptLanguage, loadAIPrompt]);

  const handleCopyPrompt = () => {
    if (!assessment) return;

    let promptText;
    if (aiPrompt?.unifiedPrompt) {
      promptText = aiPrompt.unifiedPrompt;
    } else if (aiPrompt?.blocks?.length > 0) {
      promptText = aiPrompt.blocks
        .map((b, i) => `--- Block ${i + 1} (${b.questionType} x${b.questionCount}) ---\n${b.prompt}`)
        .join("\n\n");
    } else {
      promptText = generateAIPrompt(assessment, promptLanguage || selectedLanguage);
    }
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleClone = async () => {
    if (!id || isCloning) return;
    setIsCloning(true);
    try {
      const cloned = await cloneAssessment(id);
      if (cloned?.id) {
        toast.success("Assessment cloned successfully!");
        router.push(`/instructor/assessments/${cloned.id}/edit`);
      }
    } catch {
      toast.error("Failed to clone assessment");
    } finally {
      setIsCloning(false);
    }
  };

  if (loading) {
    return (
      <div className={cn(page, "flex", "flex-col", "items-center", "justify-center")}>
        <AmbientBackground />
        <div className="relative flex flex-col items-center justify-center py-32 gap-4">
          <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <LoadingSpinner size="lg" type="spinner" color="blue" />
          </div>
          <p className={cn("text-muted-foreground", "text-sm")}>Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(page, "flex", "items-center", "justify-center", "px-4")}>
        <AmbientBackground />
        <MainLandmark className="relative bg-card/60 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 shadow-2xl text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25 flex items-center justify-center mx-auto mb-5">
            <FaExclamationTriangle className="text-white text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Unable to Load Assessment</h2>
          <p className={cn("text-muted-foreground", "mb-6")}>{error}</p>
          <Link
            href="/instructor/assessments"
            className={cn(btn.primary, "inline-flex items-center gap-2 px-5 py-3", "cursor-pointer")}
          >
            <FaArrowLeft />
            Back to Assessments
          </Link>
        </MainLandmark>
      </div>
    );
  }

  return (
    <div className={page}>
      <AmbientBackground />

      <MainLandmark className={pageInner}>

        <AssessmentHeader
          assessmentId={id}
          isExecuted={assessment?.is_executed}
          onClone={handleClone}
          isCloning={isCloning}
        />
        <AssessmentInfoCard assessment={assessment} />

        {/* Tabs */}
        <div className={cn(card, "shadow-2xl", "overflow-hidden")}>
          <div className="border-b border-border overflow-x-auto bg-input">
            <div className="flex min-w-max">
              <button
                onClick={() => setTab("prompt")}
                className={`flex-1 sm:flex-none px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  tab === "prompt"
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-btn-secondary"
                }`}
              >
                Full AI Prompt
              </button>
              <button
                onClick={() => setTab("assessment")}
                className={`flex-1 sm:flex-none px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  tab === "assessment"
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-btn-secondary"
                }`}
              >
                Sample Assessment
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {tab === "prompt" && (
              <PromptTab
                assessment={assessment}
                aiPrompt={aiPrompt}
                aiPromptLoading={aiPromptLoading}
                copied={copied}
                onCopy={handleCopyPrompt}
                selectedLanguage={promptLanguage || selectedLanguage || "en"}
                onLanguageChange={selectPromptLanguage}
              />
            )}

            {tab === "assessment" && (
              <SampleQuestionsTab
                questions={questions}
                questionError={questionError}
                loading={questionsLoading || (questions.length === 0 && !questionError)}
                selectedLanguage={selectedLanguage}
                onLanguageChange={selectLanguage}
              />
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 sm:mt-8 text-center">
          <Link
            href="/instructor/assessments"
            className={cn(btn.secondary, "inline-flex items-center gap-2 px-6 py-3 rounded-xl")}
          >
            <FaArrowLeft />
            <span>Back to Assessments</span>
          </Link>
        </div>
      </MainLandmark>
    </div>
  );
}

export default AssessmentPreview;
