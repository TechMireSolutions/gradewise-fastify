import test from "node:test";
import assert from "node:assert/strict";
import {
  ASSESSMENT_CONSTANTS,
  questionBlockSchema,
  assessmentFormSchema,
  fileValidationSchema,
  validateAssessmentForm,
  validateQuestionBlock,
  validateFiles,
} from "./editAssessmentSchemas.js";

test("ASSESSMENT_CONSTANTS", async (t) => {
  await t.test("defines expected bounds and question types", () => {
    assert.strictEqual(ASSESSMENT_CONSTANTS.MIN_TITLE_LENGTH, 3);
    assert.strictEqual(ASSESSMENT_CONSTANTS.MAX_TITLE_LENGTH, 200);
    assert.strictEqual(ASSESSMENT_CONSTANTS.MIN_PROMPT_LENGTH, 10);
    assert.strictEqual(ASSESSMENT_CONSTANTS.MAX_PROMPT_LENGTH, 5000);
    assert.strictEqual(ASSESSMENT_CONSTANTS.MIN_QUESTION_COUNT, 1);
    assert.strictEqual(ASSESSMENT_CONSTANTS.MAX_QUESTION_COUNT, 100);
    assert.strictEqual(ASSESSMENT_CONSTANTS.MIN_DURATION, 30);
    assert.strictEqual(ASSESSMENT_CONSTANTS.MAX_DURATION, 600);
    assert.strictEqual(ASSESSMENT_CONSTANTS.MIN_OPTIONS, 2);
    assert.strictEqual(ASSESSMENT_CONSTANTS.MAX_OPTIONS, 6);
    assert.deepStrictEqual(ASSESSMENT_CONSTANTS.QUESTION_TYPES, [
      "multiple_choice",
      "short_answer",
      "true_false",
      "fill_in_the_blank",
    ]);
  });
});

test("questionBlockSchema", async (t) => {
  const validMCQ = {
    question_type: "multiple_choice",
    question_count: 5,
    duration_per_question: 60,
    num_options: 4,
    positive_marks: 2,
    negative_marks: 0.5,
  };

  await t.test("accepts valid multiple choice block", () => {
    const result = questionBlockSchema.safeParse(validMCQ);
    assert.strictEqual(result.success, true);
  });

  await t.test("accepts non-multiple-choice block without num_options", () => {
    const shortAnswerBlock = {
      question_type: "short_answer",
      question_count: 3,
      duration_per_question: 120,
      positive_marks: 5,
      negative_marks: 0,
    };
    const result = questionBlockSchema.safeParse(shortAnswerBlock);
    assert.strictEqual(result.success, true);
  });

  await t.test("rejects multiple choice block without num_options", () => {
    const invalidMCQ = {
      ...validMCQ,
      num_options: null,
    };
    const result = questionBlockSchema.safeParse(invalidMCQ);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /options is required/i);
  });

  await t.test("rejects negative marks exceeding positive marks", () => {
    const invalidMarks = {
      ...validMCQ,
      positive_marks: 1,
      negative_marks: 2,
    };
    const result = questionBlockSchema.safeParse(invalidMarks);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /cannot exceed positive marks/i);
  });

  await t.test("rejects question_count out of bounds", () => {
    assert.strictEqual(
      questionBlockSchema.safeParse({ ...validMCQ, question_count: 0 }).success,
      false
    );
    assert.strictEqual(
      questionBlockSchema.safeParse({ ...validMCQ, question_count: 101 }).success,
      false
    );
  });

  await t.test("rejects duration_per_question out of bounds", () => {
    assert.strictEqual(
      questionBlockSchema.safeParse({ ...validMCQ, duration_per_question: 20 }).success,
      false
    );
    assert.strictEqual(
      questionBlockSchema.safeParse({ ...validMCQ, duration_per_question: 601 }).success,
      false
    );
  });

  await t.test("rejects invalid question type", () => {
    assert.strictEqual(
      questionBlockSchema.safeParse({ ...validMCQ, question_type: "essay" }).success,
      false
    );
  });
});

