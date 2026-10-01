import { db } from "../../db/index.js";
import {
  assessments,
  assessmentAttempts,
  generatedQuestions,
  questionBlocks,
  type GeneratedQuestion,
} from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { NotFoundError } from "../../utils/errors.js";
import { generateContent, mapLanguageCode } from "../../ai/generate.js";
import {
  gatherAssessmentContext,
  buildBlockPrompt,
  parseQuestionsFromAI,
  buildUnifiedAssignmentPrompt,
  parseUnifiedAssignmentQuestionsFromAI,
} from "../assessments/question-generation.js";

function createFallbackQuestion(questionType: string, index: number) {
  return {
    question_text: `Question ${index} (generation failed)`,
    question_type: questionType,
    options:
      questionType === "multiple_choice"
        ? ["Option A", "Option B", "Option C", "Option D"]
        : undefined,
    correct_answer: questionType === "true_false" ? "True" : "N/A",
  };
}

function sanitizeQuestion(q: GeneratedQuestion) {
  return {
    id: q.id,
    questionOrder: q.questionOrder,
    questionType: q.questionType,
    questionText: q.questionText,
    options: q.options,
    durationPerQuestion: q.durationPerQuestion,
    positiveMarks: q.positiveMarks,
    negativeMarks: q.negativeMarks,
  };
}

export async function generateQuestionsForAttempt(input: {
  attemptId: number;
  assessmentId: number;
  language: string;
}): Promise<void> {
  const { attemptId, assessmentId, language } = input;

  let blocks = await db
    .select()
    .from(questionBlocks)
    .where(eq(questionBlocks.assessmentId, assessmentId));

  if (blocks.length === 0) {
    const [defaultBlock] = await db
      .insert(questionBlocks)
      .values({
        assessmentId,
        questionType: "multiple_choice",
        questionCount: 10,
        durationPerQuestion: 60,
        numOptions: 4,
        positiveMarks: "1",
        negativeMarks: "0.25",
      })
      .returning();
    if (defaultBlock) blocks = [defaultBlock];
  }

  const assessment = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);
  if (!assessment[0]) throw new NotFoundError("Assessment");

  const context = await gatherAssessmentContext(assessmentId);
  const langLabel = mapLanguageCode(language);
  const instructorPrompt = assessment[0].prompt ?? "";

  let orderIndex = 0;
  const rows: Array<typeof generatedQuestions.$inferInsert> = [];

  const unifiedPrompt = buildUnifiedAssignmentPrompt(
    blocks,
    instructorPrompt,
    context,
    language,
    langLabel,
    assessment[0].title
  );

  let parsedQuestions: Array<Record<string, unknown>> = [];
  try {
    const raw = await generateContent(unifiedPrompt, { maxOutputTokens: 8192, temperature: 0.7 });
    parsedQuestions = parseUnifiedAssignmentQuestionsFromAI(raw, blocks) as Array<Record<string, unknown>>;
  } catch (error) {
    console.warn("[AssignmentGeneration] Unified prompt execution encountered issue, trying fallback:", error);
    for (const block of blocks) {
      try {
        const prompt = buildBlockPrompt(block, instructorPrompt, context, langLabel);
        const raw = await generateContent(prompt, { maxOutputTokens: 4096, temperature: 0.7 });
        const blockParsed = parseQuestionsFromAI(raw, block.questionType) as Array<Record<string, unknown>>;
        parsedQuestions.push(...blockParsed);
      } catch {
        // Fallbacks will be created below if insufficient
      }
    }
  }

  // Ensure every block has its required question count
  let qPointer = 0;
  for (const block of blocks) {
    const targetCount = block.questionCount || 1;
    for (let c = 0; c < targetCount; c++) {
      let q = parsedQuestions[qPointer++];
      if (!q || typeof q !== "object") {
        q = createFallbackQuestion(block.questionType, c + 1);
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

      rows.push({
        attemptId,
        questionOrder: orderIndex++,
        questionType: block.questionType,
        questionText: String(q["question_text"] ?? q["questionText"] ?? `Question ${orderIndex}`),
        options:
          isMatching && leftItems.length > 0 && rightItems.length > 0
            ? [JSON.stringify({ leftItems, rightItems })]
            : Array.isArray(q["options"])
              ? (q["options"] as string[])
              : null,
        correctAnswer: String(q["correct_answer"] ?? q["correctAnswer"] ?? ""),
        positiveMarks: block.positiveMarks,
        negativeMarks: block.negativeMarks,
        durationPerQuestion: block.durationPerQuestion,
      });
    }
  }

  if (rows.length > 0) {
    await db.insert(generatedQuestions).values(rows);
  }

  await db
    .update(assessments)
    .set({ isExecuted: true, updatedAt: new Date() })
    .where(eq(assessments.id, assessmentId));
}

export async function getAttemptQuestions(attemptId: number) {
  const questions = await db
    .select()
    .from(generatedQuestions)
    .where(eq(generatedQuestions.attemptId, attemptId))
    .orderBy(generatedQuestions.questionOrder);

  return questions.map(sanitizeQuestion);
}

export async function countAttemptQuestions(attemptId: number): Promise<number> {
  const questions = await db
    .select({ id: generatedQuestions.id })
    .from(generatedQuestions)
    .where(eq(generatedQuestions.attemptId, attemptId));
  return questions.length;
}

export { sanitizeQuestion };
