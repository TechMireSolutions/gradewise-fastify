import { db } from "../../db/index.js";
import {
  assessments,
  questionBlocks,
  enrollments,
  assessmentResources,
  resources,
  resourceChunks,
  assessmentAttempts,
  type Assessment,
  type QuestionBlock,
  type NewAssessment,
} from "../../db/schema.js";
import { eq, and, inArray, sql } from "drizzle-orm";
import { AppError, NotFoundError, ForbiddenError } from "../../utils/errors.js";
import type { CreateAssessmentInput, UpdateAssessmentInput, PhysicalPaperInput } from "./assessments.schema.js";
import { generatePhysicalPaperPdf, validateAndProcessPdf } from "../../utils/pdf.js";
import { PassThrough } from "stream";
import { assertCanManageAssessment, loadAssessmentForManagement } from "./assessments-common.js";
import { generatePreviewQuestions } from "./assessments-preview.service.js";

// Re-exports for clean modular access and 100% backward compatibility
export { assertCanManageAssessment, loadAssessmentForManagement } from "./assessments-common.js";
export {
  enrollStudentService,
  unenrollStudentService,
  getEnrolledStudentsService,
} from "./assessments-enrollment.service.js";
export {
  generatePreviewQuestions,
  previewQuestionsService,
  getAssessmentAIPromptService,
} from "./assessments-preview.service.js";
export { parseQuestionsFromAI } from "./question-generation.js";

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createAssessmentService(
  input: CreateAssessmentInput,
  instructorId: number
): Promise<Assessment> {
  const { title, prompt, externalLinks, questionBlocks: blocks, selectedResources, language } = input;

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
        language: language ?? "en",
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

    // Link resources
    if (hasResources) {
      await trx.insert(assessmentResources).values(
        selectedResources.map((resourceId) => ({
          assessmentId: assessment.id,
          resourceId,
        }))
      );
    }

    return assessment;
  });
}

// ─── Clone ────────────────────────────────────────────────────────────────────

export async function cloneAssessmentService(
  sourceId: number,
  userId: number,
  role?: string
) {
  const [source] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, sourceId))
    .limit(1);

  if (!source) throw new NotFoundError("Source assessment not found");
  assertCanManageAssessment(source, userId, role ?? "instructor");

  const [blocks, linkedResources] = await Promise.all([
    db.select().from(questionBlocks).where(eq(questionBlocks.assessmentId, sourceId)),
    db.select().from(assessmentResources).where(eq(assessmentResources.assessmentId, sourceId)),
  ]);

  return db.transaction(async (trx) => {
    const [cloned] = await trx
      .insert(assessments)
      .values({
        title: `${source.title} (Copy)`,
        prompt: source.prompt,
        externalLinks: source.externalLinks,
        instructorId: userId,
        isExecuted: false,
        language: source.language ?? "en",
      } satisfies Omit<NewAssessment, "id" | "createdAt" | "updatedAt">)
      .returning();

    if (!cloned) throw new AppError("CLONE_FAILED", "Failed to clone assessment", 500);

    if (blocks.length > 0) {
      await trx.insert(questionBlocks).values(
        blocks.map((b) => ({
          assessmentId: cloned.id,
          questionType: b.questionType,
          questionCount: b.questionCount,
          durationPerQuestion: b.durationPerQuestion,
          numOptions: b.numOptions,
          leftCount: b.leftCount,
          rightCount: b.rightCount,
          positiveMarks: b.positiveMarks,
          negativeMarks: b.negativeMarks,
          createdBy: userId,
        }))
      );
    }

    if (linkedResources.length > 0) {
      await trx.insert(assessmentResources).values(
        linkedResources.map((r) => ({
          assessmentId: cloned.id,
          resourceId: r.resourceId,
        }))
      );
    }

    return {
      ...mapAssessment(cloned),
      isExecuted: cloned.isExecuted,
    };
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
    language: a.language ?? "en",
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
      .select({
        id: resources.id,
        name: resources.name,
        url: resources.url,
        fileType: resources.fileType,
        contentType: resources.contentType,
        createdAt: resources.createdAt,
        chunkText: resourceChunks.chunkText,
      })
      .from(assessmentResources)
      .innerJoin(resources, eq(assessmentResources.resourceId, resources.id))
      .leftJoin(resourceChunks, eq(resourceChunks.resourceId, resources.id))
      .where(eq(assessmentResources.assessmentId, assessmentId)),
  ]);

  return {
    ...mapAssessment(assessment),
    question_blocks: blocks.map(mapBlock),
    enrolled_count: countResult[0]?.count ?? 0,
    resources: linkedResources.map(({ chunkText, createdAt, fileType, contentType, ...rest }) => ({
      ...rest,
      created_at: createdAt,
      file_type: fileType,
      content_type: contentType,
      chunks: chunkText ? [{ chunk_text: chunkText, chunk_index: 0 }] : [],
    })),
  };
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateAssessmentService(
  assessmentId: number,
  input: UpdateAssessmentInput,
  userId: number,
  role?: string
): Promise<any> {
  const [existing] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);

  if (!existing) throw new NotFoundError("Assessment");
  assertCanManageAssessment(existing, userId, role ?? "instructor");

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
  if (input.language !== undefined) updateData.language = input.language;

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

  return getAssessmentService(assessmentId, userId, role ?? "instructor");
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

