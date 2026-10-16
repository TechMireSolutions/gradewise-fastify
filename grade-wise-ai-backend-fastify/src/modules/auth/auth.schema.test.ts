import { describe, it, expect } from "vitest";
import {
  SignupSchema,
  LoginSchema,
  GoogleAuthSchema,
  RegisterStudentSchema,
  ChangeRoleSchema,
  ForgotPasswordSchema,
  ChangePasswordSchema,
  RememberedLoginSchema,
} from "./auth.schema.js";

describe("Auth Module Schemas", () => {
  describe("SignupSchema", () => {
    it("accepts valid signup payloads", () => {
      const valid = {
        name: "Dr. Jane Doe",
        email: "jane.doe@example.com",
        password: "securepassword123",
        captchaToken: "test-token",
      };
      const result = SignupSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects invalid emails", () => {
      const invalid = {
        name: "Jane Doe",
        email: "not-an-email",
        password: "securepassword123",
      };
      const result = SignupSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects passwords shorter than 8 characters", () => {
      const invalid = {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "short",
      };
      const result = SignupSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects names shorter than 2 characters", () => {
      const invalid = {
        name: "J",
        email: "jane@example.com",
        password: "securepassword123",
      };
      const result = SignupSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("LoginSchema & GoogleAuthSchema", () => {
    it("accepts valid email/password login", () => {
      const result = LoginSchema.safeParse({
        email: "user@example.com",
        password: "p",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty password in LoginSchema", () => {
      const result = LoginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });

    it("validates GoogleAuth idToken", () => {
      expect(GoogleAuthSchema.safeParse({ idToken: "valid-jwt-token" }).success).toBe(true);
      expect(GoogleAuthSchema.safeParse({ idToken: "" }).success).toBe(false);
    });
  });

  describe("ChangeRoleSchema", () => {
    it("permits standard system roles", () => {
      const roles = ["super_admin", "admin", "instructor", "student"] as const;
      roles.forEach((newRole) => {
        const result = ChangeRoleSchema.safeParse({ userId: 42, newRole });
        expect(result.success).toBe(true);
      });
    });

    it("rejects invalid or unauthorized roles", () => {
      const result = ChangeRoleSchema.safeParse({ userId: 42, newRole: "moderator" });
      expect(result.success).toBe(false);
    });

    it("rejects non-positive userIds", () => {
      expect(ChangeRoleSchema.safeParse({ userId: -1, newRole: "student" }).success).toBe(false);
      expect(ChangeRoleSchema.safeParse({ userId: 0, newRole: "student" }).success).toBe(false);
    });
  });

  describe("Password Reset & Remembered Login Schemas", () => {
    it("validates ForgotPasswordSchema", () => {
      expect(ForgotPasswordSchema.safeParse({ email: "user@example.com" }).success).toBe(true);
      expect(ForgotPasswordSchema.safeParse({ email: "bad-email" }).success).toBe(false);
    });

    it("validates ChangePasswordSchema requiring resetId and 8+ char password", () => {
      expect(
        ChangePasswordSchema.safeParse({
          resetId: "reset-token-123",
          newPassword: "freshsecurepassword123",
        }).success
      ).toBe(true);

      expect(
        ChangePasswordSchema.safeParse({
          resetId: "",
          newPassword: "freshsecurepassword123",
        }).success
      ).toBe(false);
    });

    it("validates RememberedLoginSchema", () => {
      expect(RememberedLoginSchema.safeParse({ email: "cached@example.com" }).success).toBe(true);
      expect(RememberedLoginSchema.safeParse({ email: "" }).success).toBe(false);
    });
  });
});
