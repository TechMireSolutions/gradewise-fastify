import { db } from "../../db/index.js";
import {
  assessmentResources,
  resourceChunks,
  resources,
  assessments,
} from "../../db/schema.js";
import { eq } from "drizzle-orm";
import axios from "axios";

export interface QuestionBlockLike {
  id?: number | null;
  questionType: string;
  questionCount: number;
  durationPerQuestion?: number | null;
  numOptions?: number | null;
  leftCount?: number | null;
  rightCount?: number | null;
  positiveMarks?: string | number | null;
  negativeMarks?: string | number | null;
}

// Scraper function to fetch and clean raw text from external URLs
async function scrapeExternalLink(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      timeout: 8000,
    });

    const html = response.data;
    if (typeof html !== "string") return "";

    // Remove scripts, styles, SVGs, noscripts, navigation, headers, footers, and boilerplate
    let cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ")
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ")
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z0-9#]+;/gi, " ")
      .replace(/https?:\/\/[^\s]+/g, " ")
      .replace(/\b[a-f0-9]{24,}\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Limit single link content to avoid token overflow
    return cleanText.substring(0, 4000);
  } catch (error) {
    console.error(`Failed to scrape link: ${url}`, error instanceof Error ? error.message : error);
    return "";
  }
}

export async function gatherAssessmentContext(assessmentId: number): Promise<string> {
  // 1. Fetch chunks from linked uploaded resources (PDFs)
  const linkedResources = await db
    .select({ chunkText: resourceChunks.chunkText })
    .from(assessmentResources)
    .innerJoin(resources, eq(assessmentResources.resourceId, resources.id))
    .innerJoin(resourceChunks, eq(resourceChunks.resourceId, resources.id))
    .where(eq(assessmentResources.assessmentId, assessmentId))
    .limit(15);

  let contextParts = linkedResources.map((r) => r.chunkText);

  // 2. Fetch and scrape stored external links
  const [assessmentData] = await db
    .select({ externalLinks: assessments.externalLinks })
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);

  if (assessmentData?.externalLinks && Array.isArray(assessmentData.externalLinks)) {
    console.log(`[Scraper] Found ${assessmentData.externalLinks.length} external links to process.`);
    for (const url of assessmentData.externalLinks) {
      if (typeof url === "string" && url.startsWith("http")) {
        const pageText = await scrapeExternalLink(url);
        if (pageText) {
          contextParts.push(`\n--- Source Link: ${url} ---\n${pageText}`);
        }
      }
    }
  }

  return contextParts.join("\n\n");
}

export function buildBlockPrompt(
  block: QuestionBlockLike,
  instructorPrompt: string,
  context: string,
  language: string,
  maxContextChars = 4000
): string {
  const typeDescriptions: Record<string, string> = {
    multiple_choice: `multiple choice questions, each with exactly ${block.numOptions ?? 4} options (A, B, C, D...)`,
    short_answer: "short answer questions requiring 1-3 sentence answers",
    true_false: "true/false questions",
    matching: `matching questions with ${block.leftCount ?? 3} items on the left and ${block.rightCount ?? 4} options on the right`,
    fill_in_the_blank: "fill-in-the-blank questions where one key word or short phrase is missing",
  };

  const typeDesc = typeDescriptions[block.questionType] ?? "questions";

  return `Generate exactly ${block.questionCount} ${typeDesc} in ${language}.
All question text, options, and answers MUST be composed strictly in ${language}. If the reference material or external links below are in another language, translate and adapt the concepts into ${language}. Do not include raw URLs, tracking code, or HTML artifacts.

${instructorPrompt ? `Topic/Instructions: ${instructorPrompt}\n` : ""}
${context ? `Reference Material (Translate and adapt into ${language}):\n${context.substring(0, maxContextChars)}\n` : ""}

Return ONLY a valid JSON array. Each object must have:
- "question_text": the question written in ${language}
- "question_type": "${block.questionType}"
${block.questionType === "multiple_choice" ? `- "options": array of ${block.numOptions ?? 4} strings in ${language}\n- "correct_answer": the correct option text in ${language}` : ""}
${block.questionType === "true_false" ? '- "correct_answer": "True" or "False"' : ""}
${block.questionType === "short_answer" ? `- "correct_answer": a model answer string in ${language}` : ""}
${block.questionType === "fill_in_the_blank" ? `- "correct_answer": the exact missing word or phrase in ${language} (make the blank obvious with _______ in the question_text)` : ""}
${block.questionType === "matching" ? `- "left_items": array of ${block.leftCount ?? 3} strings in ${language}\n- "right_items": array of ${block.rightCount ?? 4} strings in ${language}\n- "correct_answer": JSON string of match pairs` : ""}

Do not include any text outside the JSON array.`;
}

