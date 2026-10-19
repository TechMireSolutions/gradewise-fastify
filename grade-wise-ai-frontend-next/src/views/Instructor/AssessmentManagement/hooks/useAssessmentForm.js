import { useState, useCallback } from "react";

export const DEFAULT_QUESTION_BLOCK = {
  questionType: "multiple_choice",
  questionCount: 1,
  durationPerQuestion: 120,
  numOptions: 4,
  leftCount: 3,
  rightCount: 4,
  positiveMarks: 1,
  negativeMarks: 0,
};

export const QUESTION_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "short_answer", label: "Short Answer" },
  { value: "true_false", label: "True / False" },
  { value: "fill_in_the_blank", label: "Fill in the Blank" },
  { value: "matching", label: "Matching" },
];

export const formatNegativeMarksInput = (value) => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }
  let str = String(value).trim();
  // Keep only numeric characters, dots, and minus
  str = str.replace(/[^0-9.-]/g, "");
  if (str === "") return "";
  if (str === "-") return "-";

  // Strip existing minus signs to work with raw digits
  str = str.replace(/-/g, "");

  // If only dot was entered, e.g. "." or "-."
  if (str === ".") return "-0.";

  // Prevent multiple dots: keep only the first decimal point
  const parts = str.split(".");
  if (parts.length > 2) {
    str = parts[0] + "." + parts.slice(1).join("");
  }

  // Always prefix with minus sign
  return `-${str}`;
};

