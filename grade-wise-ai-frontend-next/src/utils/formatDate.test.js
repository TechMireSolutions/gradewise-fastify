import test from "node:test";
import assert from "node:assert/strict";
import { formatDate, formatDateTime } from "./formatDate.js";

test("formatDate", async (t) => {
  await t.test("returns '—' when date is null or undefined", () => {
    assert.strictEqual(formatDate(null), "—");
    assert.strictEqual(formatDate(undefined), "—");
    assert.strictEqual(formatDate(""), "—");
  });

  await t.test("returns '—' when date is invalid", () => {
    assert.strictEqual(formatDate("invalid-date-string"), "—");
  });

  await t.test("formats valid Date instance correctly", () => {
    const d = new Date(2026, 0, 15); // Jan 15, 2026
    const formatted = formatDate(d);
    assert.match(formatted, /Jan 15, 2026/);
  });

  await t.test("formats valid ISO date string correctly", () => {
    const formatted = formatDate("2026-05-20T10:00:00Z");
    assert.match(formatted, /2026/);
    assert.match(formatted, /May/);
  });

  await t.test("accepts custom Intl format options", () => {
    const d = new Date(2026, 0, 15);
    const formatted = formatDate(d, { month: "long" });
    assert.match(formatted, /January/);
  });
});

test("formatDateTime", async (t) => {
  await t.test("returns '—' for invalid or empty inputs", () => {
    assert.strictEqual(formatDateTime(null), "—");
    assert.strictEqual(formatDateTime("bad-date"), "—");
  });

  await t.test("formats date with time components", () => {
    const d = new Date(2026, 2, 10, 14, 30);
    const formatted = formatDateTime(d);
    assert.match(formatted, /Mar 10, 2026/);
  });
});
