import { describe, it, expect } from "vitest";
import { evaluateAnswer, normalizeMatchPairs } from "./student-evaluation.service.js";
import type { GeneratedQuestion } from "../../db/schema.js";

function mockQuestion(partial: Partial<GeneratedQuestion>): GeneratedQuestion {
  return {
    id: 1,
    attemptId: 1,
    questionText: "Sample question?",
    questionType: "multiple_choice",
    options: ["A", "B", "C", "D"],
    correctAnswer: "A",
    positiveMarks: "1.00",
    negativeMarks: "0.25",
    durationPerQuestion: 60,
    questionOrder: 1,
    createdAt: new Date(),
    ...partial,
  };
}

describe("student-evaluation.service", () => {
  describe("normalizeMatchPairs", () => {
    it("returns null for non-string, empty, or invalid JSON", () => {
      expect(normalizeMatchPairs("")).toBeNull();
      expect(normalizeMatchPairs("invalid json")).toBeNull();
      expect(normalizeMatchPairs("123")).toBeNull();
    });

    it("parses array of tuples", () => {
      const input = JSON.stringify([["Cat", "Feline"], ["Dog", "Canine"]]);
      const result = normalizeMatchPairs(input);
      expect(result).toEqual([
        ["cat", "feline"],
        ["dog", "canine"],
      ]);
    });

    it("parses array of single-key objects", () => {
      const input = JSON.stringify([{ Cat: "Feline" }, { Dog: "Canine" }]);
      const result = normalizeMatchPairs(input);
      expect(result).toEqual([
        ["cat", "feline"],
        ["dog", "canine"],
      ]);
    });

    it("parses key-value map object", () => {
      const input = JSON.stringify({ France: "Paris", Japan: "Tokyo" });
      const result = normalizeMatchPairs(input);
      expect(result).toEqual([
        ["france", "paris"],
        ["japan", "tokyo"],
      ]);
    });
  });

  describe("evaluateAnswer", () => {
    it("returns false for empty answers or missing correct answer", () => {
      const q = mockQuestion({ correctAnswer: "option a" });
      expect(evaluateAnswer(q, "")).toBe(false);

      const qEmpty = mockQuestion({ correctAnswer: "" });
      expect(evaluateAnswer(qEmpty, "option a")).toBe(false);
    });

    it("evaluates exact matching with whitespace and case insensitivity", () => {
      const q = mockQuestion({ correctAnswer: "Photosynthesis" });
      expect(evaluateAnswer(q, "photosynthesis")).toBe(true);
      expect(evaluateAnswer(q, "  Photosynthesis  ")).toBe(true);
      expect(evaluateAnswer(q, "PHOTOSYNTHESIS")).toBe(true);
      expect(evaluateAnswer(q, "cellular respiration")).toBe(false);
    });

    it("evaluates matching question types accurately", () => {
      const correctStr = JSON.stringify([["A", "1"], ["B", "2"]]);
      const q = mockQuestion({ questionType: "matching", correctAnswer: correctStr });

      const studentCorrect = JSON.stringify([["a", "1"], ["b", "2"]]);
      expect(evaluateAnswer(q, studentCorrect)).toBe(true);

      const studentObjectFormat = JSON.stringify({ a: "1", b: "2" });
      expect(evaluateAnswer(q, studentObjectFormat)).toBe(true);

      const studentWrong = JSON.stringify([["a", "2"], ["b", "1"]]);
      expect(evaluateAnswer(q, studentWrong)).toBe(false);
    });

    it("evaluates true/false questions with synonyms", () => {
      const qTrue = mockQuestion({ questionType: "true_false", correctAnswer: "True" });
      expect(evaluateAnswer(qTrue, "true")).toBe(true);
      expect(evaluateAnswer(qTrue, "yes")).toBe(true);
      expect(evaluateAnswer(qTrue, "correct")).toBe(true);
      expect(evaluateAnswer(qTrue, "right")).toBe(true);
      expect(evaluateAnswer(qTrue, "ا")).toBe(true);
      expect(evaluateAnswer(qTrue, "false")).toBe(false);

      const qFalse = mockQuestion({ questionType: "true_false", correctAnswer: "False" });
      expect(evaluateAnswer(qFalse, "false")).toBe(true);
      expect(evaluateAnswer(qFalse, "no")).toBe(true);
      expect(evaluateAnswer(qFalse, "incorrect")).toBe(true);
      expect(evaluateAnswer(qFalse, "wrong")).toBe(true);
      expect(evaluateAnswer(qFalse, "ب")).toBe(true);
      expect(evaluateAnswer(qFalse, "true")).toBe(false);
    });
  });
});
