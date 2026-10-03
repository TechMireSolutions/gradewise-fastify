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

export const generateAIPrompt = (assessment, targetLang) => {
  if (!assessment) return "";

  const langKey = (targetLang || assessment.language || "en").toLowerCase();
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

  const languageDirectives = {
    ur: `CRITICAL LANGUAGE & SOURCE ADAPTATION RULES:
1. Target Language is URDU (اردو). Every single question, multiple choice option, instruction, and answer key item MUST be written 100% in fluent, natural Urdu (اردو رسم الخط).
2. SOURCE CONTENT TRANSLATION: Regardless of the language of the uploaded resources, reference documents, or external links below (even if they are in English, French, technical code, or mixed languages), you MUST comprehend the academic subject matter, translate it completely, and compose all questions, choices, and explanations in URDU.
3. ABSOLUTELY NO WEB CODE OR CORRUPTED TOKENS: Do NOT leak raw HTML fragments, website code, tracking parameters, URLs, version numbers (like 26.04.1), or non-educational artifacts into questions or options. Every question and choice must be clean educational prose in Urdu.
4. COHERENT URDU CHOICES: For multiple-choice questions, every option must be a full, meaningful answer in Urdu. Do NOT output English letters or placeholders like "Option A".`,
    ar: `CRITICAL LANGUAGE & SOURCE ADAPTATION RULES:
1. Target Language is ARABIC (العربية). Every single question, multiple choice option, instruction, and answer key item MUST be written 100% in standard Arabic (الفصحى).
2. SOURCE CONTENT TRANSLATION: Even if reference material or external links below are in English or another language, translate the core knowledge and formulate all questions and options fully in ARABIC.
3. NO RAW CODE / METADATA: Do NOT output URLs, tracking hashes, or web fragments. Author genuine academic questions in Arabic.
4. COHERENT ARABIC CHOICES: For multiple choice, every option must be an articulate Arabic statement.`,
    fa: `CRITICAL LANGUAGE & SOURCE ADAPTATION RULES:
1. Target Language is PERSIAN (فارسی). Every single question, multiple choice option, instruction, and answer key item MUST be written 100% in Persian.
2. SOURCE CONTENT TRANSLATION: Even if reference material or external links below are in English or another language, translate the core knowledge and formulate all questions and options fully in PERSIAN.
3. NO RAW CODE / METADATA: Do NOT output URLs, tracking hashes, or web fragments. Author genuine academic questions in Persian.
4. COHERENT PERSIAN CHOICES: For multiple choice, every option must be an articulate Persian statement.`,
    en: `CRITICAL LANGUAGE & SOURCE ADAPTATION RULES:
1. Target Language is ENGLISH. Every question, multiple choice option, instruction, and answer key item MUST be written in clear English.
2. If reference material or links are in another language, translate the core concepts into English.
3. NO RAW CODE / METADATA: Do NOT copy raw URLs, HTML snippets, or website tracking parameters.`,
  };

  const specificDirective = languageDirectives[langKey] || languageDirectives.en;

  const schemaOptions = langKey === "ur"
    ? `["پہلا ممکنہ جواب", "دوسرا ممکنہ جواب", "تیسرا ممکنہ جواب", "چوتھا ممکنہ جواب"]`
    : langKey === "ar"
    ? `["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"]`
    : langKey === "fa"
    ? `["گزینه اول", "گزینه دوم", "گزینه سوم", "گزینه چهارم"]`
    : `["Option A description", "Option B description", "Option C description", "Option D description"]`;

  const schemaQuestion = langKey === "ur"
    ? `سوال کا مکمل متن یہاں اردو میں لکھیں`
    : langKey === "ar"
    ? `نص السؤال الكامل هنا باللغة العربية`
    : langKey === "fa"
    ? `متن کامل سوال به زبان فارسی`
    : `Question text here in ${language}`;

  let promptText = `${baseInstruction}

Target Language: ${language} (${langKey}). All question items, instructions, and response schemas MUST be in ${language}.

${specificDirective}

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
    promptText += `\n\nUploaded Resource Content (Translate and adapt into ${language}):\n${assessment.resources
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
      "question_text": "${schemaQuestion}",
      "options": ${schemaOptions},
      "correct_answer": ${langKey === "ur" ? `"پہلا ممکنہ جواب"` : langKey === "ar" ? `"الخيار الأول"` : langKey === "fa" ? `"گزینه اول"` : `"Option A description"`},
      "positive_marks": 1,
      "negative_marks": 0.25,
      "duration_per_question": 60
    }
  ],
  "answer_key": [
    {
      "question_order": 1,
      "correct_answer": ${langKey === "ur" ? `"پہلا ممکنہ جواب"` : langKey === "ar" ? `"الخيار الأول"` : langKey === "fa" ? `"گزینه اول"` : `"Option A description"`}
    }
  ]
}

Strict Rules:
1. Provide questions in exact order of the sections defined above.
2. For multiple_choice, options must be an array of strings in ${language}.
3. For true_false, options must be ["True", "False"], and correct_answer "True" or "False".
4. For matching, include "left_items" and "right_items" in ${language}, and correct_answer as JSON match string.
5. For short_answer, correct_answer is a model answer string in ${language}.
6. For fill_in_the_blank, mark the blank with _______ in question_text, and correct_answer is the missing term in ${language}.
7. Return ONLY the JSON object. Do not include markdown or conversational prefixes.`;

  return promptText.trim();
};