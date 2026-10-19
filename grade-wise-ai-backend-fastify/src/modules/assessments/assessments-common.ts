import { db } from "../../db/index.js";
import { assessments, type Assessment } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { NotFoundError, ForbiddenError } from "../../utils/errors.js";

export function assertCanManageAssessment(
  assessment: Assessment,
  userId: number,
  role: string
): void {
  if (["admin", "super_admin"].includes(role)) return;
  if (assessment.instructorId !== userId) {
    throw new ForbiddenError("Access denied to this assessment");
  }
}

export async function loadAssessmentForManagement(
  assessmentId: number,
  userId: number,
  role: string
): Promise<Assessment> {
  const [assessment] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);
  if (!assessment) throw new NotFoundError("Assessment");
  assertCanManageAssessment(assessment, userId, role);
  return assessment;
}
