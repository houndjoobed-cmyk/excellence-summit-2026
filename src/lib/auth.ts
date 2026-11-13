import crypto from "node:crypto";
import { cookies } from "next/headers";
import {
  getRequiredSigningSecret,
  isPlaceholderValue,
  isSessionSecretConfigured,
} from "@/lib/site";

export const ADMIN_COOKIE_NAME = "es26_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 hours

function getConfiguredAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || "";
}

export function isAdminAuthConfigured(): boolean {
  const password = getConfiguredAdminPassword();
  if (!password) return false;
  if (process.env.NODE_ENV === "production" && isPlaceholderValue(password)) {
    return false;
  }
  return isSessionSecretConfigured();
}

/**
 * Verifies the submitted password against ADMIN_PASSWORD using constant-time SHA-256 digest comparison.
 */
export function verifyAdminPassword(candidate: string): boolean {
  const configured = getConfiguredAdminPassword();
  if (!configured) return false;

  const a = crypto.createHash("sha256").update(candidate).digest();
  const b = crypto.createHash("sha256").update(configured).digest();
  return crypto.timingSafeEqual(a, b);
}

function signPayload(payloadB64: string): string {
  return crypto
    .createHmac("sha256", getRequiredSigningSecret())
    .update(payloadB64)
    .digest("base64url");
}

export function createAdminSessionToken(label = "admin"): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = JSON.stringify({ sub: label, exp });
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  const signature = signPayload(payloadB64);
  return `${payloadB64}.${signature}`;
}

export function verifyAdminSessionToken(
  token: string | undefined | null,
): { sub: string; exp: number } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, providedSig] = parts;
  if (!payloadB64 || !providedSig) return null;

  try {
    const expectedSig = signPayload(payloadB64);
    const a = Buffer.from(providedSig, "utf8");
    const b = Buffer.from(expectedSig, "utf8");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }

    const parsed = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as { sub?: string; exp?: number };
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return { sub: parsed.sub || "admin", exp: parsed.exp };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<{
  sub: string;
  exp: number;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

export function getAdminCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    name: ADMIN_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

