import crypto from "node:crypto";
import QRCode from "qrcode";
import {
  getPublicSiteOrigin,
  getRequiredSigningSecret,
  resolveRequestOrigin,
} from "@/lib/site";

export { resolveRequestOrigin };

/** Unambiguous uppercase alphanumeric alphabet (omits 0, O, 1, I, L). */
const BADGE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const BADGE_PREFIX = "ES26-";

/**
 * Generates an unambiguous registration number like ES26-7K9P2M.
 */
export function generateBadgeCode(): string {
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    const idx = crypto.randomInt(0, BADGE_ALPHABET.length);
    code += BADGE_ALPHABET[idx];
  }
  return `${BADGE_PREFIX}${code}`;
}

/**
 * Generates an HMAC-signed verification token tied to the badgeCode.
 */
export function generateQrToken(badgeCode: string): string {
  const nonce = crypto.randomBytes(8).toString("hex");
  const sig = crypto
    .createHmac("sha256", getRequiredSigningSecret())
    .update(`${badgeCode}:${nonce}`)
    .digest("hex")
    .slice(0, 24);
  return `${nonce}.${sig}`;
}

/**
 * Verifies an HMAC-signed qrToken against its badgeCode in constant time.
 */
export function verifyQrToken(badgeCode: string, token: string): boolean {
  const cleanedCode = badgeCode.trim().toUpperCase();
  const cleanedToken = token.trim().toLowerCase();
  if (!/^ES26-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(cleanedCode)) {
    return false;
  }
  if (!/^[a-f0-9]{16}\.[a-f0-9]{24}$/.test(cleanedToken)) {
    return false;
  }

  const [nonce, providedSig] = cleanedToken.split(".");
  if (!nonce || !providedSig) return false;

  let secret: string;
  try {
    secret = getRequiredSigningSecret();
  } catch {
    return false;
  }

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(`${cleanedCode}:${nonce}`)
    .digest("hex")
    .slice(0, 24);

  const a = Buffer.from(providedSig, "utf8");
  const b = Buffer.from(expectedSig, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Builds the canonical URL encoded inside each attendee's QR code.
 */
export function buildQrVerificationUrl(
  badgeCode: string,
  qrToken: string,
  baseUrl?: string,
): string {
  const origin = (baseUrl || getPublicSiteOrigin()).replace(/\/$/, "");
  const params = new URLSearchParams({
    code: badgeCode,
    t: qrToken,
  });
  return `${origin}/badge?${params.toString()}`;
}

/**
 * Builds the HTTPS PNG image URL used by external email clients (Brevo/Gmail/Outlook).
 */
export function buildQrImageUrl(
  badgeCode: string,
  qrToken: string,
  baseUrl?: string,
): string {
  const origin = (baseUrl || getPublicSiteOrigin()).replace(/\/$/, "");
  const params = new URLSearchParams({
    code: badgeCode,
    t: qrToken,
  });
  return `${origin}/api/badges/qr?${params.toString()}`;
}

/**
 * Extracts either a badgeCode (ES26-XXXXXX) or qrToken from raw scanner text,
 * whether the scanner read the full verification URL, a bare code, or raw token.
 */
export function parseScannedPayload(raw: string): {
  badgeCode?: string;
  qrToken?: string;
  normalizedQuery: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { normalizedQuery: "" };
  }

  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const url = new URL(trimmed);
      const code = url.searchParams.get("code")?.trim().toUpperCase();
      const token = url.searchParams.get("t")?.trim();
      if (code || token) {
        return {
          badgeCode: code || undefined,
          qrToken: token || undefined,
          normalizedQuery: code || token || trimmed,
        };
      }
    }
  } catch {
    // Fall through to pattern matching if URL parsing fails.
  }

  const upper = trimmed.toUpperCase();
  if (/^ES26-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(upper)) {
    return { badgeCode: upper, normalizedQuery: upper };
  }
  if (/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(upper)) {
    const withPrefix = `${BADGE_PREFIX}${upper}`;
    return { badgeCode: withPrefix, normalizedQuery: withPrefix };
  }
  if (/^[a-f0-9]{16}\.[a-f0-9]{24}$/i.test(trimmed)) {
    return { qrToken: trimmed, normalizedQuery: trimmed };
  }

  return { normalizedQuery: trimmed };
}

/**
 * Generates a crisp high-contrast PNG data URL & raw Buffer for QR code rendering/emailing.
 */
export async function generateQrCodePngBuffer(payload: string): Promise<Buffer> {
  return QRCode.toBuffer(payload, {
    type: "png",
    width: 360,
    margin: 2,
    errorCorrectionLevel: "M",
    color: {
      dark: "#041247",
      light: "#FFFFFF",
    },
  });
}

export async function generateQrCodeDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    width: 360,
    margin: 2,
    errorCorrectionLevel: "M",
    color: {
      dark: "#041247",
      light: "#FFFFFF",
    },
  });
}

