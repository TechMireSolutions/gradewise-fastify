import test from "node:test";
import assert from "node:assert/strict";
import { registerStudentSchema, enrollStudentSchema } from "./studentSchemas.js";

test("registerStudentSchema", async (t) => {
  await t.test("accepts valid student registration with matching passwords", () => {
    const valid = {
      name: "Alan Turing",
      email: "alan@gradewise.ai",
      password: "StudentPass123",
      confirmPassword: "StudentPass123",
    };
    const result = registerStudentSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  await t.test("rejects mismatched passwords", () => {
    const invalid = {
      name: "Alan Turing",
      email: "alan@gradewise.ai",
      password: "StudentPass123",
      confirmPassword: "WrongPassword999",
    };
    const result = registerStudentSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.issues[0].message, "Passwords do not match");
    assert.deepStrictEqual(result.error.issues[0].path, ["confirmPassword"]);
  });

  await t.test("rejects invalid email address", () => {
    const invalid = {
      name: "Alan Turing",
      email: "not-an-email",
      password: "StudentPass123",
      confirmPassword: "StudentPass123",
    };
    const result = registerStudentSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /valid email/);
  });

  await t.test("rejects name shorter than 2 characters", () => {
    const invalid = {
      name: "A",
      email: "alan@gradewise.ai",
      password: "StudentPass123",
      confirmPassword: "StudentPass123",
    };
    const result = registerStudentSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /at least 2 characters/);
  });
});

test("enrollStudentSchema", async (t) => {
  await t.test("accepts valid student email for enrollment", () => {
    const valid = { email: "enrolled@gradewise.ai" };
    const result = enrollStudentSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  await t.test("rejects invalid email for enrollment", () => {
    const invalid = { email: "invalid-email" };
    const result = enrollStudentSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /valid email/);
  });
});