// ─── Physical paper ───────────────────────────────────────────────────────────

export async function generatePhysicalPaperService(
  assessmentId: number,
  options: PhysicalPaperInput,
  userId?: number,
  role?: string
): Promise<Buffer> {
  const assessment = await loadAssessmentForManagement(assessmentId, userId ?? -1, role ?? "instructor");

  const blocks = await db
    .select()
    .from(questionBlocks)
    .where(eq(questionBlocks.assessmentId, assessmentId));
  if (blocks.length === 0) throw new AppError("NO_BLOCKS", "No question blocks configured", 400);

  // If questions are provided directly (e.g. from customized editor), use them;
  // otherwise generate preview questions from AI
  let questionsToUse: Array<Record<string, unknown>> = [];

  if (Array.isArray(options.questions) && options.questions.length > 0) {
    questionsToUse = options.questions as Array<Record<string, unknown>>;
  } else {
    try {
      const generated = await generatePreviewQuestions(assessment, options.language);
      questionsToUse = (generated || []) as Array<Record<string, unknown>>;
    } catch (genErr: unknown) {
      const errMsg = genErr instanceof Error ? genErr.message : String(genErr);
      throw new AppError(
        "PREVIEW_GENERATION_FAILED",
        `Failed to generate questions via AI: ${errMsg}. You can customize or add questions manually in Edit Mode.`,
        422
      );
    }
  }

  if (questionsToUse.length === 0) {
    throw new AppError(
      "NO_QUESTIONS_AVAILABLE",
      `No questions were generated for language "${options.language}". You can customize or add questions manually in Edit Mode.`,
      422
    );
  }

  const paperQuestions: import("../../utils/pdf.js").PaperQuestion[] = questionsToUse.map((q, i) => {
    const rawOpts = q["options"];
    let parsedOpts: string[] | undefined;
    if (Array.isArray(rawOpts)) {
      parsedOpts = rawOpts.map((o) => (typeof o === "string" ? o : (o as any)?.text ?? String(o)));
    } else if (typeof rawOpts === "string") {
      try {
        const parsed = JSON.parse(rawOpts);
        if (Array.isArray(parsed)) parsedOpts = parsed;
      } catch {
        parsedOpts = undefined;
      }
    }

    return {
      questionNumber: Number(q["questionNumber"] ?? i + 1),
      questionText: String(q["question_text"] ?? q["questionText"] ?? `Question ${i + 1}`),
      questionType: String(q["question_type"] ?? q["questionType"] ?? "multiple_choice"),
      options: parsedOpts,
      marks: Number(q["marks"] ?? blocks[0]?.positiveMarks ?? 1),
    };
  });

  const paperOptions: import("../../utils/pdf.js").PhysicalPaperOptions = {
    instituteName: options.instituteName,
    teacherName: options.teacherName,
    subjectName: options.subjectName,
    paperDate: options.paperDate,
    paperTime: options.paperTime,
    paperDuration: options.paperDuration,
    totalMarks: options.totalMarks,
    notes: options.notes,
    pageSize: options.pageSize,
    headerFontSize: options.headerFontSize,
    bodyFontSize: options.bodyFontSize,
    optionFontSize: options.optionFontSize,
    language: options.language,
    questions: paperQuestions,
  };

  const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = new PassThrough();
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
    generatePhysicalPaperPdf(paperOptions, stream);
  });

  // Automated PDF check and validation pipeline
  const validation = validateAndProcessPdf(pdfBuffer, paperOptions);
  if (!validation.isValid) {
    console.warn("[PhysicalPaper] PDF check pipeline reported formatting warnings:", validation.issues);
  }

  return validation.buffer;
}
