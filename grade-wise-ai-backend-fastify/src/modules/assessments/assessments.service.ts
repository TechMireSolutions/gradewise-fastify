import { db } from "../../db/index.js";
import {
  assessments,
  questionBlocks,
  enrollments,
  assessmentResources,
  resources,
  resourceChunks,
  assessmentAttempts,
  generatedQuestions,
  studentAnswers,
  users,
  type Assessment,
  type QuestionBlock,
  type NewAssessment,
} from "../../db/schema.js";
import { eq, and, inArray, sql } from "drizzle-orm";
import { AppError, NotFoundError, ForbiddenError } from "../../utils/errors.js";
import { generateContent, mapLanguageCode } from "../../ai/generate.js";
import type { CreateAssessmentInput, UpdateAssessmentInput, PhysicalPaperInput } from "./assessments.schema.js";
import {
  gatherAssessmentContext,
  buildBlockPrompt,
  parseQuestionsFromAI,
} from "./question-generation.js";
import { generatePhysicalPaperPdf } from "../../utils/pdf.js";
import { PassThrough } from "stream";

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createAssessmentService(
  input: CreateAssessmentInput,
  instructorId: number
): Promise<Assessment> {
  const { title, prompt, externalLinks, questionBlocks: blocks, selectedResources } = input;

  const hasLinks = externalLinks && externalLinks.length > 0;
  const hasResources = selectedResources && selectedResources.length > 0;
  if (!prompt?.trim() && !hasLinks && !hasResources) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Provide at least one source: prompt, external links, or selected resources.",
      422
    );
  }

  return db.transaction(async (trx) => {
    const [assessment] = await trx
      .insert(assessments)
      .values({
        title: title.trim(),
        prompt: prompt?.trim() ?? null,
        externalLinks: hasLinks ? externalLinks : null,
        instructorId,
        isExecuted: false,
      } satisfies Omit<NewAssessment, "id" | "createdAt" | "updatedAt">)
      .returning();

    if (!assessment) throw new AppError("CREATE_FAILED", "Failed to create assessment", 500);

    // Store question blocks
    if (blocks.length > 0) {
      await trx.insert(questionBlocks).values(
        blocks.map((b) => ({
          assessmentId: assessment.id,
          questionType: b.questionType,
          questionCount: b.questionCount,
          durationPerQuestion: b.durationPerQuestion,
          numOptions: b.numOptions ?? 4,
          leftCount: b.leftCount ?? 3,
          rightCount: b.rightCount ?? 4,
          positiveMarks: String(b.positiveMarks),
          negativeMarks: String(b.negativeMarks),
          createdBy: instructorId,
        }))
      );
    }

    // Link selected resources
    if (selectedResources && selectedResources.length > 0) {
      await trx.insert(assessmentResources).values(
        selectedResources.map((rid) => ({ assessmentId: assessment.id, resourceId: rid }))
      );
    }

    return assessment;
  });
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapBlock(b: QuestionBlock) {
  return {
    id: b.id,
    assessment_id: b.assessmentId,
    question_type: b.questionType,
    question_count: b.questionCount,
    duration_per_question: b.durationPerQuestion,
    num_options: b.numOptions,
    num_first_side: b.leftCount,
    num_second_side: b.rightCount,
    positive_marks: b.positiveMarks,
    negative_marks: b.negativeMarks,
    created_by: b.createdBy,
    created_at: b.createdAt,
  };
}

