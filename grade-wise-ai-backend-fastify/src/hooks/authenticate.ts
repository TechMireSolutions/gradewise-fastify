import type { FastifyRequest, FastifyReply } from "fastify";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
    const user = request.user as { id: number; email: string; role: string };
    if (!user?.id || !user?.role) {
      return reply.code(401).send({ success: false, message: "Invalid token payload" });
    }
  } catch {
    return reply.code(401).send({ success: false, message: "Unauthorized — invalid or missing token" });
  }
}
