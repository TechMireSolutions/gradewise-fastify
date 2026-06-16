import bcrypt from "bcrypt";
import crypto from "crypto";
import { db, users } from "../../db/index.js";
import { eq, or } from "drizzle-orm";
import type { NewUser, User } from "../../db/schema.js";
import {
  AppError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../utils/errors.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../../utils/email.js";

const isDev = process.env["NODE_ENV"] === "development";

// ─── User queries ─────────────────────────────────────────────────────────────

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);
  return result[0];
}

export async function findUserById(id: number): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getAllUsers(): Promise<Omit<User, "password" | "verificationToken" | "resetToken">[]> {
  return db
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
    .orderBy(users.createdAt);
}

// ─── Signup ───────────────────────────────────────────────────────────────────

export async function signupService(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: User; emailSent: boolean }> {
  const existing = await findUserByEmail(input.email);
  if (existing) throw new ConflictError("USER_EXISTS");

  const hashedPassword = await bcrypt.hash(input.password, 12);
  const verificationToken = crypto.randomBytes(32).toString("hex");

  const [newUser] = await db
    .insert(users)
    .values({
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      password: hashedPassword,
      role: "student",
      verified: isDev,
      verificationToken: isDev ? null : verificationToken,
      provider: "manual",
    } satisfies Omit<NewUser, "id" | "createdAt" | "updatedAt">)
    .returning();

  if (!newUser) throw new AppError("CREATE_FAILED", "Failed to create user", 500);

  let emailSent = false;
  if (!isDev) {
    try {
      await sendVerificationEmail(input.email, input.name, verificationToken);
      emailSent = true;
    } catch {
      emailSent = false;
    }
  }

  return { user: newUser, emailSent };
}

// ─── Google Auth ──────────────────────────────────────────────────────────────

export async function googleAuthService(input: {
  name: string;
  email: string;
  uid: string;
}): Promise<User> {
  let user = await findUserByEmail(input.email);
  if (!user) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.uid, input.uid))
      .limit(1);
    if (existing[0]) throw new ConflictError("GOOGLE_ACCOUNT_LINKED");

    const [created] = await db
      .insert(users)
      .values({
        name: input.name,
        email: input.email.toLowerCase().trim(),
        role: "student",
        verified: true,
        provider: "google",
        uid: input.uid,
      })
      .returning();

    if (!created) throw new AppError("CREATE_FAILED", "Failed to create user", 500);
    user = created;
  }
  return user;
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginService(input: {
  email: string;
  password: string;
}): Promise<User> {
  const user = await findUserByEmail(input.email);
  if (!user) throw new UnauthorizedError("INVALID_CREDENTIALS");
  if (user.provider === "google") throw new UnauthorizedError("USE_GOOGLE_SIGNIN");
  if (!user.verified && user.role !== "super_admin" && !isDev) {
    throw new UnauthorizedError("EMAIL_NOT_VERIFIED");
  }
  if (!user.password) throw new UnauthorizedError("INVALID_CREDENTIALS");

  const isMatch = await bcrypt.compare(input.password.trim(), user.password);
  if (!isMatch) throw new UnauthorizedError("INVALID_CREDENTIALS");

  return user;
}

// ─── Email verification ───────────────────────────────────────────────────────

export async function verifyEmailService(token: string): Promise<{
  status: "already_verified" | "just_verified" | "invalid_token";
  user?: Partial<User>;
}> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.verificationToken, token))
    .limit(1);

  const user = result[0];
  if (!user) return { status: "invalid_token" };
  if (user.verified) return { status: "already_verified", user: { id: user.id, email: user.email } };

  await db
    .update(users)
    .set({ verified: true, verificationToken: null, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  return { status: "just_verified", user: { id: user.id, email: user.email } };
}

// ─── Password reset ───────────────────────────────────────────────────────────

export async function forgotPasswordService(email: string): Promise<{ sent: boolean }> {
  const user = await findUserByEmail(email);
  if (!user || user.provider === "google") return { sent: false };

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db
    .update(users)
    .set({ resetToken, resetTokenExpires: expires, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  try {
    await sendPasswordResetEmail(email, user.name, resetToken);
    return { sent: true };
  } catch {
    return { sent: false };
  }
}

export async function changePasswordService(
  resetId: string,
  newPassword: string
): Promise<void> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.resetToken, resetId))
    .limit(1);

  const user = result[0];
  if (!user) throw new NotFoundError("Reset token");
  if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    throw new AppError("TOKEN_EXPIRED", "Reset link has expired. Request a new one.", 400);
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await db
    .update(users)
    .set({ password: hashed, resetToken: null, resetTokenExpires: null, updatedAt: new Date() })
    .where(eq(users.id, user.id));
}

// ─── User management ──────────────────────────────────────────────────────────

export async function registerStudentService(input: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  const existing = await findUserByEmail(input.email);
  if (existing) throw new ConflictError("USER_EXISTS");

  const hashedPassword = await bcrypt.hash(input.password, 12);
  const [newUser] = await db
    .insert(users)
    .values({
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      password: hashedPassword,
      role: "student",
      verified: true,
      provider: "manual",
    })
    .returning();

  if (!newUser) throw new AppError("CREATE_FAILED", "Failed to create student", 500);
  return newUser;
}

export async function changeRoleService(userId: number, newRole: string, requesterId: number): Promise<User> {
  if (userId === requesterId) {
    throw new AppError("SELF_ROLE_CHANGE", "Cannot change your own role", 400);
  }
  const [updated] = await db
    .update(users)
    .set({ role: newRole as User["role"], updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  if (!updated) throw new NotFoundError("User");
  return updated;
}

export async function removeUserService(userId: number): Promise<void> {
  const result = await db.delete(users).where(eq(users.id, userId)).returning();
  if (result.length === 0) throw new NotFoundError("User");
}
