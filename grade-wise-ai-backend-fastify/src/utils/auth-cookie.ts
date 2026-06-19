import type { FastifyReply } from "fastify";

export const AUTH_COOKIE_NAME = "gradewise_token";

const ONE_DAY_SECONDS = 60 * 60 * 24;

export function setAuthCookie(reply: FastifyReply, token: string): void {
  const isProd = process.env["NODE_ENV"] === "production";
  reply.setCookie(AUTH_COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: ONE_DAY_SECONDS,
  });
}

export function clearAuthCookie(reply: FastifyReply): void {
  reply.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
}
