import { z } from "zod";

const DEV_FALLBACK_SIGNING_SECRET =
  "dev-excellence-summit-2026-hmac-secret-change-in-production";

const KNOWN_PLACEHOLDER_SECRETS = new Set([
  "change-me-strong-password",
  "replace-with-at-least-32-random-characters-for-hmac-signing",
  DEV_FALLBACK_SIGNING_SECRET,
  "dev-excellence-summit-2026-fallback-signing-key",
]);

const SAFE_HOST_HEADER_RE = /^[a-z0-9.-]+(:\d{1,5})?$/i;

export const uuidParamSchema = z.string().uuid();

export function isPlaceholderValue(value: string | undefined): boolean {
  const trimmed = value?.trim() || "";
  if (!trimmed) return true;
  if (KNOWN_PLACEHOLDER_SECRETS.has(trimmed)) return true;
  return /^(change-me|replace-with|your-|xxxxx)/i.test(trimmed);
}

/**
 * Checks whether ADMIN_SESSION_SECRET is usable for signing/verification.
 * In production, requires a non-placeholder secret of at least 32 characters.
 */
export function isSessionSecretConfigured(): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() || "";
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  return secret.length >= 32 && !isPlaceholderValue(secret);
}

/**
 * Returns the HMAC secret used for admin sessions and QR badge tokens.
 * Fails closed in production if the secret is missing, short, or left on an example placeholder.
 */
export function getRequiredSigningSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() || "";
  if (process.env.NODE_ENV === "production") {
    if (secret.length < 32 || isPlaceholderValue(secret)) {
      throw new Error(
        "ADMIN_SESSION_SECRET must be a random string of at least 32 characters in production.",
      );
    }
    return secret;
  }

  return secret || DEV_FALLBACK_SIGNING_SECRET;
}

function parseOriginCandidate(raw: string | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  try {
    const withScheme =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

function isLoopbackOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1"
    );
  } catch {
    return false;
  }
}

/**
 * Resolves the canonical public origin from environment configuration
 * (explicit NEXT_PUBLIC_SITE_URL or Vercel-provided deployment URLs).
 */
export function getPublicSiteOrigin(): string {
  const explicit = parseOriginCandidate(process.env.NEXT_PUBLIC_SITE_URL);
  const vercelProd = parseOriginCandidate(
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  );
  const vercelPreview = parseOriginCandidate(process.env.VERCEL_URL);

  if (process.env.NODE_ENV === "production") {
    if (explicit && !isLoopbackOrigin(explicit)) {
      return explicit;
    }
    if (vercelProd && process.env.VERCEL_ENV === "production") {
      return vercelProd;
    }
    if (vercelPreview) {
      return vercelPreview;
    }
    if (vercelProd) {
      return vercelProd;
    }
    if (explicit) {
      return explicit;
    }
    return "http://localhost:3000";
  }

  return explicit || vercelProd || vercelPreview || "http://localhost:3000";
}

/**
 * Resolves the canonical origin for an incoming HTTP request safely
 * without allowing Host / X-Forwarded-Host header injection in production emails.
 */
export function resolveRequestOrigin(request?: Request): string {
  const configuredExplicit = parseOriginCandidate(
    process.env.NEXT_PUBLIC_SITE_URL,
  );
  if (
    configuredExplicit &&
    (process.env.NODE_ENV !== "production" || !isLoopbackOrigin(configuredExplicit))
  ) {
    return configuredExplicit;
  }

  if (process.env.VERCEL_ENV === "production") {
    const vercelProd = parseOriginCandidate(
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
    );
    if (vercelProd) {
      return vercelProd;
    }
  }

  if (request) {
    const rawHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const rawProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
    const proto = rawProto === "http" ? "http" : "https";

    if (rawHost && SAFE_HOST_HEADER_RE.test(rawHost)) {
      return `${proto}://${rawHost}`;
    }

    try {
      return new URL(request.url).origin;
    } catch {
      // Fall through to environment-derived origin
    }
  }

  return getPublicSiteOrigin();
}

