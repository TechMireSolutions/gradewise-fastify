import axios from "axios";

const SKIP_CAPTCHA =
  process.env["SKIP_CAPTCHA"] === "true" ||
  process.env["NODE_ENV"] === "development";

export async function verifyCaptcha(token: string | undefined): Promise<void> {
  if (SKIP_CAPTCHA) return;
  if (!token) {
    throw new Error("CAPTCHA_REQUIRED");
  }

  const secret = process.env["RECAPTCHA_SECRET_KEY"];
  if (!secret) {
    console.warn("[Captcha] RECAPTCHA_SECRET_KEY not set — skipping verification");
    return;
  }

  const response = await axios.post<{ success: boolean; score?: number }>(
    "https://www.google.com/recaptcha/api/siteverify",
    null,
    { params: { secret, response: token } }
  );

  if (!response.data.success) {
    throw new Error("CAPTCHA_FAILED");
  }

  // reCAPTCHA v3: reject low-confidence scores
  if (typeof response.data.score === "number" && response.data.score < 0.4) {
    throw new Error("CAPTCHA_FAILED");
  }
}
