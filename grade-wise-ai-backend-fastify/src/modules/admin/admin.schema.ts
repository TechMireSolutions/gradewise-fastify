import { z } from "zod";

export const AdminOverviewResponseSchema = z.object({
  users: z.object({
    total: z.number(),
    admins: z.number(),
    instructors: z.number(),
    students: z.number(),
    superAdmins: z.number().optional().default(0),
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
  search: z.preprocess((val) => (val === "" ? undefined : val), z.string().optional()),
  role: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.enum(["admin", "instructor", "student", "super_admin"]).optional()
  ),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50).optional(),
});

export const ChangeRoleBodySchema = z.object({
  newRole: z.enum(["admin", "instructor", "student"]),
});

export const CreateAdminUserBodySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(["admin", "instructor", "student"]).default("student"),
});

export type AdminOverviewResponse = z.infer<typeof AdminOverviewResponseSchema>;
export type AdminUsersQuery = z.infer<typeof AdminUsersQuerySchema>;
export type CreateAdminUserBody = z.infer<typeof CreateAdminUserBodySchema>;
