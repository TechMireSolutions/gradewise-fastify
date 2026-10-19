import type { GeneratedQuestion } from "../../db/schema.js";

/**
 * Normalizes matching question pairs from stringified JSON into array of [left, right] tuples.
 * Supports array of tuples, array of objects, or single object map.
 */
export function normalizeMatchPairs(value: string): Array<[string, string]> | null {
  if (!value || typeof value !== "string") return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }

  const pairs: Array<[string, string]> = [];
  const push = (left: unknown, right: unknown) => {
    const l = String(left ?? "").trim().toLowerCase();
    const r = String(right ?? "").trim().toLowerCase();
    if (l && r) pairs.push([l, r]);
  };

  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      if (Array.isArray(item)) {
        if (item.length >= 2) push(item[0], item[1]);
      } else if (item && typeof item === "object") {
        const entries = Object.entries(item as Record<string, unknown>);
        const first = entries[0];
        if (first) push(first[0], first[1]);
      }
    }
  } else if (parsed && typeof parsed === "object") {
    for (const [left, right] of Object.entries(parsed as Record<string, unknown>)) {
      push(left, right);
    }
  }

  return pairs.length > 0 ? pairs : null;
}

/**
 * Evaluates whether a given student answer matches the correct answer for a question.
 * Handles exact matching, matching question JSON maps, and multilingual true/false synonyms.
 */
export function evaluateAnswer(question: GeneratedQuestion, studentAnswer: string): boolean {
  if (!studentAnswer || !question.correctAnswer) return false;

  const correct = question.correctAnswer.trim().toLowerCase();
  const given = studentAnswer.trim().toLowerCase();

  if (correct === given) return true;

  if (question.questionType === "matching") {
    const correctPairs = normalizeMatchPairs(question.correctAnswer);
    const givenPairs = normalizeMatchPairs(studentAnswer);
    if (!correctPairs || !givenPairs) return false;

    const correctMap = new Map(correctPairs);
    const givenMap = new Map(givenPairs);
    if (correctMap.size === 0 || givenMap.size === 0) return false;

    for (const [left, right] of correctMap) {
      if (givenMap.get(left) !== right) return false;
    }
    return true;
  }

  if (question.questionType === "true_false") {
    const trueSynonyms = ["true", "yes", "correct", "right", "ا"];
    const falseSynonyms = ["false", "no", "incorrect", "wrong", "ب"];
    const correctIsTrue = trueSynonyms.includes(correct);
    const givenIsTrue = trueSynonyms.includes(given);
    const givenIsFalse = falseSynonyms.includes(given);
    if (correctIsTrue) return givenIsTrue;
    return givenIsFalse;
  }

  return false;
}
