import { describe, it, expect } from "vitest";
import {
  StartAssessmentSchema,
  SubmitAnswerItemSchema,
  SubmitAssessmentSchema,
  AttemptStatusParamSchema,
} from "./student-assessments.schema.js";

describe("Student Assessments Module Schemas", () => {
  describe("StartAssessmentSchema", () => {
    it("defaults language to en if omitted", () => {
      const result = StartAssessmentSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.language).toBe("en");
      }
    });

    it("accepts valid multilingual language codes", () => {
      expect(StartAssessmentSchema.safeParse({ language: "ur" }).success).toBe(true);
      expect(StartAssessmentSchema.safeParse({ language: "ar" }).success).toBe(true);
      expect(StartAssessmentSchema.safeParse({ language: "fa" }).success).toBe(true);
    });
  });

  describe("SubmitAssessmentSchema & SubmitAnswerItemSchema", () => {
    it("validates complete assessment submission payload", () => {
      const payload = {
        attemptId: 12,
        answers: [
          { questionId: 101, answer: "Option B" },
          { questionId: 102, answer: "True" },
          { questionId: 103, answer: JSON.stringify([["A", "1"], ["B", "2"]]) },
        ],
      };
      expect(SubmitAssessmentSchema.safeParse(payload).success).toBe(true);
    });

    it("rejects non-positive attemptId or questionId", () => {
      expect(
        SubmitAssessmentSchema.safeParse({
          attemptId: 0,
          answers: [{ questionId: 1, answer: "A" }],
        }).success
      ).toBe(false);

      expect(
        SubmitAnswerItemSchema.safeParse({
          questionId: -1,
          answer: "A",
        }).success
      ).toBe(false);
    });
  });

  describe("AttemptStatusParamSchema", () => {
    it("coerces string route parameters to positive integers", () => {
      const result = AttemptStatusParamSchema.safeParse({
        assessmentId: "5",
        attemptId: "24",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.assessmentId).toBe(5);
        expect(result.data.attemptId).toBe(24);
      }
    });

    it("rejects invalid route parameter representations", () => {
      expect(
        AttemptStatusParamSchema.safeParse({
          assessmentId: "abc",
          attemptId: "24",
        }).success
      ).toBe(false);
    });
  });
});
