import test from "node:test";
import assert from "node:assert/strict";
import { resetPasswordSchema, setNewPasswordSchema } from "./passwordSchemas.js";

test("resetPasswordSchema", async (t) => {
  await t.test("accepts valid email address", () => {
    const valid = { email: "user@gradewise.ai" };
    const result = resetPasswordSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  await t.test("rejects empty email address", () => {
    const invalid = { email: "" };
    const result = resetPasswordSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /Email is required/);
  });

  await t.test("rejects malformed email address", () => {
    const invalid = { email: "not-an-email" };
    const result = resetPasswordSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /valid email/);
  });
});

test("setNewPasswordSchema", async (t) => {
  await t.test("accepts valid matching passwords", () => {
    const valid = {
      newPassword: "StrongPassword1",
      confirmPassword: "StrongPassword1",
    };
    const result = setNewPasswordSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  await t.test("rejects mismatched passwords with specific error message on confirmPassword", () => {
    const invalid = {
      newPassword: "StrongPassword1",
      confirmPassword: "DifferentPassword2",
    };
    const result = setNewPasswordSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.issues[0].message, "Passwords do not match");
    assert.deepStrictEqual(result.error.issues[0].path, ["confirmPassword"]);
  });

  await t.test("rejects weak newPassword lacking complexity", () => {
    const invalid = {
      newPassword: "password",
      confirmPassword: "password",
    };
    const result = setNewPasswordSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    assert.match(result.error.issues[0].message, /uppercase/);
  });
});
