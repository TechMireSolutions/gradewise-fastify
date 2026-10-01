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

    // Remove scripts, styles, and extra boilerplate spaces
    let cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
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

${instructorPrompt ? `Topic/Instructions: ${instructorPrompt}\n` : ""}
${context ? `Reference Material:\n${context.substring(0, maxContextChars)}\n` : ""}

Return ONLY a valid JSON array. Each object must have:
- "question_text": the question
- "question_type": "${block.questionType}"
${block.questionType === "multiple_choice" ? `- "options": array of ${block.numOptions ?? 4} strings\n- "correct_answer": the correct option text` : ""}
${block.questionType === "true_false" ? '- "correct_answer": "True" or "False"' : ""}
${block.questionType === "short_answer" ? '- "correct_answer": a model answer string' : ""}
${block.questionType === "fill_in_the_blank" ? '- "correct_answer": the exact missing word or phrase (make the blank obvious in the question_text)' : ""}
${block.questionType === "matching" ? `- "left_items": array of ${block.leftCount ?? 3} strings\n- "right_items": array of ${block.rightCount ?? 4} strings\n- "correct_answer": JSON string of match pairs` : ""}

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

  return `${baseInstruction}

Target Language: ${languageLabel} (${normLang}).
All question text, options, and explanations MUST be written in ${languageLabel}.

Multilingual Reference Instruction:
[English] Generate a complete assignment including instructions, question items, marks distribution, and answer key.
[Urdu / اردو] ایک مکمل اسائنمنٹ تیار کریں جس میں ہدایات، سوالات، نمبروں کی تقسیم اور جوابات کی کلید شامل ہو۔
[Arabic / العربية] إنشاء واجب كامل يتضمن التعليمات والأسئلة وتوزيع الدرجات ونموذج الإجابة.
[Persian / فارسی] یک تکلیف کامل شامل دستورالعملها، سوالات، بارمبندی و کلید پاسخها ایجاد کنید.

Assignment Title: "${title}"
${instructorPrompt ? `Instructor Instructions / Topic: "${instructorPrompt}"\n` : ""}
${context ? `Reference Material:\n${context.substring(0, maxContextChars)}\n` : ""}

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
      "question_text": "Question text here in ${languageLabel}",
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
4. For matching, include "left_items" (array of strings) and "right_items" (array of strings), and correct_answer as JSON match mapping.
5. For short_answer, correct_answer is a model answer string.
6. For fill_in_the_blank, mark the blank with _______ in question_text, and correct_answer is the missing term.
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

