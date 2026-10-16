import { describe, it, expect } from "vitest";
import {
  createFallbackQuestion,
  sanitizeQuestion,
} from "./generation.js";
import type { GeneratedQuestion } from "../../db/schema.js";

describe("Student Assessment Generation Helpers", () => {
  describe("createFallbackQuestion", () => {
    it("creates multiple choice fallback question with 4 options", () => {
      const q = createFallbackQuestion("multiple_choice", 1);
      expect(q.question_text).toBe("Question 1 (generation failed)");
      expect(q.question_type).toBe("multiple_choice");
      expect(q.options).toEqual(["Option A", "Option B", "Option C", "Option D"]);
      expect(q.correct_answer).toBe("N/A");
    });

    it("creates true/false fallback question with True as correct answer", () => {
      const q = createFallbackQuestion("true_false", 2);
      expect(q.question_text).toBe("Question 2 (generation failed)");
      expect(q.question_type).toBe("true_false");
      expect(q.options).toBeUndefined();
      expect(q.correct_answer).toBe("True");
    });

    it("creates short_answer fallback question without options", () => {
      const q = createFallbackQuestion("short_answer", 3);
      expect(q.question_text).toBe("Question 3 (generation failed)");
      expect(q.question_type).toBe("short_answer");
      expect(q.options).toBeUndefined();
      expect(q.correct_answer).toBe("N/A");
    });
  });

  describe("sanitizeQuestion", () => {
    it("strips correctAnswer and attemptId to protect exam integrity", () => {
      const mockDbQuestion: GeneratedQuestion = {
        id: 42,
        attemptId: 999,
        questionOrder: 1,
        questionType: "multiple_choice",
        questionText: "What is the capital of France?",
        options: ["Paris", "London", "Berlin", "Madrid"],
        correctAnswer: "Paris",
        durationPerQuestion: 60,
        positiveMarks: "1.00",
        negativeMarks: "0.25",
        createdAt: new Date(),
      };

      const sanitized = sanitizeQuestion(mockDbQuestion);

      // Kept fields
      expect(sanitized.id).toBe(42);
      expect(sanitized.questionOrder).toBe(1);
      expect(sanitized.questionType).toBe("multiple_choice");
      expect(sanitized.questionText).toBe("What is the capital of France?");
      expect(sanitized.options).toEqual(["Paris", "London", "Berlin", "Madrid"]);
      expect(sanitized.durationPerQuestion).toBe(60);
      expect(sanitized.positiveMarks).toBe("1.00");
      expect(sanitized.negativeMarks).toBe("0.25");

      // Stripped sensitive fields (must NOT exist on returned object)
      expect((sanitized as Record<string, unknown>).correctAnswer).toBeUndefined();
      expect((sanitized as Record<string, unknown>).attemptId).toBeUndefined();
    });
  });
});
