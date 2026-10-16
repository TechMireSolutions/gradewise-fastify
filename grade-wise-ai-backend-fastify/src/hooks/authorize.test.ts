import { describe, it, expect, vi } from "vitest";
import { authorize } from "./authorize.js";
import type { FastifyRequest, FastifyReply } from "fastify";

describe("authorize hook factory", () => {
  it("returns 401 when request.user is undefined", async () => {
    const hook = authorize("instructor", "admin");
    const mockRequest = { user: undefined } as unknown as FastifyRequest;
    const mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    await hook(mockRequest, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({ success: false, message: "Unauthorized" });
  });

  it("proceeds when user role matches allowed role", async () => {
    const hook = authorize("instructor");
    const mockRequest = {
      user: { id: 1, email: "instructor@gradewise.ai", role: "instructor" },
    } as unknown as FastifyRequest;
    const mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    await hook(mockRequest, mockReply);

    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it("proceeds when user role matches one of multiple allowed roles", async () => {
    const hook = authorize("admin", "super_admin");
    const mockRequest = {
      user: { id: 2, email: "super@gradewise.ai", role: "super_admin" },
    } as unknown as FastifyRequest;
    const mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    await hook(mockRequest, mockReply);

    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it("returns 403 when user role is not among allowed roles", async () => {
    const hook = authorize("instructor", "admin");
    const mockRequest = {
      user: { id: 3, email: "student@gradewise.ai", role: "student" },
    } as unknown as FastifyRequest;
    const mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    await hook(mockRequest, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(403);
    expect(mockReply.send).toHaveBeenCalledWith({
      success: false,
      message: "Access denied. Required role: instructor or admin",
    });
  });
});
