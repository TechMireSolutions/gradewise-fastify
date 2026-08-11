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
  questionType: string;
  questionCount: number;
  numOptions?: number | null;
  leftCount?: number | null;
  rightCount?: number | null;
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
  language: string
): string {
  const typeDescriptions: Record<string, string> = {
    multiple_choice: `multiple choice questions, each with exactly ${block.numOptions ?? 4} options (A, B, C, D...)`,
    short_answer: "short answer questions requiring 1-3 sentence answers",
    true_false: "true/false questions",
    matching: `matching questions with ${block.leftCount ?? 3} items on the left and ${block.rightCount ?? 4} options on the right`,
  };

  const typeDesc = typeDescriptions[block.questionType] ?? "questions";

  return `Generate exactly ${block.questionCount} ${typeDesc} in ${language}.

${instructorPrompt ? `Topic/Instructions: ${instructorPrompt}\n` : ""}
${context ? `Reference Material:\n${context.substring(0, 4000)}\n` : ""}

Return ONLY a valid JSON array. Each object must have:
- "question_text": the question
- "question_type": "${block.questionType}"
${block.questionType === "multiple_choice" ? `- "options": array of ${block.numOptions ?? 4} strings\n- "correct_answer": the correct option text` : ""}
${block.questionType === "true_false" ? '- "correct_answer": "True" or "False"' : ""}
${block.questionType === "short_answer" ? '- "correct_answer": a model answer string' : ""}
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
