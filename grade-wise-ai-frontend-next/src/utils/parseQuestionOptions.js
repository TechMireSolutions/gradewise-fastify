export function parseQuestionOptions(options) {
  if (!options) return null;

  try {
    const parsed = typeof options === "string" ? JSON.parse(options) : options;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function mapQuestionsWithParsedOptions(questions) {
  return questions.map((q) => ({
    ...q,
    options: parseQuestionOptions(q.options),
  }));
}