function mapAssessment(a: Assessment) {
  return {
    id: a.id,
    title: a.title,
    prompt: a.prompt,
    external_links: a.externalLinks,
    instructor_id: a.instructorId,
    is_executed: a.isExecuted,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  };
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getInstructorAssessmentsService(instructorId: number) {
  const rows = await db
    .select()
    .from(assessments)
    .where(eq(assessments.instructorId, instructorId))
    .orderBy(sql`${assessments.createdAt} DESC`);

  return rows.map(mapAssessment);
}

export async function getAssessmentService(
  assessmentId: number,
  userId: number,
  role: string
) {
  const result = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);

  const assessment = result[0];
  if (!assessment) throw new NotFoundError("Assessment");

  const isInstructor = role === "instructor";
  const isStudent = role === "student";

  if (isInstructor && assessment.instructorId !== userId) {
    throw new ForbiddenError("Access denied to this assessment");
  }

  if (isStudent) {
    const enrollment = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(and(eq(enrollments.assessmentId, assessmentId), eq(enrollments.studentId, userId)))
      .limit(1);
    if (!enrollment[0]) {
      throw new ForbiddenError("You are not enrolled in this assessment");
    }
  }

  const [blocks, countResult, linkedResources] = await Promise.all([
    db.select().from(questionBlocks).where(eq(questionBlocks.assessmentId, assessmentId)),
    db.select({ count: sql<number>`count(*)` }).from(enrollments).where(eq(enrollments.assessmentId, assessmentId)),
    db
      .select({ id: resources.id, name: resources.name, url: resources.url, fileType: resources.fileType, contentType: resources.contentType, createdAt: resources.createdAt })
      .from(assessmentResources)
      .innerJoin(resources, eq(assessmentResources.resourceId, resources.id))
      .where(eq(assessmentResources.assessmentId, assessmentId)),
  ]);

  return {
    ...mapAssessment(assessment),
    question_blocks: blocks.map(mapBlock),
    enrolled_count: countResult[0]?.count ?? 0,
    resources: linkedResources.map((r) => ({ ...r, created_at: r.createdAt, file_type: r.fileType, content_type: r.contentType })),
  };
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateAssessmentService(
  assessmentId: number,
  input: UpdateAssessmentInput,
  userId: number
): Promise<Assessment> {
  const existing = await db
    .select()
    .from(assessments)
    .where(and(eq(assessments.id, assessmentId), eq(assessments.instructorId, userId)))
    .limit(1);

  if (!existing[0]) throw new NotFoundError("Assessment");

  const hasAttempt = await db
    .select({ id: assessmentAttempts.id })
    .from(assessmentAttempts)
    .where(eq(assessmentAttempts.assessmentId, assessmentId))
    .limit(1);

  if (hasAttempt.length > 0) {
    throw new AppError(
      "EDIT_LOCKED",
      "Cannot edit an assessment that students have already started.",
      409
    );
  }

  const updateData: Partial<NewAssessment> = { updatedAt: new Date() };
  if (input.title) updateData.title = input.title.trim();
  if (input.prompt !== undefined) updateData.prompt = input.prompt?.trim() ?? null;
  if (input.externalLinks !== undefined) updateData.externalLinks = input.externalLinks;

  const [updated] = await db
    .update(assessments)
    .set(updateData)
    .where(eq(assessments.id, assessmentId))
    .returning();

  if (!updated) throw new NotFoundError("Assessment");

  // Replace question blocks if provided
  if (input.questionBlocks) {
    await db.delete(questionBlocks).where(eq(questionBlocks.assessmentId, assessmentId));
    await db.insert(questionBlocks).values(
      input.questionBlocks.map((b) => ({
        assessmentId,
        questionType: b.questionType,
        questionCount: b.questionCount,
        durationPerQuestion: b.durationPerQuestion,
        numOptions: b.numOptions ?? 4,
        leftCount: b.leftCount ?? 3,
        rightCount: b.rightCount ?? 4,
        positiveMarks: String(b.positiveMarks),
        negativeMarks: String(b.negativeMarks),
        createdBy: userId,
      }))
    );
  }

  // Replace resource links if provided
  if (input.selectedResources !== undefined) {
    await db.delete(assessmentResources).where(eq(assessmentResources.assessmentId, assessmentId));
    if (input.selectedResources.length > 0) {
      await db.insert(assessmentResources).values(
        input.selectedResources.map((rid) => ({ assessmentId, resourceId: rid }))
      );
    }
  }

  return updated;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteAssessmentService(
  assessmentId: number,
  userId: number,
  role: string
): Promise<void> {
  const existing = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);

  if (!existing[0]) throw new NotFoundError("Assessment");
  if (existing[0].instructorId !== userId && !["admin", "super_admin"].includes(role)) {
    throw new ForbiddenError("Access denied");
  }

  const hasAttempt = await db
    .select({ id: assessmentAttempts.id })
    .from(assessmentAttempts)
    .where(eq(assessmentAttempts.assessmentId, assessmentId))
    .limit(1);

  if (hasAttempt.length > 0) {
    throw new AppError(
      "DELETE_LOCKED",
      "Cannot delete an assessment that students have attempted.",
      409
    );
  }

  // Cascade: delete in dependency order
  await db.delete(enrollments).where(eq(enrollments.assessmentId, assessmentId));
  await db.delete(questionBlocks).where(eq(questionBlocks.assessmentId, assessmentId));
  await db.delete(assessmentResources).where(eq(assessmentResources.assessmentId, assessmentId));
  await db.delete(assessments).where(eq(assessments.id, assessmentId));
}

// ─── Enrollment ───────────────────────────────────────────────────────────────

export async function enrollStudentService(
  assessmentId: number,
  studentId: number,
  instructorId: number
): Promise<void> {
  const assessment = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);
  if (!assessment[0]) throw new NotFoundError("Assessment");

  const student = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, studentId))
    .limit(1);
  if (!student[0] || student[0].role !== "student") {
    throw new AppError("INVALID_STUDENT", "User is not a student", 400);
  }

  await db
    .insert(enrollments)
    .values({ assessmentId, studentId })
    .onConflictDoNothing();
}

