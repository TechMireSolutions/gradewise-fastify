import { db, users, assessments, assessmentAttempts, questionBlocks } from "../../db/index.js";
import { eq, sql, and, or, ilike, desc } from "drizzle-orm";
import type { User } from "../../db/schema.js";
import { AppError, NotFoundError } from "../../utils/errors.js";
import { roundScore } from "../analytics/shared.js";
import type { AdminOverviewResponse, AdminUsersQuery } from "./admin.schema.js";

export async function getAdminOverviewService(): Promise<AdminOverviewResponse> {
  const [userCounts] = await db
    .select({
      total: sql<number>`count(*)`,
      admins: sql<number>`count(case when ${users.role} = 'admin' then 1 end)`,
      instructors: sql<number>`count(case when ${users.role} = 'instructor' then 1 end)`,
      students: sql<number>`count(case when ${users.role} = 'student' then 1 end)`,
      verified: sql<number>`count(case when ${users.verified} = true then 1 end)`,
      unverified: sql<number>`count(case when ${users.verified} = false then 1 end)`,
    })
    .from(users);

  const [assessmentCounts] = await db
    .select({
      total: sql<number>`count(*)`,
      executed: sql<number>`count(case when ${assessments.isExecuted} = true then 1 end)`,
    })
    .from(assessments);

  const [attemptCounts] = await db
    .select({
      total: sql<number>`count(*)`,
      completed: sql<number>`count(case when ${assessmentAttempts.status} = 'completed' then 1 end)`,
      avgScore: sql<number>`avg(cast(${assessmentAttempts.score} as float))`,
    })
    .from(assessmentAttempts);

  return {
    users: {
      total: Number(userCounts?.total ?? 0),
      admins: Number(userCounts?.admins ?? 0),
      instructors: Number(userCounts?.instructors ?? 0),
      students: Number(userCounts?.students ?? 0),
      verified: Number(userCounts?.verified ?? 0),
      unverified: Number(userCounts?.unverified ?? 0),
    },
    assessments: {
      total: Number(assessmentCounts?.total ?? 0),
      executed: Number(assessmentCounts?.executed ?? 0),
    },
    attempts: {
      total: Number(attemptCounts?.total ?? 0),
      completed: Number(attemptCounts?.completed ?? 0),
      averageScore: roundScore(attemptCounts?.avgScore),
    },
  };
}

export type CleanUser = Omit<User, "password" | "verificationToken" | "resetToken">;

export async function getAdminUsersService(query?: AdminUsersQuery): Promise<{
  users: CleanUser[];
  total: number;
  page?: number;
  limit?: number;
}> {
  const conditions = [];

  if (query?.role) {
    conditions.push(eq(users.role, query.role));
  }

  if (query?.search && query.search.trim() !== "") {
    const term = `%${query.search.trim()}%`;
    conditions.push(or(ilike(users.name, term), ilike(users.email, term)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(whereClause);

  const total = Number(countResult?.count ?? 0);

  let q = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      verified: users.verified,
      provider: users.provider,
      uid: users.uid,
      resetTokenExpires: users.resetTokenExpires,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(whereClause)
    .orderBy(desc(users.createdAt));

  if (query?.page && query?.limit) {
    const offset = (query.page - 1) * query.limit;
    const paginatedUsers = await q.limit(query.limit).offset(offset);
    return {
      users: paginatedUsers,
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  const allUsers = await q;
  return {
    users: allUsers,
    total,
  };
}

export async function changeUserRoleService(
  userId: number,
  newRole: string,
  requesterId: number
): Promise<CleanUser> {
  if (userId === requesterId) {
    throw new AppError("SELF_ROLE_CHANGE", "Cannot change your own role", 400);
  }

  const [updated] = await db
    .update(users)
    .set({ role: newRole as User["role"], updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      verified: users.verified,
      provider: users.provider,
      uid: users.uid,
      resetTokenExpires: users.resetTokenExpires,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  if (!updated) throw new NotFoundError("User");
  return updated;
}

export async function removeUserService(userId: number, requesterId: number): Promise<void> {
  if (userId === requesterId) {
    throw new AppError("SELF_DELETE", "Cannot delete your own account", 400);
  }

  // Detach question blocks created by this user before delete
  await db
    .update(questionBlocks)
    .set({ createdBy: null })
    .where(eq(questionBlocks.createdBy, userId));

  const result = await db.delete(users).where(eq(users.id, userId)).returning();
  if (result.length === 0) throw new NotFoundError("User");
}
