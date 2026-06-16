import { db } from "../../db/index.js";
import {
  assessments,
  assessmentAttempts,
  generatedQuestions,
  studentAnswers,
  questionBlocks,
  enrollments,
  resources,
  resourceChunks,
  assessmentResources,
  type GeneratedQuestion,
} from "../../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { AppError, NotFoundError, ForbiddenError } from "../../utils/errors.js";
import { generateContent, mapLanguageCode } from "../../ai/generate.js";
import { parseQuestionsFromAI } from "../assessments/assessments.service.js";

// ─── Start assessment ─────────────────────────────────────────────────────────

export async function startAssessmentService(
  studentId: number,
  assessmentId: number,
  language = "en"
) {
  // Verify enrollment
  const enrollment = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.assessmentId, assessmentId), eq(enrollments.studentId, studentId)))
    .limit(1);

  if (!enrollment[0]) {
    throw new ForbiddenError("You are not enrolled in this assessment.");
  }

  // Recovery: return existing pending attempt
  const pending = await db
    .select()
    .from(assessmentAttempts)
    .where(
      and(
        eq(assessmentAttempts.assessmentId, assessmentId),
        eq(assessmentAttempts.studentId, studentId),
        eq(assessmentAttempts.status, "pending")
      )
    )
    .limit(1);

  if (pending[0]) {
    const existingQuestions = await db
      .select()
      .from(generatedQuestions)
      .where(eq(generatedQuestions.attemptId, pending[0].id))
      .orderBy(generatedQuestions.questionOrder);

    return {
      attemptId: pending[0].id,
      questions: existingQuestions.map(sanitizeQuestion),
      status: "pending",
      language,
    };
  }

  // Create new attempt
  const [attempt] = await db
    .insert(assessmentAttempts)
    .values({ assessmentId, studentId, language, status: "pending" })
    .returning();

  if (!attempt) throw new AppError("CREATE_FAILED", "Failed to start assessment", 500);

  // Get question blocks
  let blocks = await db
    .select()
    .from(questionBlocks)
    .where(eq(questionBlocks.assessmentId, assessmentId));

  // Default block if none configured
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

  // Gather context
  const assessment = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);
  if (!assessment[0]) throw new NotFoundError("Assessment");

  const chunks = await db
    .select({ chunkText: resourceChunks.chunkText })
    .from(assessmentResources)
    .innerJoin(resources, eq(assessmentResources.resourceId, resources.id))
    .innerJoin(resourceChunks, eq(resourceChunks.resourceId, resources.id))
    .where(eq(assessmentResources.assessmentId, assessmentId))
    .limit(20);

  const context = chunks.map((c) => c.chunkText).join("\n\n");
  const langLabel = mapLanguageCode(language);
  const instructorPrompt = assessment[0].prompt ?? "";

  // Generate questions for each block
  const allQuestions: GeneratedQuestion[] = [];
  let orderIndex = 0;

  for (const block of blocks) {
    const prompt = buildGenerationPrompt(block, instructorPrompt, context, langLabel);

    let parsed: Array<Record<string, unknown>> = [];
    try {
      const raw = await generateContent(prompt, { maxOutputTokens: 4096, temperature: 0.7 });
      parsed = (parseQuestionsFromAI(raw, block.questionType) as Array<Record<string, unknown>>);
    } catch {
      parsed = [];
    }

    // Ensure we have the right count (pad or trim)
    while (parsed.length < block.questionCount) {
      parsed.push(createFallbackQuestion(block.questionType, parsed.length + 1));
    }
    parsed = parsed.slice(0, block.questionCount);

    for (const q of parsed) {
      const [saved] = await db
        .insert(generatedQuestions)
        .values({
          attemptId: attempt.id,
          questionOrder: orderIndex++,
          questionType: block.questionType,
          questionText: String(q["question_text"] ?? q["questionText"] ?? "Question unavailable"),
          options: Array.isArray(q["options"]) ? (q["options"] as string[]) : null,
          correctAnswer: String(q["correct_answer"] ?? q["correctAnswer"] ?? ""),
          positiveMarks: block.positiveMarks,
          negativeMarks: block.negativeMarks,
          durationPerQuestion: block.durationPerQuestion,
        })
        .returning();
      if (saved) allQuestions.push(saved);
    }
  }

  // Mark assessment as executed
  await db
    .update(assessments)
    .set({ isExecuted: true, updatedAt: new Date() })
    .where(eq(assessments.id, assessmentId));

  return {
    attemptId: attempt.id,
    questions: allQuestions.map(sanitizeQuestion),
    status: "pending",
    language,
  };
}

// ─── Submit assessment ────────────────────────────────────────────────────────

