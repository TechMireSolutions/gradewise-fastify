import test from "node:test";
import assert from "node:assert/strict";
import { cn } from "./cn.js";

test("cn utility", async (t) => {
  await t.test("combines multiple class strings with a single space", () => {
    assert.strictEqual(cn("px-4", "py-2", "text-sm"), "px-4 py-2 text-sm");
  });

  await t.test("filters out falsy values (false, null, undefined, 0, empty string)", () => {
    assert.strictEqual(
      cn("base", false, null, undefined, 0, "", "active"),
      "base active"
    );
  });

  await t.test("handles conditional expressions correctly", () => {
    const isPrimary = true;
    const isSmall = false;
    assert.strictEqual(
      cn("btn", isPrimary && "btn-primary", isSmall && "btn-sm"),
      "btn btn-primary"
    );
  });

  await t.test("returns empty string when called without arguments", () => {
    assert.strictEqual(cn(), "");
  });

  await t.test("returns empty string when all arguments are falsy", () => {
    assert.strictEqual(cn(null, undefined, false, ""), "");
  });
});
