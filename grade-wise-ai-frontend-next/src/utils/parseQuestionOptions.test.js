import test from "node:test";
import assert from "node:assert/strict";
import { parseQuestionOptions, mapQuestionsWithParsedOptions } from "./parseQuestionOptions.js";

test("parseQuestionOptions", async (t) => {
  await t.test("returns null for falsy options", () => {
    assert.strictEqual(parseQuestionOptions(null), null);
    assert.strictEqual(parseQuestionOptions(undefined), null);
    assert.strictEqual(parseQuestionOptions(""), null);
  });

  await t.test("returns array when options is already an array", () => {
    const opts = ["Option A", "Option B", "Option C"];
    assert.deepStrictEqual(parseQuestionOptions(opts), opts);
  });

  await t.test("parses JSON string array correctly", () => {
    const raw = JSON.stringify(["Option A", "Option B"]);
    assert.deepStrictEqual(parseQuestionOptions(raw), ["Option A", "Option B"]);
  });

  await t.test("returns null if parsed JSON is not an array", () => {
    const raw = JSON.stringify({ key: "val" });
    assert.strictEqual(parseQuestionOptions(raw), null);
  });

  await t.test("returns null on malformed JSON string", () => {
    assert.strictEqual(parseQuestionOptions("{not valid json"), null);
  });
});

test("mapQuestionsWithParsedOptions", async (t) => {
  await t.test("maps question items and parses their options", () => {
    const questions = [
      { id: 1, text: "Q1", options: '["A", "B"]' },
      { id: 2, text: "Q2", options: ["C", "D"] },
      { id: 3, text: "Q3", options: null },
    ];

    const result = mapQuestionsWithParsedOptions(questions);
    assert.deepStrictEqual(result, [
      { id: 1, text: "Q1", options: ["A", "B"] },
      { id: 2, text: "Q2", options: ["C", "D"] },
      { id: 3, text: "Q3", options: null },
    ]);
  });
});
