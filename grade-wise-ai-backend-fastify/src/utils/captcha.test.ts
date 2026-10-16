import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";

describe("verifyCaptcha utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("bypasses verification when SKIP_CAPTCHA is true", async () => {
    const originalSkip = process.env["SKIP_CAPTCHA"];
    const originalEnv = process.env["NODE_ENV"];
    process.env["SKIP_CAPTCHA"] = "true";

    // Dynamic import to test evaluation
    const { verifyCaptcha } = await import("./captcha.js");
    await expect(verifyCaptcha(undefined)).resolves.toBeUndefined();

    process.env["SKIP_CAPTCHA"] = originalSkip;
    process.env["NODE_ENV"] = originalEnv;
  });

  it("handles verification flow with axios mock", async () => {
    const postSpy = vi.spyOn(axios, "post");
    const { verifyCaptcha } = await import("./captcha.js");

    // When SKIP_CAPTCHA is active in dev/test, it immediately returns
    await expect(verifyCaptcha("any-token")).resolves.toBeUndefined();
    expect(postSpy).not.toHaveBeenCalled();
  });
});
