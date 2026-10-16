import test from "node:test";
import assert from "node:assert/strict";
import { loginSchema, signupSchema } from "./authSchemas.js";

test("loginSchema", async (t) => {
  await t.test("accepts valid login credentials", () => {
    const valid = { email: "student@gradewise.ai", password: "Password123" };
    const result = loginSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  await t.test("rejects invalid email address", () => {
    const invalid = { email: "not-an-email", password: "Password123" };
    const result = loginSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /valid email/);
  });

  await t.test("rejects empty password", () => {
    const invalid = { email: "student@gradewise.ai", password: "" };
    const result = loginSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /Password is required/);
  });
});

test("signupSchema", async (t) => {
  await t.test("accepts valid signup payload", () => {
    const valid = {
      name: "Ada Lovelace",
      email: "ada@gradewise.ai",
      password: "StrongPassword1",
    };
    const result = signupSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  await t.test("rejects name shorter than 2 characters", () => {
    const invalid = {
      name: "A",
      email: "ada@gradewise.ai",
      password: "StrongPassword1",
    };
    const result = signupSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /at least 2 characters/);
  });

  await t.test("rejects name longer than 50 characters", () => {
    const invalid = {
      name: "A".repeat(51),
      email: "ada@gradewise.ai",
      password: "StrongPassword1",
    };
    const result = signupSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /less than 50 characters/);
  });

  await t.test("rejects password with less than 8 characters", () => {
    const invalid = {
      name: "Ada Lovelace",
      email: "ada@gradewise.ai",
      password: "Pass1",
    };
    const result = signupSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /at least 8 characters/);
  });

  await t.test("rejects password exceeding 128 characters", () => {
    const invalid = {
      name: "Ada Lovelace",
      email: "ada@gradewise.ai",
      password: "Aa1" + "a".repeat(126),
    };
    const result = signupSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /less than 128 characters/);
  });

  await t.test("rejects password missing uppercase letter", () => {
    const invalid = {
      name: "Ada Lovelace",
      email: "ada@gradewise.ai",
      password: "password123",
    };
    const result = signupSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /at least one uppercase/);
  });

  await t.test("rejects password missing digit", () => {
    const invalid = {
      name: "Ada Lovelace",
      email: "ada@gradewise.ai",
      password: "PasswordWithoutDigit",
    };
    const result = signupSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /one number/);
  });
});
