import { describe, it, expect } from "vitest";
import { mapLanguageCode } from "./generate.js";

describe("AI Generation Language Mapping", () => {
  describe("mapLanguageCode", () => {
    it("maps en to English", () => {
      expect(mapLanguageCode("en")).toBe("English");
    });

    it("maps ur to Urdu", () => {
      expect(mapLanguageCode("ur")).toBe("Urdu");
    });

    it("maps ar to Arabic", () => {
      expect(mapLanguageCode("ar")).toBe("Arabic");
    });

    it("maps fa to Persian", () => {
      expect(mapLanguageCode("fa")).toBe("Persian");
    });

    it("maps all to All 4 Languages (Combined)", () => {
      expect(mapLanguageCode("all")).toBe("All 4 Languages (Combined)");
    });

    it("falls back to English for unknown or invalid language code", () => {
      expect(mapLanguageCode("es")).toBe("English");
      expect(mapLanguageCode("unknown")).toBe("English");
      expect(mapLanguageCode("")).toBe("English");
    });
  });
});
