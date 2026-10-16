import { describe, it, expect, vi } from "vitest";
import { setAuthCookie, clearAuthCookie, AUTH_COOKIE_NAME } from "./auth-cookie.js";
import type { FastifyReply } from "fastify";

describe("auth-cookie utility", () => {
  it("exports the expected cookie name constant", () => {
    expect(AUTH_COOKIE_NAME).toBe("gradewise_token");
  });

  it("sets httpOnly cookie with secure flag based on NODE_ENV", () => {
    const setCookieMock = vi.fn();
    const mockReply = {
      setCookie: setCookieMock,
    } as unknown as FastifyReply;

    process.env["NODE_ENV"] = "production";
    setAuthCookie(mockReply, "fake-jwt-token");

    expect(setCookieMock).toHaveBeenCalledWith(
      "gradewise_token",
      "fake-jwt-token",
      expect.objectContaining({
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 86400,
      })
    );

    process.env["NODE_ENV"] = "development";
    setAuthCookie(mockReply, "dev-token");

    expect(setCookieMock).toHaveBeenLastCalledWith(
      "gradewise_token",
      "dev-token",
      expect.objectContaining({
        secure: false,
      })
    );
  });

  it("clears the auth cookie on reply", () => {
    const clearCookieMock = vi.fn();
    const mockReply = {
      clearCookie: clearCookieMock,
    } as unknown as FastifyReply;

    clearAuthCookie(mockReply);

    expect(clearCookieMock).toHaveBeenCalledWith("gradewise_token", { path: "/" });
  });
});
