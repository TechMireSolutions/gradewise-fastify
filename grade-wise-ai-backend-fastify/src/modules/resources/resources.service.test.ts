import { describe, it, expect } from "vitest";
import { extractTextFromFile } from "./resources.service.js";

describe("Resources Service Helpers", () => {
  describe("extractTextFromFile", () => {
    it("extracts text from plain text file buffer", async () => {
      const file = {
        filename: "syllabus.txt",
        mimetype: "text/plain",
        buffer: Buffer.from("Course syllabus for CS-101: Introduction to Algorithms."),
      };
      const text = await extractTextFromFile(file);
      expect(text).toBe("Course syllabus for CS-101: Introduction to Algorithms.");
    });

    it("strips null bytes from text content", async () => {
      const file = {
        filename: "document.txt",
        mimetype: "text/plain",
        buffer: Buffer.from("Hello\u0000 World\u0000!"),
      };
      const text = await extractTextFromFile(file);
      expect(text).toBe("Hello World!");
      expect(text.includes("\u0000")).toBe(false);
    });

    it("extracts text from markdown files based on extension", async () => {
      const file = {
        filename: "README.md",
        mimetype: "application/octet-stream",
        buffer: Buffer.from("# Topic Overview\nDetailed guide to data structures."),
      };
      const text = await extractTextFromFile(file);
      expect(text).toBe("# Topic Overview\nDetailed guide to data structures.");
    });

    it("extracts text from JSON files", async () => {
      const jsonContent = JSON.stringify({ subject: "Math", chapters: [1, 2, 3] });
      const file = {
        filename: "curriculum.json",
        mimetype: "application/json",
        buffer: Buffer.from(jsonContent),
      };
      const text = await extractTextFromFile(file);
      expect(text).toBe(jsonContent);
    });

    it("returns empty string for unsupported binary formats", async () => {
      const file = {
        filename: "archive.zip",
        mimetype: "application/zip",
        buffer: Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      };
      const text = await extractTextFromFile(file);
      expect(text).toBe("");
    });

    it("returns empty string for empty buffer", async () => {
      const file = {
        filename: "empty.txt",
        mimetype: "text/plain",
        buffer: Buffer.from(""),
      };
      const text = await extractTextFromFile(file);
      expect(text).toBe("");
    });
  });
});