export function parseQuestionsFromAI(raw: string, _questionType: string): object[] {
  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch?.[0]) return [];
    return JSON.parse(jsonMatch[0]) as object[];
  } catch {
    return [];
  }
}

// ─── Multi-Language Prompts ───────────────────────────────────────────────────

export const MULTILANGUAGE_PROMPTS: Record<string, string> = {
  en: "Generate a complete assignment including instructions, question items, marks distribution, and answer key.",
  ur: "ایک مکمل اسائنمنٹ تیار کریں جس میں ہدایات، سوالات، نمبروں کی تقسیم اور جوابات کی کلید شامل ہو۔",
  ar: "إنشاء واجب كامل يتضمن التعليمات والأسئلة وتوزيع الدرجات ونموذج الإجابة.",
  fa: "یک تکلیف کامل شامل دستورالعملها، سوالات، بارمبندی و کلید پاسخها ایجاد کنید.",
};

// ─── Unified Prompting Pipeline ───────────────────────────────────────────────

export function buildUnifiedAssignmentPrompt(
  blocks: QuestionBlockLike[],
  instructorPrompt: string,
  context: string,
  languageCode: string,
  languageLabel: string,
  title = "Assignment",
  maxContextChars = 12000
): string {
  const normLang = (languageCode || "en").toLowerCase();
  const baseInstruction = MULTILANGUAGE_PROMPTS[normLang] || MULTILANGUAGE_PROMPTS.en!;

  const blockDescriptions = blocks.map((b, idx) => {
    const pMarks = b.positiveMarks ?? 1;
    const nMarks = b.negativeMarks ?? 0.25;
    const dur = b.durationPerQuestion ?? 60;
    let detail = "";
    if (b.questionType === "multiple_choice") {
      detail = `with exactly ${b.numOptions ?? 4} options (A, B, C, D...)`;
    } else if (b.questionType === "matching") {
      detail = `with ${b.leftCount ?? 3} left items and ${b.rightCount ?? 4} right options`;
    } else if (b.questionType === "true_false") {
      detail = `true/false format`;
    } else if (b.questionType === "short_answer") {
      detail = `1-3 sentence answers`;
    } else if (b.questionType === "fill_in_the_blank") {
      detail = `clear missing phrase/word with obvious [blank] indicator`;
    }
    return `- Section ${idx + 1}: Exactly ${b.questionCount} questions of type "${b.questionType}" ${detail} [Marks: +${pMarks} positive, ${nMarks} negative, Time: ${dur}s per question]`;
  }).join("\n");

  const totalQuestions = blocks.reduce((sum, b) => sum + (b.questionCount || 0), 0);

  const languageDirectives: Record<string, string> = {
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

  const specificDirective = languageDirectives[normLang] || languageDirectives.en!;

  const schemaOptions = normLang === "ur"
    ? `["پہلا ممکنہ جواب", "دوسرا ممکنہ جواب", "تیسرا ممکنہ جواب", "چوتھا ممکنہ جواب"]`
    : normLang === "ar"
    ? `["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"]`
    : normLang === "fa"
    ? `["گزینه اول", "گزینه دوم", "گزینه سوم", "گزینه چهارم"]`
    : `["Option A description", "Option B description", "Option C description", "Option D description"]`;

  const schemaQuestion = normLang === "ur"
    ? `سوال کا مکمل متن یہاں اردو میں لکھیں`
    : normLang === "ar"
    ? `نص السؤال الكامل هنا باللغة العربية`
    : normLang === "fa"
    ? `متن کامل سوال به زبان فارسی`
    : `Question text here in ${languageLabel}`;

  return `${baseInstruction}

Target Language: ${languageLabel} (${normLang}).
All question text, options, and explanations MUST be written in ${languageLabel}.

${specificDirective}

Multilingual Reference Instruction:
[English] Generate a complete assignment including instructions, question items, marks distribution, and answer key.
[Urdu / اردو] ایک مکمل اسائنمنٹ تیار کریں جس میں ہدایات، سوالات، نمبروں کی تقسیم اور جوابات کی کلید شامل ہو۔
[Arabic / العربية] إنشاء واجب كامل يتضمن التعليمات والأسئلة وتوزيع الدرجات ونموذج الإجابة.
[Persian / فارسی] یک تکلیف کامل شامل دستورالعملها، سوالات، بارمبندی و کلید پاسخها ایجاد کنید.

Assignment Title: "${title}"
${instructorPrompt ? `Instructor Instructions / Topic: "${instructorPrompt}"\n` : ""}
${context ? `Reference Material (Translate and adapt this material into ${languageLabel}):\n${context.substring(0, maxContextChars)}\n` : ""}

Assignment Requirements & Marks Distribution:
Total Questions to Generate: ${totalQuestions}
${blockDescriptions}

Response Schema:
Return ONLY a valid JSON object matching this unified structure:
{
  "instructions": "Overall assignment instructions in ${languageLabel}",
  "questions": [
    {
      "question_order": 1,
      "question_type": "multiple_choice",
      "question_text": "${schemaQuestion}",
      "options": ${schemaOptions},
      "correct_answer": ${normLang === "ur" ? `"پہلا ممکنہ جواب"` : normLang === "ar" ? `"الخيار الأول"` : normLang === "fa" ? `"گزینه اول"` : `"Option A description"`},
      "positive_marks": 1,
      "negative_marks": 0.25,
      "duration_per_question": 60
    }
  ],
  "answer_key": [
    {
      "question_order": 1,
      "correct_answer": ${normLang === "ur" ? `"پہلا ممکنہ جواب"` : normLang === "ar" ? `"الخيار الأول"` : normLang === "fa" ? `"گزینه اول"` : `"Option A description"`}
    }
  ]
}

Strict Rules:
1. Provide questions in exact order of the sections defined above.
2. For multiple_choice, options must be an array of strings in ${languageLabel}.
3. For true_false, options must be ["True", "False"], and correct_answer "True" or "False".
4. For matching, include "left_items" (array of strings) and "right_items" (array of strings in ${languageLabel}), and correct_answer as JSON match mapping.
5. For short_answer, correct_answer is a model answer string in ${languageLabel}.
6. For fill_in_the_blank, mark the blank with _______ in question_text, and correct_answer is the missing term in ${languageLabel}.
7. Return ONLY the JSON object. Do not include markdown or conversational prefixes.`;
}

export function parseUnifiedAssignmentQuestionsFromAI(raw: string, blocks: QuestionBlockLike[]): object[] {
  let extractedQuestions: Array<Record<string, unknown>> = [];
  try {
    const trimmed = raw.trim();
    // 1. Try parsing JSON object with "questions" array
    const objMatch = trimmed.match(/\{[\s\S]*\}/);
    if (objMatch?.[0]) {
      const parsedObj = JSON.parse(objMatch[0]);
      if (Array.isArray(parsedObj.questions)) {
        extractedQuestions = parsedObj.questions;
      }
    }
    // 2. If no questions array in object, try parsing JSON array directly
    if (extractedQuestions.length === 0) {
      const arrMatch = trimmed.match(/\[[\s\S]*\]/);
      if (arrMatch?.[0]) {
        extractedQuestions = JSON.parse(arrMatch[0]);
      }
    }
  } catch (err) {
    console.error("[UnifiedPromptParser] Error parsing AI response JSON:", err);
  }

  // Map extracted questions to blocks guaranteeing correct types, marks, and durations
  const finalQuestions: Array<Record<string, unknown>> = [];
  let questionPointer = 0;

  for (const block of blocks) {
    const count = block.questionCount || 1;
    for (let i = 0; i < count; i++) {
      let q = extractedQuestions[questionPointer];
      questionPointer++;

      if (!q || typeof q !== "object") {
        q = {
          question_text: `Question ${finalQuestions.length + 1} (${block.questionType})`,
          question_type: block.questionType,
          options: block.questionType === "multiple_choice" ? ["Option A", "Option B", "Option C", "Option D"] : undefined,
          correct_answer: block.questionType === "true_false" ? "True" : "Model answer",
        };
      }

      const isMatching = block.questionType === "matching";
      const leftItems = Array.isArray(q["left_items"])
        ? (q["left_items"] as unknown[]).map(String)
        : Array.isArray(q["leftItems"])
          ? (q["leftItems"] as unknown[]).map(String)
          : [];
      const rightItems = Array.isArray(q["right_items"])
        ? (q["right_items"] as unknown[]).map(String)
        : Array.isArray(q["rightItems"])
          ? (q["rightItems"] as unknown[]).map(String)
          : [];

      finalQuestions.push({
        question_order: finalQuestions.length + 1,
        question_type: block.questionType,
        question_text: String(q["question_text"] ?? q["questionText"] ?? `Question ${finalQuestions.length + 1}`),
        options: isMatching && leftItems.length > 0 && rightItems.length > 0
          ? [JSON.stringify({ leftItems, rightItems })]
          : Array.isArray(q["options"])
            ? (q["options"] as string[])
            : undefined,
        left_items: leftItems.length > 0 ? leftItems : undefined,
        right_items: rightItems.length > 0 ? rightItems : undefined,
        correct_answer: String(q["correct_answer"] ?? q["correctAnswer"] ?? ""),
        positive_marks: block.positiveMarks ?? 1,
        negative_marks: block.negativeMarks ?? 0.25,
        duration_per_question: block.durationPerQuestion ?? 60,
      });
    }
  }

  return finalQuestions;
}

