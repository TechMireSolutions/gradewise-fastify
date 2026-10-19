import { db } from "../../db/index.js";
import { questionBlocks, type Assessment } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { AppError } from "../../utils/errors.js";
import { generateContent, mapLanguageCode } from "../../ai/generate.js";
import {
  gatherAssessmentContext,
  buildBlockPrompt,
  parseQuestionsFromAI,
  buildUnifiedAssignmentPrompt,
  parseUnifiedAssignmentQuestionsFromAI,
} from "./question-generation.js";
import { loadAssessmentForManagement } from "./assessments-common.js";

export async function generatePreviewQuestions(
  assessment: Assessment,
  language: string
): Promise<object[]> {
  const blocks = await db
    .select()
    .from(questionBlocks)
    .where(eq(questionBlocks.assessmentId, assessment.id));

  if (blocks.length === 0) {
    throw new AppError("NO_BLOCKS", "No question blocks configured for this assessment", 400);
  }

  const context = await gatherAssessmentContext(assessment.id);
  const langLabel = mapLanguageCode(language);
  const prompt = assessment.prompt ?? "";

  const unifiedPrompt = buildUnifiedAssignmentPrompt(
    blocks,
    prompt,
    context,
    language,
    langLabel,
    assessment.title
  );

  try {
    const raw = await generateContent(unifiedPrompt, { maxOutputTokens: 8192, temperature: 0.7 });
    return parseUnifiedAssignmentQuestionsFromAI(raw, blocks);
  } catch (err) {
    console.warn("[PreviewQuestions] Unified generation encountered error, falling back to block prompt:", err);
    const allQuestions: object[] = [];
    for (const block of blocks) {
      try {
        const blockPrompt = buildBlockPrompt(block, prompt, context, language, langLabel);
        const raw = await generateContent(blockPrompt, { maxOutputTokens: 4096, temperature: 0.7 });
        const parsed = parseQuestionsFromAI(raw, block.questionType);
        allQuestions.push(...parsed);
      } catch (blockErr) {
        console.error(`[PreviewQuestions] Block ${block.id} generation failed:`, blockErr);
      }
    }
    return allQuestions;
  }
}

export async function previewQuestionsService(
  assessmentId: number,
  language = "en",
  userId?: number,
  role?: string
): Promise<object[]> {
  const assessment = await loadAssessmentForManagement(assessmentId, userId ?? -1, role ?? "instructor");
  return generatePreviewQuestions(assessment, language);
}

export async function getAssessmentAIPromptService(
  assessmentId: number,
  userId: number,
  role: string,
  targetLanguage?: string
): Promise<{
  language: string;
  languageLabel: string;
  unifiedPrompt: string;
  blocks: Array<{ id: number | null; questionType: string; questionCount: number; prompt: string }>;
}> {
  const assessment = await loadAssessmentForManagement(assessmentId, userId, role);

  const blocks = await db
    .select()
    .from(questionBlocks)
    .where(eq(questionBlocks.assessmentId, assessmentId));

  if (blocks.length === 0) {
    throw new AppError("NO_BLOCKS", "No question blocks configured for this assessment", 400);
  }

  const effectiveLang = (targetLanguage || "all").toLowerCase();
  const context = await gatherAssessmentContext(assessment.id);
  const langLabel = mapLanguageCode(effectiveLang);
  const instructorPrompt = assessment.prompt ?? "";

  const unifiedPrompt = buildUnifiedAssignmentPrompt(
    blocks,
    instructorPrompt,
    context,
    effectiveLang,
    langLabel,
    assessment.title,
    50_000
  );

  const mapped = blocks.map((block) => ({
    id: block.id,
    questionType: block.questionType,
    questionCount: block.questionCount,
    prompt: buildBlockPrompt(block, instructorPrompt, context, effectiveLang, langLabel, 50_000),
  }));

  return { language: effectiveLang, languageLabel: langLabel, unifiedPrompt, blocks: mapped };
}