export async function unenrollStudentService(
  assessmentId: number,
  studentId: number
): Promise<void> {
  await db
    .delete(enrollments)
    .where(and(eq(enrollments.assessmentId, assessmentId), eq(enrollments.studentId, studentId)));
}

export async function getEnrolledStudentsService(assessmentId: number) {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      enrolledAt: enrollments.enrolledAt,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .where(eq(enrollments.assessmentId, assessmentId));
}

// ─── Preview questions ────────────────────────────────────────────────────────

export async function previewQuestionsService(
  assessmentId: number,
  language = "en"
): Promise<object[]> {
  const assessment = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);
  if (!assessment[0]) throw new NotFoundError("Assessment");

  const blocks = await db
    .select()
    .from(questionBlocks)
    .where(eq(questionBlocks.assessmentId, assessmentId));

  if (blocks.length === 0) {
    throw new AppError("NO_BLOCKS", "No question blocks configured for this assessment", 400);
  }

  const context = await gatherAssessmentContext(assessmentId);
  const langLabel = mapLanguageCode(language);
  const prompt = assessment[0].prompt ?? "";

  const allQuestions: object[] = [];

  for (const block of blocks) {
    const blockPrompt = buildBlockPrompt(block, prompt, context, langLabel);
    const raw = await generateContent(blockPrompt, { maxOutputTokens: 4096, temperature: 0.7 });
    const parsed = parseQuestionsFromAI(raw, block.questionType);
    allQuestions.push(...parsed);
  }

  return allQuestions;
}

// Re-export for backward compatibility
export { parseQuestionsFromAI } from "./question-generation.js";

// ─── Physical paper ───────────────────────────────────────────────────────────

export async function generatePhysicalPaperService(
  assessmentId: number,
  options: PhysicalPaperInput
): Promise<Buffer> {
  const assessment = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);
  if (!assessment[0]) throw new NotFoundError("Assessment");

  const blocks = await db
    .select()
    .from(questionBlocks)
    .where(eq(questionBlocks.assessmentId, assessmentId));
  if (blocks.length === 0) throw new AppError("NO_BLOCKS", "No question blocks configured", 400);

  // Generate preview questions to populate the paper
  const questions = await previewQuestionsService(assessmentId);
  const paperQuestions = questions.map((q, i) => {
    const question = q as Record<string, unknown>;
    return {
      questionNumber: i + 1,
      questionText: String(question["question_text"] ?? question["questionText"] ?? `Question ${i + 1}`),
      questionType: String(question["question_type"] ?? question["questionType"] ?? "multiple_choice"),
      options: Array.isArray(question["options"]) ? (question["options"] as string[]) : undefined,
      marks: Number(blocks[0]?.positiveMarks ?? 1),
    };
  });

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = new PassThrough();
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
    generatePhysicalPaperPdf({ ...options, questions: paperQuestions }, stream);
  });
}