test("assessmentFormSchema", async (t) => {
  const baseBlock = {
    question_type: "multiple_choice",
    question_count: 5,
    duration_per_question: 60,
    num_options: 4,
    positive_marks: 1,
    negative_marks: 0,
  };

  await t.test("accepts valid form with prompt", () => {
    const validForm = {
      title: "Midterm Exam on Machine Learning",
      prompt: "Generate challenging questions focusing on neural networks and backpropagation",
      questionBlocks: [baseBlock],
    };
    assert.strictEqual(assessmentFormSchema.safeParse(validForm).success, true);
  });

  await t.test("accepts valid form with selected resources and no prompt", () => {
    const validForm = {
      title: "Chemistry Chapter 4 Quiz",
      prompt: "",
      selectedResources: [101, 102],
      questionBlocks: [baseBlock],
    };
    assert.strictEqual(assessmentFormSchema.safeParse(validForm).success, true);
  });

  await t.test("accepts valid form with external links", () => {
    const validForm = {
      title: "Web Standards Evaluation",
      externalLinks: ["https://developer.mozilla.org/en-US/docs/Web"],
      questionBlocks: [baseBlock],
    };
    assert.strictEqual(assessmentFormSchema.safeParse(validForm).success, true);
  });

  await t.test("rejects when no prompt, resources, links, or files are provided", () => {
    const invalidForm = {
      title: "Empty Assessment",
      prompt: "Too short", // under MIN_PROMPT_LENGTH (10)
      externalLinks: [],
      selectedResources: [],
      newFiles: [],
      questionBlocks: [baseBlock],
    };
    const result = assessmentFormSchema.safeParse(invalidForm);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /Please provide at least one of/i);
  });

  await t.test("rejects title shorter than 3 characters or longer than 200", () => {
    assert.strictEqual(
      assessmentFormSchema.safeParse({
        title: "Hi",
        prompt: "Valid prompt over 10 characters",
        questionBlocks: [baseBlock],
      }).success,
      false
    );

    assert.strictEqual(
      assessmentFormSchema.safeParse({
        title: "A".repeat(201),
        prompt: "Valid prompt over 10 characters",
        questionBlocks: [baseBlock],
      }).success,
      false
    );
  });

  await t.test("rejects empty questionBlocks", () => {
    assert.strictEqual(
      assessmentFormSchema.safeParse({
        title: "Valid Title",
        prompt: "Valid prompt over 10 characters",
        questionBlocks: [],
      }).success,
      false
    );
  });
});

test("fileValidationSchema", async (t) => {
  await t.test("accepts valid PDF within size limit", () => {
    const validFile = {
      name: "handout.pdf",
      size: 1024 * 500, // 500 KB
      type: "application/pdf",
    };
    assert.strictEqual(fileValidationSchema.safeParse(validFile).success, true);
  });

  await t.test("rejects file exceeding 10MB", () => {
    const bigFile = {
      name: "huge.pdf",
      size: 11 * 1024 * 1024,
      type: "application/pdf",
    };
    assert.strictEqual(fileValidationSchema.safeParse(bigFile).success, false);
  });

  await t.test("rejects disallowed file mime type", () => {
    const exeFile = {
      name: "installer.exe",
      size: 1024,
      type: "application/x-msdownload",
    };
    assert.strictEqual(fileValidationSchema.safeParse(exeFile).success, false);
  });
});

test("validation helper functions", async (t) => {
  await t.test("validateQuestionBlock returns success true on valid block", () => {
    const res = validateQuestionBlock({
      question_type: "true_false",
      question_count: 5,
      duration_per_question: 30,
      positive_marks: 1,
      negative_marks: 0,
    });
    assert.strictEqual(res.success, true);
  });

  await t.test("validateQuestionBlock returns success false and error message on invalid block", () => {
    const res = validateQuestionBlock({
      question_type: "multiple_choice",
      question_count: 0, // invalid count
      duration_per_question: 10, // invalid duration
    });
    assert.strictEqual(res.success, false);
    assert.ok(typeof res.error === "string");
  });

  await t.test("validateAssessmentForm returns success true on valid form", () => {
    const res = validateAssessmentForm({
      title: "History Exam 101",
      prompt: "Generate 5 questions on ancient Roman history",
      questionBlocks: [
        {
          question_type: "short_answer",
          question_count: 5,
          duration_per_question: 60,
          positive_marks: 2,
          negative_marks: 0,
        },
      ],
    });
    assert.strictEqual(res.success, true);
  });

  await t.test("validateAssessmentForm returns fieldErrors on validation failure", () => {
    const res = validateAssessmentForm({
      title: "ab", // too short
      questionBlocks: [],
    });
    assert.strictEqual(res.success, false);
    assert.ok(res.fieldErrors);
    assert.ok(res.fieldErrors.title);
  });

  await t.test("validateFiles handles valid file list and null input safely", () => {
    assert.strictEqual(validateFiles(null).success, true);
    assert.strictEqual(
      validateFiles([
        { name: "test.pdf", size: 1000, type: "application/pdf" },
      ]).success,
      true
    );
    assert.strictEqual(
      validateFiles([
        { name: "bad.exe", size: 1000, type: "application/x-msdownload" },
      ]).success,
      false
    );
  });
});
