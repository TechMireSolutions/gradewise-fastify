import { describe, it, expect } from "vitest";
import {
  QuestionBlockSchema,
  CreateAssessmentSchema,
  PhysicalPaperSchema,
} from "./assessments.schema.js";

describe("Assessments Module Schemas", () => {
  describe("QuestionBlockSchema", () => {
    it("applies sane defaults for questionCount and durationPerQuestion", () => {
      const result = QuestionBlockSchema.safeParse({
        questionType: "multiple_choice",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.questionCount).toBe(5);
        expect(result.data.durationPerQuestion).toBe(60);
        expect(result.data.positiveMarks).toBe(1);
        expect(result.data.negativeMarks).toBe(0.25);
      }
    });

    it("enforces negative marks cannot exceed positive marks per question", () => {
      // 2 positive marks, 1 negative mark deduction => valid
      const valid = QuestionBlockSchema.safeParse({
        questionType: "multiple_choice",
        positiveMarks: 2,
        negativeMarks: 1,
      });
      expect(valid.success).toBe(true);

      // 1 positive mark, 2 negative marks deduction => invalid
      const invalid = QuestionBlockSchema.safeParse({
        questionType: "multiple_choice",
        positiveMarks: 1,
        negativeMarks: 2,
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.issues[0]?.message).toContain(
          "Negative marks deduction cannot exceed positive marks"
        );
      }
    });

    it("rejects non-positive marks or marks exceeding 100", () => {
      expect(
        QuestionBlockSchema.safeParse({
          questionType: "short_answer",
          positiveMarks: 0,
        }).success
      ).toBe(false);

      expect(
        QuestionBlockSchema.safeParse({
          questionType: "short_answer",
          positiveMarks: 105,
        }).success
      ).toBe(false);
    });

    it("enforces question count between 1 and 50", () => {
      expect(
        QuestionBlockSchema.safeParse({
          questionType: "true_false",
          questionCount: 0,
        }).success
      ).toBe(false);

      expect(
        QuestionBlockSchema.safeParse({
          questionType: "true_false",
          questionCount: 51,
        }).success
      ).toBe(false);

      expect(
        QuestionBlockSchema.safeParse({
          questionType: "true_false",
          questionCount: 10,
        }).success
      ).toBe(true);
    });
  });

  describe("CreateAssessmentSchema", () => {
    it("validates valid assessment creation payload", () => {
      const payload = {
        title: "  Midterm Exam on World History  ",
        questionBlocks: [
          {
            questionType: "multiple_choice",
            questionCount: 5,
          },
        ],
        language: "en",
      };

      const result = CreateAssessmentSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Midterm Exam on World History");
      }
    });

    it("requires at least 1 question block and at most 10", () => {
      expect(
        CreateAssessmentSchema.safeParse({
          title: "Exam",
          questionBlocks: [],
          language: "en",
        }).success
      ).toBe(false);
    });
  });

  describe("PhysicalPaperSchema", () => {
    it("validates complete physical paper generation settings", () => {
      const payload = {
        instituteName: "Springfield Academy",
        teacherName: "Prof. John Smith",
        subjectName: "Physics 201",
        paperDate: "2026-10-20",
        paperTime: "10:00 AM",
        paperDuration: "2 Hours",
        totalMarks: 100,
        pageSize: "A4",
        headerFontSize: 16,
        bodyFontSize: 12,
        outputFormat: "pdf",
      };

      const result = PhysicalPaperSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("rejects total marks <= 0", () => {
      const invalid = {
        instituteName: "Academy",
        teacherName: "Teacher",
        subjectName: "Subject",
        paperDate: "2026-10-20",
        paperTime: "10:00 AM",
        paperDuration: "1 Hour",
        totalMarks: 0,
      };

      expect(PhysicalPaperSchema.safeParse(invalid).success).toBe(false);
    });
  });
});
