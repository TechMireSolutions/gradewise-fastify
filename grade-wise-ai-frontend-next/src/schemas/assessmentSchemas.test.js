import test from "node:test";
import assert from "node:assert/strict";
import {
  assessmentLanguages,
  createAssessmentSchema,
} from "./assessmentSchemas.js";

test("assessmentLanguages", async (t) => {
  await t.test("contains English, Urdu, Arabic, and Persian language options", () => {
    const values = assessmentLanguages.map((l) => l.value);
    assert.deepStrictEqual(values, ["en", "ur", "ar", "fa"]);
  });
});

test("createAssessmentSchema", async (t) => {
  const validBaseBlock = {
    questionType: "multiple_choice",
    questionCount: 5,
    durationPerQuestion: 60,
    positiveMarks: 1,
    negativeMarks: 0.25,
  };

  await t.test("accepts valid assessment with text prompt", () => {
    const valid = {
      title: "Algorithms Midterm",
      prompt: "Focus on sorting and graph algorithms",
      language: "en",
      questionBlocks: [validBaseBlock],
    };
    const result = createAssessmentSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  await t.test("accepts valid assessment with selected resources without prompt", () => {
    const valid = {
      title: "Data Structures Quiz",
      selectedResources: [101, 102],
      questionBlocks: [validBaseBlock],
    };
    const result = createAssessmentSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.language, "en"); // defaults to "en"
  });

  await t.test("accepts valid assessment with external links without prompt", () => {
    const valid = {
      title: "Web Standards Exam",
      externalLinks: ["https://developer.mozilla.org/en-US/docs/Web"],
      questionBlocks: [validBaseBlock],
    };
    const result = createAssessmentSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  await t.test("rejects when prompt, resources, and links are all absent (superRefine)", () => {
    const invalid = {
      title: "Incomplete Assessment",
      questionBlocks: [validBaseBlock],
    };
    const result = createAssessmentSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(
      result.error.issues[0].message,
      /Provide a Prompt, Resources, or External Links/
    );
    assert.deepStrictEqual(result.error.issues[0].path, ["prompt"]);
  });

  await t.test("rejects title shorter than 3 characters", () => {
    const invalid = {
      title: "CS",
      prompt: "Valid prompt",
      questionBlocks: [validBaseBlock],
    };
    const result = createAssessmentSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /Title is required/);
  });

  await t.test("rejects empty questionBlocks array", () => {
    const invalid = {
      title: "Algorithms Final",
      prompt: "Comprehensive review",
      questionBlocks: [],
    };
    const result = createAssessmentSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /At least one question block/);
  });

  await t.test("rejects question block duration less than 30 seconds", () => {
    const invalid = {
      title: "Speed Math",
      prompt: "Arithmetic test",
      questionBlocks: [
        {
          ...validBaseBlock,
          durationPerQuestion: 20,
        },
      ],
    };
    const result = createAssessmentSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /at least 30 seconds/);
  });

  await t.test("rejects question block duration exceeding 600 seconds", () => {
    const invalid = {
      title: "Extended Essay",
      prompt: "Long answer test",
      questionBlocks: [
        {
          ...validBaseBlock,
          durationPerQuestion: 700,
        },
      ],
    };
    const result = createAssessmentSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });

  await t.test("rejects negative marks deduction exceeding positive marks", () => {
    const invalid = {
      title: "Unfair Quiz",
      prompt: "Harsh penalty test",
      questionBlocks: [
        {
          ...validBaseBlock,
          positiveMarks: 1,
          negativeMarks: 2, // 2 > 1 penalty exceeds positive marks
        },
      ],
    };
    const result = createAssessmentSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(
      result.error.issues[0].message,
      /Negative marks deduction cannot exceed positive marks/
    );
  });

  await t.test("rejects positive marks exceeding 100", () => {
    const invalid = {
      title: "Overweighted Exam",
      prompt: "High marks test",
      questionBlocks: [
        {
          ...validBaseBlock,
          positiveMarks: 150,
          negativeMarks: 1,
        },
      ],
    };
    const result = createAssessmentSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /cannot exceed 100/);
  });
});
