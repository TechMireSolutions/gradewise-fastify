import { describe, it, expect } from "vitest";
import {
  ResourceVisibilityEnum,
  ResourceUploadMetaSchema,
  ResourceItemSchema,
} from "./resources.schema.js";

describe("Resources Module Schemas", () => {
  describe("ResourceVisibilityEnum", () => {
    it("validates permitted visibility values", () => {
      expect(ResourceVisibilityEnum.safeParse("private").success).toBe(true);
      expect(ResourceVisibilityEnum.safeParse("public").success).toBe(true);
      expect(ResourceVisibilityEnum.safeParse("unlisted").success).toBe(false);
    });
  });

  describe("ResourceUploadMetaSchema", () => {
    it("accepts optional metadata with private default visibility", () => {
      const result = ResourceUploadMetaSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.visibility).toBe("private");
      }
    });

    it("validates external resource URL if provided", () => {
      const valid = ResourceUploadMetaSchema.safeParse({
        name: "React Docs",
        url: "https://react.dev",
        visibility: "public",
      });
      expect(valid.success).toBe(true);

      const invalid = ResourceUploadMetaSchema.safeParse({
        url: "not-a-valid-url",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("ResourceItemSchema", () => {
    it("validates database resource item structure", () => {
      const item = {
        id: 101,
        name: "Chapter1_Biology.pdf",
        url: "https://s3.amazonaws.com/bucket/Chapter1_Biology.pdf",
        visibility: "private",
        fileType: "application/pdf",
        fileSize: 1048576,
        createdAt: "2026-10-15T10:00:00Z",
      };
      expect(ResourceItemSchema.safeParse(item).success).toBe(true);
    });

    it("rejects non-positive resource IDs", () => {
      const invalid = {
        id: -5,
        name: "file.pdf",
        visibility: "private",
      };
      expect(ResourceItemSchema.safeParse(invalid).success).toBe(false);
    });
  });
});