export async function submitAssessmentService(
  studentId: number,
  assessmentId: number,
  attemptId: number,
  answers: Array<{ questionId: number; answer: string }>
) {
  const attempt = await db
    .select()
    .from(assessmentAttempts)
    .where(
      and(
        eq(assessmentAttempts.id, attemptId),
        eq(assessmentAttempts.studentId, studentId),
        eq(assessmentAttempts.assessmentId, assessmentId)
      )
    )
    .limit(1);

  if (!attempt[0]) throw new AppError("INVALID_ATTEMPT", "Assessment attempt not found", 404);
  if (attempt[0].status === "completed") {
    throw new AppError("ALREADY_SUBMITTED", "This attempt has already been submitted", 400);
  }

  // Load generated questions
  const questions = await db
    .select()
    .from(generatedQuestions)
    .where(eq(generatedQuestions.attemptId, attemptId));

  if (questions.length === 0) {
    throw new AppError("NO_QUESTIONS", "No questions found for this attempt", 400);
  }

  const questionMap = new Map(questions.map((q) => [q.id, q]));
  let totalScore = 0;
  const savedAnswers = [];

  for (const { questionId, answer } of answers) {
    const question = questionMap.get(questionId);
    if (!question) continue;

    const isCorrect = evaluateAnswer(question, answer);
    const score = isCorrect
      ? Number(question.positiveMarks)
      : answer.trim()
      ? -Number(question.negativeMarks)
      : 0;

    totalScore += score;

    const [saved] = await db
      .insert(studentAnswers)
      .values({
        attemptId,
        questionId,
        studentAnswer: answer,
        isCorrect,
        score: String(score),
      })
      .returning();

    if (saved) savedAnswers.push(saved);
  }

  // Finalize attempt
  const [completed] = await db
    .update(assessmentAttempts)
    .set({
      status: "completed",
      completedAt: new Date(),
      score: String(Math.max(0, totalScore)),
    })
    .where(eq(assessmentAttempts.id, attemptId))
    .returning();

  return {
    attemptId,
    score: Math.max(0, totalScore),
    totalQuestions: questions.length,
    correctAnswers: savedAnswers.filter((a) => a.isCorrect).length,
    status: "completed",
  };
}

// ─── Get submission details ───────────────────────────────────────────────────

export async function getSubmissionDetailsService(
  userId: number,
  submissionId: number,
  role: string
) {
  const attempt = await db
    .select()
    .from(assessmentAttempts)
    .where(eq(assessmentAttempts.id, submissionId))
    .limit(1);

  if (!attempt[0]) throw new NotFoundError("Submission");

  const isStudent = role === "student";
  if (isStudent && attempt[0].studentId !== userId) {
    throw new ForbiddenError("Access denied to this submission");
  }

  const questions = await db
    .select()
    .from(generatedQuestions)
    .where(eq(generatedQuestions.attemptId, submissionId))
    .orderBy(generatedQuestions.questionOrder);

  const answers = await db
    .select()
    .from(studentAnswers)
    .where(eq(studentAnswers.attemptId, submissionId));

  const answerMap = new Map(answers.map((a) => [a.questionId, a]));

  const results = questions.map((q) => {
    const answer = answerMap.get(q.id);
    return {
      questionId: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      correctAnswer: q.correctAnswer,
      studentAnswer: answer?.studentAnswer ?? null,
      isCorrect: answer?.isCorrect ?? false,
      score: answer?.score ?? "0",
    };
  });

  return {
    attemptId: attempt[0].id,
    score: attempt[0].score,
    status: attempt[0].status,
    startedAt: attempt[0].startedAt,
    completedAt: attempt[0].completedAt,
    language: attempt[0].language,
    results,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    // correctAnswer is intentionally omitted for students
  };
}

function evaluateAnswer(question: GeneratedQuestion, studentAnswer: string): boolean {
  const correct = question.correctAnswer.trim().toLowerCase();
  const given = studentAnswer.trim().toLowerCase();

  // Exact match always wins
  if (correct === given) return true;

  // For true/false: normalise synonyms
  if (question.questionType === "true_false") {
    const trueSynonyms = ["true", "yes", "correct", "right"];
    const falseSynonyms = ["false", "no", "incorrect", "wrong"];
    const correctIsTrue = trueSynonyms.includes(correct);
    const givenIsTrue = trueSynonyms.includes(given);
    const givenIsFalse = falseSynonyms.includes(given);
    if (correctIsTrue) return givenIsTrue;
    return givenIsFalse;
  }

  // For multiple choice: accept if student answered the option letter (A/B/C/D) and
  // the correct answer contains that option text (or starts with it).
  // We do NOT allow partial text matching to prevent false positives.
  if (question.questionType === "multiple_choice") {
    // Student may submit option letter ("a", "b") or full option text — only exact match
    return false;
  }

  // For short answer: exact match only (AI grading should handle nuance upstream)
  return false;
}

function createFallbackQuestion(questionType: string, index: number) {
  return {
    question_text: `Question ${index} (generation failed)`,
    question_type: questionType,
    options: questionType === "multiple_choice" ? ["Option A", "Option B", "Option C", "Option D"] : undefined,
    correct_answer: questionType === "true_false" ? "True" : "N/A",
  };
}

function buildGenerationPrompt(
  block: any,
  instructorPrompt: string,
  context: string,
  language: string
): string {
  const typeDescriptions: Record<string, string> = {
    multiple_choice: `multiple choice questions, each with exactly ${block.numOptions ?? 4} options`,
    short_answer: "short answer questions",
    true_false: "true/false questions",
    matching: "matching questions",
  };

  return `Generate exactly ${block.questionCount} ${typeDescriptions[block.questionType] ?? "questions"} in ${language}.

${instructorPrompt ? `Topic/Instructions: ${instructorPrompt}\n` : ""}
${context ? `Source Material:\n${context.substring(0, 3000)}\n` : ""}

Return ONLY a valid JSON array with objects containing: "question_text", "question_type", "options" (for MCQ), "correct_answer".
No markdown, no explanation, just the JSON array.`;
}
