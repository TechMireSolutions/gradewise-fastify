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

  for (const block of blocks) {
    const prompt = buildBlockPrompt(block, instructorPrompt, context, langLabel);

    let parsed: Array<Record<string, unknown>> = [];
    try {
      const raw = await generateContent(prompt, { maxOutputTokens: 4096, temperature: 0.7 });
      parsed = parseQuestionsFromAI(raw, block.questionType) as Array<Record<string, unknown>>;
    } catch {
      parsed = [];
    }

    while (parsed.length < block.questionCount) {
      parsed.push(createFallbackQuestion(block.questionType, parsed.length + 1));
    }
    parsed = parsed.slice(0, block.questionCount);

    for (const q of parsed) {
      rows.push({
        attemptId,
        questionOrder: orderIndex++,
        questionType: block.questionType,
        questionText: String(q["question_text"] ?? q["questionText"] ?? "Question unavailable"),
        options: Array.isArray(q["options"]) ? (q["options"] as string[]) : null,
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
