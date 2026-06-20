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

const FIREBASE_CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

interface FirebaseTokenPayload {
  sub: string;
  email?: string;
  name?: string;
  aud: string;
  iss: string;
  exp: number;
  iat: number;
}

async function verifyFirebaseIdToken(
  idToken: string,
  projectId: string
): Promise<FirebaseTokenPayload> {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Malformed JWT");
  const [headerB64, payloadB64, sigB64] = parts as [string, string, string];

  const header = JSON.parse(
    Buffer.from(headerB64, "base64url").toString("utf8")
  ) as { kid?: string; alg?: string };

  if (!header.kid) throw new Error("Missing key id in token header");

  const certsRes = await fetch(FIREBASE_CERTS_URL);
  if (!certsRes.ok) throw new Error("Failed to fetch Firebase certs");
  const certs = (await certsRes.json()) as Record<string, string>;

  const cert = certs[header.kid];
  if (!cert) throw new Error(`Unknown key id: ${header.kid}`);

  const pubKey = crypto.createPublicKey(cert);
  const sigBuf = Buffer.from(sigB64, "base64url");
  const data = `${headerB64}.${payloadB64}`;
  const valid = crypto.verify("RSA-SHA256", Buffer.from(data), pubKey, sigBuf);
  if (!valid) throw new Error("Invalid token signature");

  const payload = JSON.parse(
    Buffer.from(payloadB64, "base64url").toString("utf8")
  ) as FirebaseTokenPayload;

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) throw new Error("Token expired");
  if (payload.aud !== projectId) throw new Error("Invalid audience");
  if (payload.iss !== `https://securetoken.google.com/${projectId}`)
    throw new Error("Invalid issuer");

  return payload;
}

export async function verifyGoogleIdToken(idToken: string): Promise<{
  email: string;
  name: string;
  uid: string;
}> {
  const projectId = process.env["FIREBASE_PROJECT_ID"];

  if (!projectId) {
    throw new UnauthorizedError("GOOGLE_AUTH_NOT_CONFIGURED");
  }

  try {
    const payload = await verifyFirebaseIdToken(idToken, projectId);
    if (!payload.email || !payload.sub) {
      throw new UnauthorizedError("INVALID_GOOGLE_TOKEN");
    }
    return {
      email: payload.email,
      name: payload.name ?? payload.email.split("@")[0] ?? "User",
      uid: payload.sub,
    };
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError("INVALID_GOOGLE_TOKEN");
  }
}
