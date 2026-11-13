import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getAdminCookieOptions,
  isAdminAuthConfigured,
  verifyAdminPassword,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { adminLoginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`admin-login:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: "Trop de tentatives de connexion. Patientez quelques minutes.",
        },
      },
      { status: 429 },
    );
  }

  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      {
        error: {
          code: "ADMIN_NOT_CONFIGURED",
          message:
            "ADMIN_PASSWORD ou ADMIN_SESSION_SECRET n'est pas configuré de manière sécurisée.",
        },
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "JSON invalide." } },
      { status: 400 },
    );
  }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success || !verifyAdminPassword(parsed.data.password)) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Mot de passe administrateur incorrect.",
        },
      },
      { status: 401 },
    );
  }

  const token = createAdminSessionToken("team-admin");
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set({
    ...getAdminCookieOptions(),
    value: token,
  });
  return response;
}

