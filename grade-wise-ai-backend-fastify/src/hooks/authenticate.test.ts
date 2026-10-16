import { describe, it, expect, vi } from "vitest";
import { authenticate } from "./authenticate.js";
import type { FastifyRequest, FastifyReply } from "fastify";

describe("authenticate hook", () => {
  it("allows request to continue when token payload has valid id and role", async () => {
    const mockRequest = {
      jwtVerify: vi.fn().mockResolvedValue(undefined),
      user: { id: 42, email: "teacher@gradewise.ai", role: "instructor" },
    } as unknown as FastifyRequest;

    const mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    await authenticate(mockRequest, mockReply);

    expect(mockRequest.jwtVerify).toHaveBeenCalledTimes(1);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it("returns 401 with 'Invalid token payload' when user id or role is missing", async () => {
    const mockRequestMissingId = {
      jwtVerify: vi.fn().mockResolvedValue(undefined),
      user: { email: "no-id@gradewise.ai", role: "student" },
    } as unknown as FastifyRequest;

    const mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    await authenticate(mockRequestMissingId, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid token payload",
    });
  });

  it("returns 401 with 'Unauthorized — invalid or missing token' when jwtVerify throws", async () => {
    const mockRequest = {
      jwtVerify: vi.fn().mockRejectedValue(new Error("Token expired")),
      user: undefined,
    } as unknown as FastifyRequest;

    const mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    await authenticate(mockRequest, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized — invalid or missing token",
    });
  });
});
