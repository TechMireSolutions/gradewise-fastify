import { describe, it, expect } from "vitest";
import { encryptSecret, decryptSecret } from "./crypto.js";

describe("crypto utils", () => {
  it("round-trips encrypted secrets when ENCRYPTION_KEY is set", () => {
    process.env["ENCRYPTION_KEY"] = "test-key-for-vitest-only";
    const plain = "sk-test-api-key-12345";
    const encrypted = encryptSecret(plain);
    expect(encrypted).toMatch(/^enc:/);
    expect(decryptSecret(encrypted)).toBe(plain);
    delete process.env["ENCRYPTION_KEY"];
  });

  it("returns plaintext when encryption key is absent", () => {
    delete process.env["ENCRYPTION_KEY"];
    expect(encryptSecret("plain")).toBe("plain");
    expect(decryptSecret("plain")).toBe("plain");
  });
});
