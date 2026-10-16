import { describe, it, expect } from "vitest";
import { maskKey } from "./config.service.js";

describe("Config Service Helpers", () => {
  describe("maskKey", () => {
    it("returns full bullet mask for empty or short keys (length <= 8)", () => {
      expect(maskKey("")).toBe("••••••••");
      expect(maskKey("1234")).toBe("••••••••");
      expect(maskKey("12345678")).toBe("••••••••");
    });

    it("masks middle of standard length API keys preserving 6 prefix and 4 suffix chars", () => {
      const standardKey = "sk-proj-1234567890abcdef";
      const masked = maskKey(standardKey);
      expect(masked).toBe("sk-pro••••cdef");
      expect(masked.startsWith("sk-pro")).toBe(true);
      expect(masked.endsWith("cdef")).toBe(true);
      expect(masked.includes("••••")).toBe(true);
    });

    it("masks keys with length just above 8 correctly", () => {
      const nineCharKey = "123456789";
      expect(maskKey(nineCharKey)).toBe("123456••••6789");
    });
  });
});
