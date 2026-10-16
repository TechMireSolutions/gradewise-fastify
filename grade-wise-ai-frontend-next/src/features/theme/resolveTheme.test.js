import test from "node:test";
import assert from "node:assert/strict";
import { getSystemTheme, resolveTheme } from "./resolveTheme.js";

test("getSystemTheme", async (t) => {
  await t.test("returns 'light' when window is undefined (SSR)", () => {
    const originalWindow = global.window;
    delete global.window;

    try {
      assert.strictEqual(getSystemTheme(), "light");
    } finally {
      if (originalWindow !== undefined) {
        global.window = originalWindow;
      }
    }
  });

  await t.test("returns 'dark' when prefers-color-scheme matchMedia matches", () => {
    const originalWindow = global.window;
    global.window = {
      matchMedia: (query) => ({
        matches: query === "(prefers-color-scheme: dark)",
      }),
    };

    try {
      assert.strictEqual(getSystemTheme(), "dark");
    } finally {
      if (originalWindow !== undefined) {
        global.window = originalWindow;
      } else {
        delete global.window;
      }
    }
  });

  await t.test("returns 'light' when prefers-color-scheme matchMedia does not match", () => {
    const originalWindow = global.window;
    global.window = {
      matchMedia: () => ({ matches: false }),
    };

    try {
      assert.strictEqual(getSystemTheme(), "light");
    } finally {
      if (originalWindow !== undefined) {
        global.window = originalWindow;
      } else {
        delete global.window;
      }
    }
  });
});

test("resolveTheme", async (t) => {
  await t.test("returns 'dark' when explicit theme is dark", () => {
    assert.strictEqual(resolveTheme("dark"), "dark");
  });

  await t.test("returns 'light' when explicit theme is light", () => {
    assert.strictEqual(resolveTheme("light"), "light");
  });

  await t.test("resolves 'system' theme using getSystemTheme", () => {
    const resolved = resolveTheme("system");
    assert.ok(resolved === "light" || resolved === "dark");
  });

  await t.test("resolves falsy or null theme using getSystemTheme", () => {
    assert.ok(resolveTheme(null) === "light" || resolveTheme(null) === "dark");
    assert.ok(resolveTheme(undefined) === "light" || resolveTheme(undefined) === "dark");
    assert.ok(resolveTheme("") === "light" || resolveTheme("") === "dark");
  });

  await t.test("falls back to 'light' for arbitrary string input", () => {
    assert.strictEqual(resolveTheme("sepia"), "light");
  });
});
