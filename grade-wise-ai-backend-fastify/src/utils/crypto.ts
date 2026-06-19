import crypto from "crypto";
import { UnauthorizedError } from "./errors.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getEncryptionKey(): Buffer | null {
  const raw = process.env["ENCRYPTION_KEY"];
  if (!raw) return null;
  return crypto.createHash("sha256").update(raw).digest();
}

export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  if (!key) return plaintext;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:${iv.toString("base64url")}:${tag.toString("base64url")}:${encrypted.toString("base64url")}`;
}

export function decryptSecret(value: string): string {
  if (!value.startsWith("enc:")) return value;

  const key = getEncryptionKey();
  if (!key) return value;

  const [, ivB64, tagB64, dataB64] = value.split(":");
  if (!ivB64 || !tagB64 || !dataB64) return value;

  const iv = Buffer.from(ivB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");
  const data = Buffer.from(dataB64, "base64url");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export function encryptCommaSeparatedKeys(raw: string): string {
  if (!raw.trim()) return raw;
  return raw
    .split(",")
    .map((part) => encryptSecret(part.trim()))
    .join(",");
}

export function decryptCommaSeparatedKeys(raw: string): string {
  if (!raw.trim()) return raw;
  return raw
    .split(",")
    .map((part) => decryptSecret(part.trim()))
    .join(",");
}

export async function verifyGoogleIdToken(idToken: string): Promise<{
  email: string;
  name: string;
  uid: string;
}> {
  const audience =
    process.env["FIREBASE_PROJECT_ID"] ??
    process.env["GOOGLE_CLIENT_ID"] ??
    process.env["NEXT_PUBLIC_FIREBASE_PROJECT_ID"];

  if (!audience) {
    throw new UnauthorizedError("GOOGLE_AUTH_NOT_CONFIGURED");
  }

  const { OAuth2Client } = await import("google-auth-library");
  const client = new OAuth2Client(audience);

  try {
    const ticket = await client.verifyIdToken({ idToken, audience });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      throw new UnauthorizedError("INVALID_GOOGLE_TOKEN");
    }
    return {
      email: payload.email,
      name: payload.name ?? payload.email.split("@")[0] ?? "User",
      uid: payload.sub,
    };
  } catch {
    throw new UnauthorizedError("INVALID_GOOGLE_TOKEN");
  }
}
