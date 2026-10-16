import { describe, it, expect, vi } from "vitest";

vi.mock("../../db/index.js", () => ({
  db: {
    select: vi.fn(),
  },
  assessmentResources: {},
  resourceChunks: {},
  resources: {},
  assessments: {},
}));

import {
  buildUnifiedAssignmentPrompt,
  parseUnifiedAssignmentQuestionsFromAI,
  type QuestionBlockLike,
} from "./question-generation.js";

describe("Question Generation Prompt Builder & AI Parser", () => {
  const sampleBlocks: QuestionBlockLike[] = [
    {
      id: 1,
      questionType: "multiple_choice",
      questionCount: 2,
      durationPerQuestion: 45,
      numOptions: 4,
      positiveMarks: 2,
      negativeMarks: 0.5,
    },
    {
      id: 2,
      questionType: "true_false",
      questionCount: 1,
      durationPerQuestion: 30,
      positiveMarks: 1,
      negativeMarks: 0,
    },
    {
      id: 3,
      questionType: "matching",
      questionCount: 1,
      leftCount: 3,
      rightCount: 3,
      durationPerQuestion: 90,
      positiveMarks: 3,
      negativeMarks: 0.5,
    },
  ];

  describe("buildUnifiedAssignmentPrompt", () => {
    it("constructs an English prompt with all block specifications", () => {
      const prompt = buildUnifiedAssignmentPrompt(
        sampleBlocks,
        "Focus on fundamental concepts.",
        "Photosynthesis is the process used by plants...",
        "en",
        "English",
        "Biology 101 Quiz"
      );

      expect(prompt).toContain('Assignment Title: "Biology 101 Quiz"');
      expect(prompt).toContain('Instructor Instructions / Topic: "Focus on fundamental concepts."');
      expect(prompt).toContain("Photosynthesis is the process");
      expect(prompt).toContain("multiple_choice");
      expect(prompt).toContain("true_false");
      expect(prompt).toContain("matching");
      expect(prompt).toContain("Total Questions to Generate: 4");
    });

    it("supports multilingual target configurations (e.g., Urdu)", () => {
      const prompt = buildUnifiedAssignmentPrompt(
        sampleBlocks,
        "توجہ بنیادی تصورات پر ہو",
        "پودوں میں ضیائی تالیف کا عمل...",
        "ur",
        "Urdu",
        "حیاتیات کوئز"
      );

      expect(prompt).toContain("حیاتیات کوئز");
      expect(prompt).toContain("اردو");
    });
  });

  describe("parseUnifiedAssignmentQuestionsFromAI", () => {
    it("parses valid JSON response with questions array", () => {
      const rawAiResponse = JSON.stringify({
        instructions: "Read questions carefully.",
        questions: [
          {
            question_text: "What is the powerhouse of the cell?",
            options: ["Mitochondria", "Nucleus", "Ribosome", "Golgi apparatus"],
            correct_answer: "Mitochondria",
          },
          {
            question_text: "Which organelle contains DNA?",
            options: ["Mitochondria", "Nucleus", "Ribosome", "Vacuole"],
            correct_answer: "Nucleus",
          },
          {
            question_text: "Plants carry out photosynthesis.",
            options: ["True", "False"],
            correct_answer: "True",
          },
          {
            question_text: "Match the cellular components with their functions.",
            left_items: ["Mitochondria", "Ribosome", "Chloroplast"],
            right_items: ["Energy production", "Protein synthesis", "Photosynthesis"],
            correct_answer: "Model matching",
          },
        ],
      });

      const parsed = parseUnifiedAssignmentQuestionsFromAI(rawAiResponse, sampleBlocks) as Array<Record<string, any>>;

      expect(parsed).toHaveLength(4);
      expect(parsed[0]?.question_type).toBe("multiple_choice");
      expect(parsed[0]?.question_text).toBe("What is the powerhouse of the cell?");
      expect(parsed[0]?.positive_marks).toBe(2);
      expect(parsed[0]?.negative_marks).toBe(0.5);
      expect(parsed[0]?.duration_per_question).toBe(45);

      expect(parsed[2]?.question_type).toBe("true_false");
      expect(parsed[2]?.correct_answer).toBe("True");

      expect(parsed[3]?.question_type).toBe("matching");
      expect(parsed[3]?.left_items).toEqual(["Mitochondria", "Ribosome", "Chloroplast"]);
    });

    it("parses JSON array when AI does not wrap in an object", () => {
      const singleBlock: QuestionBlockLike[] = [
        {
          questionType: "short_answer",
          questionCount: 1,
          durationPerQuestion: 60,
          positiveMarks: 5,
          negativeMarks: 0,
        },
      ];

      const rawAiResponse = JSON.stringify([
        {
          question_text: "Explain osmosis in 2-3 sentences.",
          correct_answer: "Osmosis is the net movement of water molecules...",
        },
      ]);

      const parsed = parseUnifiedAssignmentQuestionsFromAI(rawAiResponse, singleBlock) as Array<Record<string, any>>;

      expect(parsed).toHaveLength(1);
      expect(parsed[0]?.question_type).toBe("short_answer");
      expect(parsed[0]?.question_text).toBe("Explain osmosis in 2-3 sentences.");
      expect(parsed[0]?.positive_marks).toBe(5);
    });

    it("falls back to default structure safely on malformed AI output", () => {
      const malformedAiResponse = "Sorry, I encountered an internal error. Here is some text.";

      const parsed = parseUnifiedAssignmentQuestionsFromAI(malformedAiResponse, sampleBlocks) as Array<Record<string, any>>;

      expect(parsed).toHaveLength(4);
      expect(parsed[0]?.question_type).toBe("multiple_choice");
      expect(parsed[0]?.question_text).toContain("Question 1");
      expect(parsed[2]?.question_type).toBe("true_false");
      expect(parsed[3]?.question_type).toBe("matching");
    });
  });
});
