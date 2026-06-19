import { db } from "../../db/index.js";
import {
  assessmentResources,
  resourceChunks,
  resources,
} from "../../db/schema.js";
import { eq } from "drizzle-orm";

export interface QuestionBlockLike {
  questionType: string;
  questionCount: number;
  numOptions?: number | null;
  leftCount?: number | null;
  rightCount?: number | null;
}

export async function gatherAssessmentContext(assessmentId: number): Promise<string> {
  const linkedResources = await db
    .select({ chunkText: resourceChunks.chunkText })
    .from(assessmentResources)
    .innerJoin(resources, eq(assessmentResources.resourceId, resources.id))
    .innerJoin(resourceChunks, eq(resourceChunks.resourceId, resources.id))
    .where(eq(assessmentResources.assessmentId, assessmentId))
    .limit(20);

  return linkedResources.map((r) => r.chunkText).join("\n\n");
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
${context ? `Reference Material:\n${context.substring(0, 3000)}\n` : ""}

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
