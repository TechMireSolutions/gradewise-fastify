import { z } from "zod";

export const AdminOverviewResponseSchema = z.object({
  users: z.object({
    total: z.number(),
    admins: z.number(),
    instructors: z.number(),
    students: z.number(),
    verified: z.number(),
    unverified: z.number(),
  }),
  assessments: z.object({
    total: z.number(),
    executed: z.number(),
  }),
  attempts: z.object({
    total: z.number(),
    completed: z.number(),
    averageScore: z.number(),
  }),
});

export const AdminUsersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(["admin", "instructor", "student", "super_admin"]).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50).optional(),
});

export const ChangeRoleBodySchema = z.object({
  newRole: z.enum(["admin", "instructor", "student"]),
});

export type AdminOverviewResponse = z.infer<typeof AdminOverviewResponseSchema>;
export type AdminUsersQuery = z.infer<typeof AdminUsersQuerySchema>;
