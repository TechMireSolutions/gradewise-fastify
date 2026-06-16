import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { authenticate } from "../../hooks/authenticate.js";
import { authorize } from "../../hooks/authorize.js";
import { verifyCaptcha } from "../../utils/captcha.js";
import { toHttpError } from "../../utils/errors.js";
import {
  SignupSchema,
  LoginSchema,
  GoogleAuthSchema,
  RegisterStudentSchema,
  ChangeRoleSchema,
  ForgotPasswordSchema,
  ChangePasswordSchema,
} from "./auth.schema.js";
import {
  signupService,
  loginService,
  googleAuthService,
  verifyEmailService,
  forgotPasswordService,
  changePasswordService,
  registerStudentService,
  changeRoleService,
  removeUserService,
  getAllUsers,
} from "./auth.service.js";

const SuccessResponse = z.object({ success: z.literal(true), message: z.string() });
const ErrorResponse = z.object({ success: z.literal(false), message: z.string() });

export default async function authModule(app: FastifyInstance) {
  const f = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/auth/signup
  f.post("/signup", {
    config: { rateLimit: { max: 10, timeWindow: "15 minutes" } },
    schema: { body: SignupSchema },
  }, async (request, reply) => {
    try {
      await verifyCaptcha(request.body.captchaToken);
      const { user, emailSent } = await signupService(request.body);
      const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role });
      return reply.code(201).send({
        success: true,
        message: emailSent
          ? "Account created. Check your email to verify."
          : "Account created successfully.",
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, verified: user.verified },
      });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // POST /api/auth/login
  f.post("/login", {
    config: { rateLimit: { max: 10, timeWindow: "15 minutes" } },
    schema: { body: LoginSchema },
  }, async (request, reply) => {
    try {
      await verifyCaptcha(request.body.captchaToken);
      const user = await loginService(request.body);
      const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role });
      return reply.send({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          userRole: user.role,
          routeRole: user.role,
          verified: user.verified,
          provider: user.provider,
        },
      });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // POST /api/auth/google-auth
  f.post("/google-auth", {
    schema: { body: GoogleAuthSchema },
  }, async (request, reply) => {
    try {
      const user = await googleAuthService(request.body);
      const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role });
      return reply.send({
        success: true,
        message: "Google authentication successful",
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, verified: user.verified },
      });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/auth/verify/:token
  f.get("/verify/:token", {
    schema: { params: z.object({ token: z.string() }) },
  }, async (request, reply) => {
    try {
      const result = await verifyEmailService(request.params.token);
      return reply.send({ success: true, ...result });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // POST /api/auth/forgot-password
  f.post("/forgot-password", {
    config: { rateLimit: { max: 5, timeWindow: "15 minutes" } },
    schema: { body: ForgotPasswordSchema },
  }, async (request, reply) => {
    // Always return 200 to prevent email enumeration
    await forgotPasswordService(request.body.email).catch(() => {});
    return reply.send({ success: true, message: "If that email exists, a reset link was sent." });
  });

  // POST /api/auth/change-password
  f.post("/change-password", {
    schema: { body: ChangePasswordSchema },
  }, async (request, reply) => {
    try {
      await changePasswordService(request.body.resetId, request.body.newPassword);
      return reply.send({ success: true, message: "Password updated successfully." });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // POST /api/auth/register-student  [instructor, admin, super_admin]
  f.post("/register-student", {
    preHandler: [authenticate, authorize("instructor", "admin", "super_admin")],
    schema: { body: RegisterStudentSchema },
  }, async (request, reply) => {
    try {
      const student = await registerStudentService(request.body);
      return reply.code(201).send({
        success: true,
        message: "Student registered successfully.",
        user: { id: student.id, name: student.name, email: student.email, role: student.role },
      });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/auth/users  [admin, super_admin]
  f.get("/users", {
    preHandler: [authenticate, authorize("admin", "super_admin")],
  }, async (request, reply) => {
    try {
      const allUsers = await getAllUsers();
      return reply.send({ success: true, data: allUsers });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // PUT /api/auth/change-role  [admin, super_admin]
  f.put("/change-role", {
    preHandler: [authenticate, authorize("admin", "super_admin")],
    schema: { body: ChangeRoleSchema },
  }, async (request, reply) => {
    try {
      const requester = request.user as { id: number };
      const updated = await changeRoleService(
        request.body.userId,
        request.body.newRole,
        requester.id
      );
      return reply.send({
        success: true,
        message: "Role updated successfully.",
        user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role },
      });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // DELETE /api/auth/users/:userId  [super_admin]
  f.delete("/users/:userId", {
    preHandler: [authenticate, authorize("super_admin")],
    schema: { params: z.object({ userId: z.coerce.number().int().positive() }) },
  }, async (request, reply) => {
    try {
      await removeUserService(request.params.userId);
      return reply.send({ success: true, message: "User deleted successfully." });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });
}
