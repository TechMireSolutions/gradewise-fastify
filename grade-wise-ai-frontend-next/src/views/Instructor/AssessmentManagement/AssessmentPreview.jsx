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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center">
        <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>
        <div className="relative flex flex-col items-center justify-center py-32 gap-4">
          <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <LoadingSpinner size="lg" type="spinner" color="blue" />
          </div>
          <p className="text-slate-400 text-sm">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>
        <div className="relative bg-slate-800/40 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 shadow-2xl text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25 flex items-center justify-center mx-auto mb-5">
            <FaExclamationTriangle className="text-white text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Unable to Load Assessment</h2>
          <p className="text-slate-400 mb-6">{error}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">

        <AssessmentHeader assessmentId={id} />
        <AssessmentInfoCard assessment={assessment} />

        {/* Tabs */}
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="border-b border-slate-700/50 overflow-x-auto bg-slate-800/60">
            <div className="flex min-w-max">
              <button
                onClick={() => setTab("prompt")}
                className={`flex-1 sm:flex-none px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  tab === "prompt"
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/60"
                }`}
              >
                Full AI Prompt
              </button>
              <button
                onClick={() => setTab("assessment")}
                className={`flex-1 sm:flex-none px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  tab === "assessment"
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/60"
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer"
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
