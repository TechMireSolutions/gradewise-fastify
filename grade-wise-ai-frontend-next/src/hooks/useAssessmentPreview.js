import { useState, useEffect, useCallback } from "react";
import useAssessmentStore from "@/features/assessments/store.js";

function useAssessmentPreview(assessmentId) {
  const { getAssessmentById, fetchPreviewQuestions, getAIPrompt } = useAssessmentStore();

  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questionError, setQuestionError] = useState(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(null);
  const [aiPromptLoading, setAiPromptLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  // Load assessment data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await getAssessmentById(assessmentId);
        setAssessment(data);
        setSelectedLanguage((prev) => prev || data?.language || "en");
        setError(null);
      } catch {
        setError("Failed to load assessment. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [assessmentId, getAssessmentById]);

  // Load real AI prompt blueprint (the exact prompt sent to the AI)
  const loadAIPrompt = useCallback(async () => {
    if (!assessmentId || aiPrompt || aiPromptLoading) return;
    setAiPromptLoading(true);
    try {
      const data = await getAIPrompt(assessmentId);
      setAiPrompt(data);
    } catch {
      setAiPrompt(null); // fallback to local generator
    } finally {
      setAiPromptLoading(false);
    }
  }, [assessmentId, aiPrompt, aiPromptLoading, getAIPrompt]);

  // Load preview questions in the given language
  const loadPreviewQuestions = useCallback(async (language) => {
    if (!assessment || !language) return;

    setQuestionsLoading(true);
    try {
      setQuestionError(null);
      const q = await fetchPreviewQuestions(assessmentId, language);

      if (!Array.isArray(q) || q.length === 0) {
        throw new Error("Empty preview result");
      }

      setQuestions(q);
    } catch {
      setQuestionError("Failed to generate sample questions. Please retry.");
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  }, [assessment, assessmentId, fetchPreviewQuestions]);

  const selectLanguage = useCallback((language) => {
    setSelectedLanguage(language);
    setQuestions([]);
    setQuestionError(null);
  }, []);

  return {
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
    loadPreviewQuestions,
    loadAIPrompt
  };
}

export default useAssessmentPreview;
