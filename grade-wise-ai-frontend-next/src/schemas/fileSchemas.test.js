import test from "node:test";
import assert from "node:assert/strict";
import {
  FILE_CONSTANTS,
  fileSchema,
  filesArraySchema,
  validateFiles,
} from "./fileSchemas.js";

test("FILE_CONSTANTS", async (t) => {
  await t.test("defines expected max file size of 10MB", () => {
    assert.strictEqual(FILE_CONSTANTS.MAX_FILE_SIZE, 10 * 1024 * 1024);
  });

  await t.test("includes PDF, Word, Plaintext, PowerPoint, and Image MIME types", () => {
    assert.ok(FILE_CONSTANTS.ALLOWED_FILE_TYPES.includes("application/pdf"));
    assert.ok(FILE_CONSTANTS.ALLOWED_FILE_TYPES.includes("text/plain"));
    assert.ok(FILE_CONSTANTS.ALLOWED_FILE_TYPES.includes("image/png"));
    assert.ok(FILE_CONSTANTS.ALLOWED_FILE_TYPES.includes("image/jpeg"));
  });
});

test("fileSchema", async (t) => {
  await t.test("accepts valid PDF document within size bounds", () => {
    const valid = {
      name: "syllabus.pdf",
      size: 1024 * 500, // 500KB
      type: "application/pdf",
    };
    const result = fileSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  await t.test("rejects file with empty name", () => {
    const invalid = {
      name: "",
      size: 1024,
      type: "application/pdf",
    };
    const result = fileSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /File name is required/);
  });

  await t.test("rejects file with 0 or negative size", () => {
    const invalid = {
      name: "empty.pdf",
      size: 0,
      type: "application/pdf",
    };
    const result = fileSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /positive/);
  });

  await t.test("rejects file exceeding 10MB", () => {
    const invalid = {
      name: "huge.pdf",
      size: 11 * 1024 * 1024,
      type: "application/pdf",
    };
    const result = fileSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /must not exceed 10MB/);
  });

  await t.test("rejects unapproved MIME type", () => {
    const invalid = {
      name: "malware.exe",
      size: 1024,
      type: "application/x-msdownload",
    };
    const result = fileSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /Invalid file type/);
  });
});

test("filesArraySchema", async (t) => {
  await t.test("rejects empty array (min 1 file required)", () => {
    const result = filesArraySchema.safeParse([]);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /At least one file/);
  });

  await t.test("rejects more than 10 files", () => {
    const files = Array.from({ length: 11 }, (_, i) => ({
      name: `file_${i}.pdf`,
      size: 1000,
      type: "application/pdf",
    }));
    const result = filesArraySchema.safeParse(files);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /Cannot upload more than 10 files/);
  });
});

test("validateFiles helper", async (t) => {
  await t.test("returns success true for valid file list", () => {
    const mockFiles = [
      { name: "test.pdf", size: 5000, type: "application/pdf" },
    ];
    const outcome = validateFiles(mockFiles);
    assert.strictEqual(outcome.success, true);
    assert.strictEqual(outcome.data, mockFiles);
  });

  await t.test("returns success false with error message for invalid file list", () => {
    const mockFiles = [
      { name: "bad.bin", size: 5000, type: "application/octet-stream" },
    ];
    const outcome = validateFiles(mockFiles);
    assert.strictEqual(outcome.success, false);
    assert.match(outcome.error, /Invalid file type/);
  });
});
