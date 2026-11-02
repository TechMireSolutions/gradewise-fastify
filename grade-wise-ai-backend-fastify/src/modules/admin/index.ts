import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authenticate } from "../../hooks/authenticate.js";
import { authorize } from "../../hooks/authorize.js";
import { ADMIN_ROLES } from "../../constants/roles.js";
import { UserIdParamSchema } from "../../schemas/common.js";
import { toHttpError } from "../../utils/errors.js";
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

export default async function adminModule(app: FastifyInstance) {
  const f = app.withTypeProvider<ZodTypeProvider>();

  // Overview metrics for Admin Dashboard
  f.get("/overview", {
    preHandler: [authenticate, authorize(...ADMIN_ROLES)],
  }, async (_request, reply) => {
    try {
      const data = await getAdminOverviewService();
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // User list with optional pagination, search, and role filtering
  f.get("/users", {
    preHandler: [authenticate, authorize(...ADMIN_ROLES)],
    schema: { querystring: AdminUsersQuerySchema },
  }, async (request, reply) => {
    try {
      const result = await getAdminUsersService(request.query);
      return reply.send({
        success: true,
        users: result.users,
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // Create user with designated role (Admin / Super Admin)
  f.post("/users", {
    preHandler: [authenticate, authorize(...ADMIN_ROLES)],
    schema: { body: CreateAdminUserBodySchema },
  }, async (request, reply) => {
    try {
      const user = await createAdminUserService(request.body);
      return reply.code(201).send({
        success: true,
        message: "User created successfully.",
        user,
      });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // Change user role
  f.put("/users/:userId/role", {
    preHandler: [authenticate, authorize(...ADMIN_ROLES)],
    schema: {
      params: UserIdParamSchema,
      body: ChangeRoleBodySchema,
    },
  }, async (request, reply) => {
    try {
      const requester = request.user as { id: number };
      const updated = await changeUserRoleService(
        request.params.userId,
        request.body.newRole,
        requester.id
      );
      return reply.send({
        success: true,
        message: "Role updated successfully.",
        user: updated,
      });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // Delete user (super_admin only)
  f.delete("/users/:userId", {
    preHandler: [authenticate, authorize("super_admin")],
    schema: { params: UserIdParamSchema },
  }, async (request, reply) => {
    try {
      const requester = request.user as { id: number };
      await removeUserService(request.params.userId, requester.id);
      return reply.send({ success: true, message: "User deleted successfully." });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });
}
