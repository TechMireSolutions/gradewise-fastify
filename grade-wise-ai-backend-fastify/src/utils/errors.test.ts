import { describe, it, expect } from "vitest";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError,
  ServiceUnavailableError,
  toHttpError,
} from "./errors.js";

describe("errors utility", () => {
  it("creates custom AppError with correct status and code", () => {
    const err = new AppError("CUSTOM_CODE", "Something custom", 418);
    expect(err.statusCode).toBe(418);
    expect(err.code).toBe("CUSTOM_CODE");
    expect(err.message).toBe("Something custom");
    expect(err.name).toBe("AppError");
  });

  it("creates NotFoundError with 404 status and formatted message", () => {
    const err = new NotFoundError("User");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("User not found");
  });

  it("creates UnauthorizedError with 401 status", () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.message).toBe("Unauthorized");
  });

  it("creates ForbiddenError with 403 status", () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
    expect(err.message).toBe("Access denied");
  });

  it("creates ConflictError with 409 status", () => {
    const err = new ConflictError("Email already exists");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("CONFLICT");
  });

  it("creates ValidationError with 422 status", () => {
    const err = new ValidationError("Invalid payload");
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe("VALIDATION_ERROR");
  });

  it("creates ServiceUnavailableError with 503 status", () => {
    const err = new ServiceUnavailableError("AI provider down");
    expect(err.statusCode).toBe(503);
    expect(err.code).toBe("SERVICE_UNAVAILABLE");
  });

  describe("toHttpError transform", () => {
    it("extracts details from AppError subclasses", () => {
      const err = new NotFoundError("Assessment");
      const res = toHttpError(err);
      expect(res).toEqual({
        statusCode: 404,
        message: "Assessment not found",
        code: "NOT_FOUND",
      });
    });

    it("maps standard generic Error to 500 internal server error", () => {
      const err = new Error("Database connection dropped");
      const res = toHttpError(err);
      expect(res).toEqual({
        statusCode: 500,
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    });

    it("handles non-Error objects safely", () => {
      const res = toHttpError("string rejection");
      expect(res).toEqual({
        statusCode: 500,
        message: "An unexpected error occurred",
        code: "INTERNAL_ERROR",
      });
    });
  });
});
