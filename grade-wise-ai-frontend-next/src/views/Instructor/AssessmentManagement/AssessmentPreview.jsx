import { cn } from "@/lib/cn.js";
import { card, page } from "@/lib/ui.js";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaExclamationTriangle } from "react-icons/fa";
import LoadingSpinner from "../../../components/ui/LoadingSpinner.jsx";
import AssessmentHeader from "../../../components/AssessmentHeader.jsx";
import AssessmentInfoCard from "../../../components/AssessmentInfoCard.jsx";
import PromptTab from "../../../components/PromptTab.jsx";
import SampleQuestionsTab from "../../../components/SampleQuestionsTab.jsx";
import useAssessmentPreview from "../../../hooks/useAssessmentPreview.js";
import { generateAIPrompt } from "../../../utils/promptGenerator.js";
import AmbientBackground from "../../../components/layout/AmbientBackground.jsx";

function AssessmentPreview() {
  const { id } = useParams();
  const [tab, setTab] = useState("prompt");
  const [copied, setCopied] = useState(false);

  const {
    assessment,
    questions,
    loading,
    error,
    questionError,
    questionsLoading,
    loadPreviewQuestions
  } = useAssessmentPreview(id);

  // Load questions when switching to assessment tab
  useEffect(() => {
    if (tab === "assessment" && assessment) {
      loadPreviewQuestions();
    }
  }, [tab, assessment]);

  const handleCopyPrompt = () => {
    if (!assessment) return;

    const promptText = generateAIPrompt(assessment);
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
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
        <div className="relative bg-card/60 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 shadow-2xl text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25 flex items-center justify-center mx-auto mb-5">
            <FaExclamationTriangle className="text-white text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Unable to Load Assessment</h2>
          <p className={cn("text-muted-foreground", "mb-6")}>{error}</p>
          <Link
            to="/instructor/assessments"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <FaArrowLeft />
            Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={page}>
      <AmbientBackground />

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">

        <AssessmentHeader assessmentId={id} />
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
                copied={copied}
                onCopy={handleCopyPrompt}
              />
            )}

            {tab === "assessment" && (
              <SampleQuestionsTab
                questions={questions}
                questionError={questionError}
                loading={questionsLoading || (questions.length === 0 && !questionError)}
              />
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 sm:mt-8 text-center">
          <Link
            to="/instructor/assessments"
            className={cn("inline-flex", "items-center", "gap-2", "px-6", "py-3", "bg-btn-secondary", "hover:bg-surface-elevated", "border", "border-border", "text-secondary-foreground", "hover:text-foreground", "rounded-xl", "font-medium", "text-sm", "transition-all", "duration-200", "active:scale-95", "cursor-pointer")}
          >
            <FaArrowLeft />
            <span>Back to Assessments</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AssessmentPreview;
