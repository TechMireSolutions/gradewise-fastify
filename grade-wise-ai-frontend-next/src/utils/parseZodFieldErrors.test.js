import test from "node:test";
import assert from "node:assert/strict";
import { parseZodFieldErrors } from "./parseZodFieldErrors.js";

test("parseZodFieldErrors", async (t) => {
  await t.test("returns null when error is null or undefined", () => {
    assert.strictEqual(parseZodFieldErrors(null), null);
    assert.strictEqual(parseZodFieldErrors(undefined), null);
  });

  await t.test("returns null when error has empty issues or errors", () => {
    assert.strictEqual(parseZodFieldErrors({ errors: [] }), null);
    assert.strictEqual(parseZodFieldErrors({ issues: [] }), null);
    assert.strictEqual(parseZodFieldErrors({}), null);
  });

  await t.test("maps error.errors array into field keyed object", () => {
    const error = {
      errors: [
        { path: ["email"], message: "Invalid email address" },
        { path: ["password"], message: "Password too short" },
      ],
    };
    const result = parseZodFieldErrors(error);
    assert.deepStrictEqual(result, {
      email: "Invalid email address",
      password: "Password too short",
    });
  });

  await t.test("maps error.issues array into field keyed object", () => {
    const error = {
      issues: [
        { path: ["username"], message: "Required" },
      ],
    };
    const result = parseZodFieldErrors(error);
    assert.deepStrictEqual(result, {
      username: "Required",
    });
  });

  await t.test("handles issues without path correctly without crashing", () => {
    const error = {
      issues: [
        { path: [], message: "Root issue" },
        { path: ["title"], message: "Title required" },
      ],
    };
    const result = parseZodFieldErrors(error);
    assert.deepStrictEqual(result, {
      title: "Title required",
    });
  });
});
