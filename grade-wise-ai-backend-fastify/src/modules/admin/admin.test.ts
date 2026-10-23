import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AdminOverviewResponseSchema,
  AdminUsersQuerySchema,
  ChangeRoleBodySchema,
  CreateAdminUserBodySchema,
} from "./admin.schema.js";
import {
  getAdminOverviewService,
  getAdminUsersService,
  changeUserRoleService,
  removeUserService,
  createAdminUserService,
} from "./admin.service.js";
import { db } from "../../db/index.js";
import { AppError, NotFoundError } from "../../utils/errors.js";

describe("Admin Module Schema Validation", () => {
  it("validates a valid AdminOverviewResponse", () => {
    const validData = {
      users: {
        total: 100,
        admins: 5,
        instructors: 25,
        students: 70,
        verified: 80,
        unverified: 20,
      },
      assessments: {
        total: 15,
        executed: 10,
      },
      attempts: {
        total: 250,
        completed: 230,
        averageScore: 84.5,
      },
    };

    const parsed = AdminOverviewResponseSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it("validates AdminUsersQuerySchema pagination and filtering", () => {
    const query = {
      search: "Alice",
      role: "student",
      page: "2",
      limit: "25",
    };

    const parsed = AdminUsersQuerySchema.safeParse(query);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.page).toBe(2);
      expect(parsed.data.limit).toBe(25);
      expect(parsed.data.role).toBe("student");
      expect(parsed.data.search).toBe("Alice");
    }
  });

  it("rejects invalid role in ChangeRoleBodySchema", () => {
    const invalid = { newRole: "super_admin" };
    const parsed = ChangeRoleBodySchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("accepts valid roles in ChangeRoleBodySchema", () => {
    expect(ChangeRoleBodySchema.safeParse({ newRole: "admin" }).success).toBe(true);
    expect(ChangeRoleBodySchema.safeParse({ newRole: "instructor" }).success).toBe(true);
    expect(ChangeRoleBodySchema.safeParse({ newRole: "student" }).success).toBe(true);
  });

  it("validates CreateAdminUserBodySchema correctly", () => {
    const valid = {
      name: "Dr. Jane Smith",
      email: "jane.smith@university.edu",
      password: "SecurePassword123!",
      role: "instructor",
    };
    const parsed = CreateAdminUserBodySchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name).toBe("Dr. Jane Smith");
      expect(parsed.data.role).toBe("instructor");
    }

    // rejects short password
    expect(CreateAdminUserBodySchema.safeParse({ ...valid, password: "123" }).success).toBe(false);
    // rejects invalid email
    expect(CreateAdminUserBodySchema.safeParse({ ...valid, email: "invalid-email" }).success).toBe(false);
    // rejects super_admin role
    expect(CreateAdminUserBodySchema.safeParse({ ...valid, role: "super_admin" }).success).toBe(false);
  });
});

describe("Admin Service Logic", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("changeUserRoleService prevents changing self role", async () => {
    await expect(changeUserRoleService(5, "instructor", 5)).rejects.toThrow(AppError);
    await expect(changeUserRoleService(5, "instructor", 5)).rejects.toThrow("Cannot change your own role");
  });

  it("removeUserService prevents self deletion", async () => {
    await expect(removeUserService(10, 10)).rejects.toThrow(AppError);
    await expect(removeUserService(10, 10)).rejects.toThrow("Cannot delete your own account");
  });

  it("getAdminOverviewService aggregates metrics", async () => {
    const mockUserCounts = { total: 10, admins: 2, instructors: 3, students: 5, verified: 8, unverified: 2 };
    const mockAssessmentCounts = { total: 4, executed: 2 };
    const mockAttemptCounts = { total: 20, completed: 18, avgScore: "78.4" };

    let callCount = 0;
    vi.spyOn(db, "select").mockImplementation(() => {
      callCount++;
      return {
        from: vi.fn().mockReturnValue(
          callCount === 1
            ? [mockUserCounts]
            : callCount === 2
            ? [mockAssessmentCounts]
            : [mockAttemptCounts]
        ),
      } as never;
    });

    const overview = await getAdminOverviewService();
    expect(overview.users.total).toBe(10);
    expect(overview.users.admins).toBe(2);
    expect(overview.assessments.total).toBe(4);
    expect(overview.attempts.averageScore).toBe(78.4);
  });
});
