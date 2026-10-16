import test from "node:test";
import assert from "node:assert/strict";
import { resourceSchema } from "./resourceSchemas.js";

test("resourceSchema", async (t) => {
  await t.test("accepts valid file resource", () => {
    const valid = {
      title: "Lecture 1 Slides",
      type: "file",
      description: "Introductory lecture slides",
    };
    const result = resourceSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  await t.test("accepts valid link resource with URL", () => {
    const valid = {
      title: "Official Documentation",
      type: "link",
      link: "https://nodejs.org/docs",
    };
    const result = resourceSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  await t.test("accepts valid text resource with content", () => {
    const valid = {
      title: "Reading Notes",
      type: "text",
      content: "These are important lecture notes.",
    };
    const result = resourceSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  await t.test("rejects empty title", () => {
    const invalid = {
      title: "",
      type: "text",
    };
    const result = resourceSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /Title is required/);
  });

  await t.test("rejects title longer than 200 characters", () => {
    const invalid = {
      title: "T".repeat(201),
      type: "text",
    };
    const result = resourceSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /less than 200 characters/);
  });

  await t.test("rejects description longer than 1000 characters", () => {
    const invalid = {
      title: "Valid Title",
      type: "text",
      description: "D".repeat(1001),
    };
    const result = resourceSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /less than 1000 characters/);
  });

  await t.test("rejects unsupported resource type", () => {
    const invalid = {
      title: "Video Resource",
      type: "stream",
    };
    const result = resourceSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });

  await t.test("rejects invalid link URL format", () => {
    const invalid = {
      title: "Website",
      type: "link",
      link: "not-a-valid-url",
    };
    const result = resourceSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /valid URL/);
  });
});
