export const MULTILANGUAGE_PROMPTS = {
  en: "Generate a complete assignment including instructions, question items, marks distribution, and answer key.",
  ur: "ایک مکمل اسائنمنٹ تیار کریں جس میں ہدایات، سوالات، نمبروں کی تقسیم اور جوابات کی کلید شامل ہو۔",
  ar: "إنشاء واجب كامل يتضمن التعليمات والأسئلة وتوزيع الدرجات ونموذج الإجابة.",
  fa: "یک تکلیف کامل شامل دستورالعملها، سوالات، بارمبندی و کلید پاسخها ایجاد کنید.",
};

const LANGUAGE_LABELS = {
  en: "English",
  ur: "Urdu",
  ar: "Arabic",
  fa: "Persian",
};

export const generateAIPrompt = (assessment) => {
  if (!assessment) return "";

  const langKey = (assessment.language || "en").toLowerCase();
  const language = LANGUAGE_LABELS[langKey] || "English";
  const baseInstruction = MULTILANGUAGE_PROMPTS[langKey] || MULTILANGUAGE_PROMPTS.en;

  const blocks = assessment.question_blocks || [];
  const totalQuestions = blocks.reduce((sum, b) => sum + (Number(b.question_count) || 0), 0);

  const blockDescriptions = blocks.map((b, idx) => {
    const qCount = b.question_count || 1;
    const pMarks = b.positive_marks ?? 1;
    const nMarks = b.negative_marks ?? 0.25;
    const dur = b.duration_per_question ?? 60;
    let detail = "";
    if (b.question_type === "multiple_choice") {
      detail = `with exactly ${b.num_options || 4} options (A, B, C, D...)`;
    } else if (b.question_type === "matching") {
      detail = `with ${b.num_first_side || 3} left items and ${b.num_second_side || 4} right options`;
    } else if (b.question_type === "true_false") {
      detail = "true/false format";
    } else if (b.question_type === "short_answer") {
      detail = "1-3 sentence answers";
    } else if (b.question_type === "fill_in_the_blank") {
      detail = "clear missing phrase/word with obvious [blank] indicator";
    }
    return `- Section ${idx + 1}: ${qCount} questions of type "${b.question_type}" ${detail} [Marks: +${pMarks} positive, ${nMarks} negative, Time: ${dur}s per question]`;
  }).join("\n");

  let promptText = `${baseInstruction}

Target Language: ${language} (${langKey}). All question items, instructions, and response schemas MUST be in ${language}.

Multilingual Reference Instruction:
[English] Generate a complete assignment including instructions, question items, marks distribution, and answer key.
[Urdu / اردو] ایک مکمل اسائنمنٹ تیار کریں جس میں ہدایات، سوالات، نمبروں کی تقسیم اور جوابات کی کلید شامل ہو۔
[Arabic / العربية] إنشاء واجب كامل يتضمن التعليمات والأسئلة وتوزيع الدرجات ونموذج الإجابة.
[Persian / فارسی] یک تکلیف کامل شامل دستورالعملها، سوالات، بارمبندی و کلید پاسخها ایجاد کنید.

Assignment Title: "${assessment.title || "Assignment"}"
Instructor Prompt / Instructions: "${assessment.prompt || "No specific instructor instructions provided"}"`;

  // Add external links if present
  if ((assessment.external_links || []).length > 0) {
    promptText += `\nExternal Links:\n${assessment.external_links.join("\n")}`;
  }

  // Add uploaded resources if present
  if ((assessment.resources || []).length > 0) {
    promptText += `\n\nUploaded Resource Content:\n${assessment.resources
      .map(
        (r) =>
          `Resource "${r.name}":\n${
            r.chunks?.map((c) => c.chunk_text?.trim() || "").join("\n\n") || "No content"
          }`
      )
      .join("\n\n---\n\n")}`;
  }

  promptText += `\n\nAssignment Structure & Marks Distribution:
Total Questions to Generate: ${totalQuestions}
${blockDescriptions || "- 10 questions of type multiple_choice"}

Unified Response Schema:
Return ONLY a valid JSON object matching this structure:
{
  "instructions": "Overall assignment instructions in ${language}",
  "questions": [
    {
      "question_order": 1,
      "question_type": "multiple_choice",
      "question_text": "Question text in ${language}",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "positive_marks": 1,
      "negative_marks": 0.25,
      "duration_per_question": 60
    }
  ],
  "answer_key": [
    {
      "question_order": 1,
      "correct_answer": "Option A"
    }
  ]
}

Strict Rules:
1. Provide questions in exact order of the sections defined above.
2. For multiple_choice, options must be an array of strings.
3. For true_false, options must be ["True", "False"], and correct_answer "True" or "False".
4. For matching, include "left_items" and "right_items", and correct_answer as JSON match string.
5. For short_answer, correct_answer is a model answer string.
6. For fill_in_the_blank, mark the blank with _______ in question_text, and correct_answer is the missing term.
7. Return ONLY the JSON object. Do not include markdown or conversational prefixes.`;

  return promptText.trim();
};