import { describe, it, expect } from "vitest";
import { PassThrough } from "stream";
import {
  generatePhysicalPaperPdf,
  validateAndProcessPdf,
  type PhysicalPaperOptions,
} from "./pdf.js";

describe("PDF Utility & Validation", () => {
  describe("validateAndProcessPdf", () => {
    it("flags empty or corrupt buffers (< 200 bytes)", () => {
      const smallBuf = Buffer.from("%PDF-1.4 header only");
      const result = validateAndProcessPdf(smallBuf);

      expect(result.isValid).toBe(false);
      expect(result.issues).toContain("Generated PDF stream is empty or corrupt (< 200 bytes)");
    });

    it("flags missing %PDF- magic signature", () => {
      const noHeader = Buffer.alloc(250, "a");
      noHeader.write("%%EOF", 240);
      const result = validateAndProcessPdf(noHeader);

      expect(result.isValid).toBe(false);
      expect(result.issues).toContain("Missing valid %PDF- magic signature header");
    });

    it("flags missing %%EOF trailer marker", () => {
      const noTail = Buffer.alloc(250, "b");
      noTail.write("%PDF-1.4", 0);
      const result = validateAndProcessPdf(noTail);

      expect(result.isValid).toBe(false);
      expect(result.issues).toContain("Truncated PDF structure: Missing %%EOF trailer marker");
    });

    it("validates paper options constraints (totalMarks and paperTime)", () => {
      const validPdf = Buffer.alloc(300, 0);
      validPdf.write("%PDF-1.4", 0);
      validPdf.write("%%EOF", 290);

      const invalidMarksResult = validateAndProcessPdf(validPdf, { totalMarks: 0 });
      expect(invalidMarksResult.isValid).toBe(false);
      expect(invalidMarksResult.issues).toContain("Total marks must be a positive numeric value");

      const emptyTimeResult = validateAndProcessPdf(validPdf, { paperTime: "   " });
      expect(emptyTimeResult.isValid).toBe(false);
      expect(emptyTimeResult.issues).toContain("Paper time field is empty or unformatted");
    });

    it("returns isValid true for structurally intact PDF with valid options", () => {
      const validPdf = Buffer.alloc(300, 0);
      validPdf.write("%PDF-1.4", 0);
      validPdf.write("%%EOF", 290);

      const result = validateAndProcessPdf(validPdf, {
        totalMarks: 50,
        paperTime: "10:00 AM",
      });

      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe("generatePhysicalPaperPdf", () => {
    it("generates a valid, readable PDF stream for standard paper options", async () => {
      const options: PhysicalPaperOptions = {
        instituteName: "GradeWise Academy",
        teacherName: "Dr. Alan Turing",
        subjectName: "Computer Science 101",
        paperDate: "2026-10-16",
        paperTime: "09:00 AM",
        paperDuration: "60 mins",
        totalMarks: 20,
        pageSize: "A4",
        headerFontSize: 16,
        bodyFontSize: 11,
        language: "en",
        notes: "Answer all questions clearly.",
        questions: [
          {
            questionNumber: 1,
            questionText: "What is the time complexity of binary search?",
            questionType: "multiple_choice",
            options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
            marks: 5,
          },
          {
            questionNumber: 2,
            questionText: "Define polymorphism in object-oriented programming.",
            questionType: "short_answer",
            marks: 15,
          },
        ],
      };

      const stream = new PassThrough();
      const chunks: Buffer[] = [];

      const streamPromise = new Promise<Buffer>((resolve, reject) => {
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
      });

      generatePhysicalPaperPdf(options, stream);

      const pdfBuffer = await streamPromise;

      expect(pdfBuffer.length).toBeGreaterThan(1000);
      const validation = validateAndProcessPdf(pdfBuffer, options);
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });
  });
});
