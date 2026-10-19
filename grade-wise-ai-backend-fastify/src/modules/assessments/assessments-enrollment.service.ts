import { db } from "../../db/index.js";
import { users, enrollments } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";
import { AppError, ConflictError } from "../../utils/errors.js";
import { loadAssessmentForManagement } from "./assessments-common.js";

export async function enrollStudentService(
  assessmentId: number,
  email: string,
  userId: number,
  role: string
): Promise<void> {
  await loadAssessmentForManagement(assessmentId, userId, role);

  const student = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!student[0] || student[0].role !== "student") {
    throw new AppError("INVALID_STUDENT", "User is not a student or not found", 400);
  }

  const studentId = student[0].id;

  const existing = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(and(eq(enrollments.assessmentId, assessmentId), eq(enrollments.studentId, studentId)))
    .limit(1);

  if (existing.length > 0) {
    throw new ConflictError("Student is already enrolled in this assessment.");
  }

  await db
    .insert(enrollments)
    .values({ assessmentId, studentId });
}

export async function unenrollStudentService(
  assessmentId: number,
  studentId: number,
  userId: number,
  role: string
): Promise<void> {
  await loadAssessmentForManagement(assessmentId, userId, role);
  await db
    .delete(enrollments)
    .where(and(eq(enrollments.assessmentId, assessmentId), eq(enrollments.studentId, studentId)));
}

export async function getEnrolledStudentsService(
  assessmentId: number,
  userId: number,
  role: string
) {
  await loadAssessmentForManagement(assessmentId, userId, role);
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
