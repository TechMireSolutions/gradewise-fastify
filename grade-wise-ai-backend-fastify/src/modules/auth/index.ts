import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { authenticate } from "../../hooks/authenticate.js";
import { authorize } from "../../hooks/authorize.js";
import { ADMIN_ROLES, INSTRUCTOR_ROLES } from "../../constants/roles.js";
import { UserIdParamSchema } from "../../schemas/common.js";
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

export default async function authModule(app: FastifyInstance) {
  const f = app.withTypeProvider<ZodTypeProvider>();

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

  f.post("/forgot-password", {
    config: { rateLimit: { max: 5, timeWindow: "15 minutes" } },
    schema: { body: ForgotPasswordSchema },
  }, async (request, reply) => {
    await forgotPasswordService(request.body.email).catch(() => {});
    return reply.send({ success: true, message: "If that email exists, a reset link was sent." });
  });

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

  f.post("/register-student", {
    preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)],
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

  f.get("/users", {
    preHandler: [authenticate, authorize(...ADMIN_ROLES)],
  }, async (_request, reply) => {
    try {
      const allUsers = await getAllUsers();
      return reply.send({ success: true, users: allUsers });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  f.put("/change-role", {
    preHandler: [authenticate, authorize(...ADMIN_ROLES)],
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

  f.delete("/users/:userId", {
    preHandler: [authenticate, authorize("super_admin")],
    schema: { params: UserIdParamSchema },
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
