import test from "node:test";
import assert from "node:assert/strict";
import {
  PAGE_DIMENSIONS,
  getPageDimensions,
  sanitizeFileName,
  wrapText,
} from "./paperUtils.js";

test("PAGE_DIMENSIONS and getPageDimensions", async (t) => {
  await t.test("defines standard dimensions for A4, A5, and Letter", () => {
    assert.deepStrictEqual(PAGE_DIMENSIONS.A4, [595.28, 841.89]);
    assert.deepStrictEqual(PAGE_DIMENSIONS.A5, [420.94, 595.28]);
    assert.deepStrictEqual(PAGE_DIMENSIONS.Letter, [612, 792]);
  });

  await t.test("getPageDimensions returns dimensions for existing size", () => {
    assert.deepStrictEqual(getPageDimensions("A5"), [420.94, 595.28]);
    assert.deepStrictEqual(getPageDimensions("Letter"), [612, 792]);
  });

  await t.test("getPageDimensions defaults to A4 for unknown or empty size", () => {
    assert.deepStrictEqual(getPageDimensions("Tabloid"), PAGE_DIMENSIONS.A4);
    assert.deepStrictEqual(getPageDimensions(null), PAGE_DIMENSIONS.A4);
    assert.deepStrictEqual(getPageDimensions(undefined), PAGE_DIMENSIONS.A4);
  });
});

test("sanitizeFileName", async (t) => {
  await t.test("replaces whitespace with underscores", () => {
    assert.strictEqual(
      sanitizeFileName("Midterm Exam Paper 2026"),
      "Midterm_Exam_Paper_2026"
    );
  });

  await t.test("strips special characters, punctuation, and path separators", () => {
    assert.strictEqual(
      sanitizeFileName("Final/Exam: CS-101 (v1.0)#@!"),
      "FinalExam_CS-101_v10"
    );
  });

  await t.test("preserves alphanumeric characters, hyphens, and underscores", () => {
    assert.strictEqual(
      sanitizeFileName("grade-wise_exam_01"),
      "grade-wise_exam_01"
    );
  });
});

test("wrapText", async (t) => {
  // Mock font with simple character-width calculation
  const mockFont = {
    widthOfTextAtSize: (text, size) => text.length * (size * 0.5),
  };

  await t.test("wraps LTR text into multiple lines when exceeding maxWidth", () => {
    const text = "The quick brown fox jumps over the lazy dog";
    // size 10 means 5 units per char. maxWidth 60 fits ~12 chars per line
    const lines = wrapText(text, mockFont, 10, 60, false);
    assert.ok(lines.length > 1);
    assert.strictEqual(lines.join(" "), text);
  });

  await t.test("handles short text that fits on a single line", () => {
    const text = "Short text";
    const lines = wrapText(text, mockFont, 10, 200, false);
    assert.strictEqual(lines.length, 1);
    assert.strictEqual(lines[0], text);
  });

  await t.test("wraps RTL text properly", () => {
    const text = "کتاب اول درس دوم";
    const lines = wrapText(text, mockFont, 10, 40, true);
    assert.ok(Array.isArray(lines));
    assert.ok(lines.length >= 1);
  });
});
