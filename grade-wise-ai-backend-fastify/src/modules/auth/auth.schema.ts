import { z } from "zod";

export const SignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  captchaToken: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  captchaToken: z.string().optional(),
});

export const GoogleAuthSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  uid: z.string().min(1),
});

export const RegisterStudentSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const ChangeRoleSchema = z.object({
  userId: z.number().int().positive(),
  newRole: z.enum(["super_admin", "admin", "instructor", "student"]),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ChangePasswordSchema = z.object({
  resetId: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const UserResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  verified: z.boolean(),
  provider: z.string(),
  createdAt: z.string().or(z.date()).optional(),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type GoogleAuthInput = z.infer<typeof GoogleAuthSchema>;
export type RegisterStudentInput = z.infer<typeof RegisterStudentSchema>;
export type ChangeRoleInput = z.infer<typeof ChangeRoleSchema>;
