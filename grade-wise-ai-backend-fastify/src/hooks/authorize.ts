import type { FastifyRequest, FastifyReply } from "fastify";

export function authorize(...allowedRoles: string[]) {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = request.user as { id: number; email: string; role: string } | undefined;
    if (!user) {
      return reply.code(401).send({ success: false, message: "Unauthorized" });
    }
    if (!allowedRoles.includes(user.role)) {
      return reply.code(403).send({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }
  };
}