export default function useAssessmentForm(initialData = null) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    prompt: initialData?.prompt || "",
    language: initialData?.language || "en",
    externalLinks: Array.isArray(initialData?.externalLinks) && initialData.externalLinks.length > 0
      ? initialData.externalLinks
      : [""],
  });

  const [questionBlocks, setQuestionBlocks] = useState(
    Array.isArray(initialData?.questionBlocks) && initialData.questionBlocks.length > 0
      ? initialData.questionBlocks
      : [{ ...DEFAULT_QUESTION_BLOCK }]
  );

  const [selectedResources, setSelectedResources] = useState(initialData?.selectedResources || []);
  const [newFiles, setNewFiles] = useState([]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleLinkChange = useCallback((index, value) => {
    setFormData((prev) => ({
      ...prev,
      externalLinks: prev.externalLinks.map((link, i) => (i === index ? value : link)),
    }));
  }, []);

  const addExternalLink = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      externalLinks: [...prev.externalLinks, ""],
    }));
  }, []);

  const removeExternalLink = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      externalLinks: prev.externalLinks.filter((_, i) => i !== index),
    }));
  }, []);

  const handleResourceToggle = useCallback((resourceId) => {
    setSelectedResources((prev) =>
      prev.includes(resourceId) ? prev.filter((id) => id !== resourceId) : [...prev, resourceId]
    );
  }, []);

  const handleBlockChange = useCallback((index, field, value) => {
    setQuestionBlocks((prev) =>
      prev.map((block, i) => {
        if (i !== index) return block;

        if (field === "questionCount" || field === "question_count") {
          return { ...block, questionCount: Math.max(Number.parseInt(value, 10) || 1, 1) };
        }
        if (field === "durationPerQuestion" || field === "duration_per_question") {
          return { ...block, durationPerQuestion: Math.max(Number.parseInt(value, 10) || 30, 30) };
        }
        if (field === "numOptions" || field === "num_options") {
          return { ...block, numOptions: Math.max(Number.parseInt(value, 10) || 2, 2) };
        }
        if (field === "leftCount" || field === "num_first_side") {
          return { ...block, leftCount: Math.max(Number.parseInt(value, 10) || 2, 2) };
        }
        if (field === "rightCount" || field === "num_second_side") {
          return { ...block, rightCount: Math.max(Number.parseInt(value, 10) || 2, 2) };
        }
        if (field === "positiveMarks" || field === "positive_marks") {
          return {
            ...block,
            positiveMarks:
              value === "" || value === null
                ? null
                : value === "-"
                  ? "-"
                  : isNaN(Number(value))
                    ? 1
                    : Math.abs(Number(value)),
          };
        }
        if (field === "negativeMarks" || field === "negative_marks") {
          return { ...block, negativeMarks: formatNegativeMarksInput(value) };
        }
        if (field === "questionType" || field === "question_type") {
          return { ...block, questionType: value };
        }
        return { ...block, [field]: value };
      })
    );
  }, []);

  const handleNegativeMarksBlur = useCallback((index) => {
    setQuestionBlocks((prev) =>
      prev.map((block, i) => {
        if (i !== index) return block;
        const val = String(block.negativeMarks ?? "").trim();
        if (val === "" || val === "-" || val === "-." || val === "-0.") {
          return { ...block, negativeMarks: 0 };
        }
        const num = Number(val);
        if (!isNaN(num)) {
          return { ...block, negativeMarks: num === 0 ? 0 : -Math.abs(num) };
        }
        return { ...block, negativeMarks: 0 };
      })
    );
  }, []);

  const addQuestionBlock = useCallback((type = "multiple_choice") => {
    setQuestionBlocks((prev) => [
      ...prev,
      {
        ...DEFAULT_QUESTION_BLOCK,
        questionType: type,
      },
    ]);
  }, []);

  const removeQuestionBlock = useCallback((index) => {
    setQuestionBlocks((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const hydrateFromAssessment = useCallback((assessment) => {
    if (!assessment) return;

    setFormData({
      title: assessment.title || "",
      prompt: assessment.prompt || "",
      language: assessment.language || "en",
      externalLinks:
        Array.isArray(assessment.external_links) && assessment.external_links.length > 0
          ? assessment.external_links
          : [""],
    });

    if (Array.isArray(assessment.question_blocks) && assessment.question_blocks.length > 0) {
      setQuestionBlocks(
        assessment.question_blocks.map((block) => ({
          questionType: block.question_type || block.questionType || "multiple_choice",
          questionCount: Number(block.question_count || block.questionCount) || 1,
          durationPerQuestion: Number(block.duration_per_question || block.durationPerQuestion) || 120,
          numOptions: Number(block.num_options || block.numOptions) || 4,
          leftCount: Number(block.num_first_side || block.leftCount) || 3,
          rightCount: Number(block.num_second_side || block.rightCount) || 4,
          positiveMarks:
            block.positive_marks !== undefined && block.positive_marks !== null
              ? Number(block.positive_marks)
              : (block.positiveMarks ?? 1),
          negativeMarks:
            block.negative_marks !== undefined && block.negative_marks !== null
              ? (Number(block.negative_marks) === 0 ? 0 : -Math.abs(Number(block.negative_marks)))
              : (block.negativeMarks ?? 0),
        }))
      );
    }

    if (Array.isArray(assessment.resources)) {
      setSelectedResources(
        assessment.resources
          .map((r) => r.id)
          .filter((id) => id && !isNaN(Number(id)))
      );
    }
  }, []);

  const getSanitizedBlocks = useCallback(() => {
    return questionBlocks.map((b) => {
      const pos =
        b.positiveMarks === "" || b.positiveMarks === "-" || b.positiveMarks == null
          ? 1
          : Math.abs(Number(b.positiveMarks) || 1);
      const neg =
        b.negativeMarks === "" || b.negativeMarks === "-" || b.negativeMarks == null
          ? 0
          : isNaN(Number(b.negativeMarks))
            ? 0
            : Number(b.negativeMarks) === 0
              ? 0
              : -Math.abs(Number(b.negativeMarks));

      return {
        questionType: b.questionType,
        questionCount: Math.max(1, Number(b.questionCount) || 1),
        durationPerQuestion: Math.max(30, Number(b.durationPerQuestion) || 60),
        numOptions: b.questionType === "multiple_choice" ? Math.max(2, Number(b.numOptions) || 4) : 4,
        leftCount: b.questionType === "matching" ? Math.max(2, Number(b.leftCount) || 3) : 3,
        rightCount: b.questionType === "matching" ? Math.max(2, Number(b.rightCount) || 4) : 4,
        positiveMarks: pos,
        negativeMarks: neg,
      };
    });
  }, [questionBlocks]);

  return {
    formData,
    setFormData,
    handleInputChange,
    handleLinkChange,
    addExternalLink,
    removeExternalLink,
    selectedResources,
    setSelectedResources,
    handleResourceToggle,
    newFiles,
    setNewFiles,
    questionBlocks,
    setQuestionBlocks,
    handleBlockChange,
    handleNegativeMarksBlur,
    addQuestionBlock,
    removeQuestionBlock,
    hydrateFromAssessment,
    getSanitizedBlocks,
  };
}
