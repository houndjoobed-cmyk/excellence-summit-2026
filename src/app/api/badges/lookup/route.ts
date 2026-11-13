import { desc, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/db";
import { checkIns, registrations } from "@/db/schema";
import {
  buildQrVerificationUrl,
  generateQrCodeDataUrl,
  parseScannedPayload,
  resolveRequestOrigin,
} from "@/lib/badge";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isSessionSecretConfigured } from "@/lib/site";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`lookup:${ip}`, 30, 5 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: "Trop de requêtes. Patientez quelques instants.",
        },
      },
      { status: 429 },
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error: {
          code: "DB_NOT_CONFIGURED",
          message: "Base de données Neon non configurée.",
        },
      },
      { status: 503 },
    );
  }
  if (!isSessionSecretConfigured()) {
    return NextResponse.json(
      {
        error: {
          code: "SIGNING_NOT_CONFIGURED",
          message: "Configuration de signature serveur manquante.",
        },
      },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const rawQuery = (searchParams.get("query") || searchParams.get("code") || "").trim();
  const tokenParam = searchParams.get("t")?.trim() || "";

  if (rawQuery.length < 4 && !tokenParam) {
    return NextResponse.json(
      {
        error: {
          code: "QUERY_TOO_SHORT",
          message: "Saisissez au moins 4 caractères.",
        },
      },
      { status: 400 },
    );
  }

  const db = getDb();
  const parsed = parseScannedPayload(rawQuery);
  const lowerQuery = rawQuery.toLowerCase();
  const compactPhone = rawQuery.replace(/[\s()-]/g, "");

  try {
    let matches: (typeof registrations.$inferSelect)[] = [];

    if (tokenParam) {
      matches = await db
        .select()
        .from(registrations)
        .where(eq(registrations.qrToken, tokenParam))
        .limit(1);
    } else if (parsed.badgeCode) {
      matches = await db
        .select()
        .from(registrations)
        .where(eq(registrations.badgeCode, parsed.badgeCode))
        .limit(1);
    } else if (parsed.qrToken) {
      matches = await db
        .select()
        .from(registrations)
        .where(eq(registrations.qrToken, parsed.qrToken))
        .limit(1);
    } else {
      matches = await db
        .select()
        .from(registrations)
        .where(
          or(
            eq(registrations.email, lowerQuery),
            eq(registrations.phone, rawQuery),
            eq(registrations.phone, compactPhone),
          ),
        )
        .limit(1);
    }

    const record = matches[0];
    if (!record) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Aucun badge correspondant trouvé.",
          },
        },
        { status: 404 },
      );
    }

    const history = await db
      .select({
        sessionKey: checkIns.sessionKey,
        checkedInAt: checkIns.checkedInAt,
        method: checkIns.method,
      })
      .from(checkIns)
      .where(eq(checkIns.registrationId, record.id))
      .orderBy(desc(checkIns.checkedInAt));

    const qrPayload = buildQrVerificationUrl(
      record.badgeCode,
      record.qrToken,
      resolveRequestOrigin(request),
    );
    const qrDataUrl = await generateQrCodeDataUrl(qrPayload);

    return NextResponse.json({
      badge: {
        badgeCode: record.badgeCode,
        firstName: record.firstName,
        lastName: record.lastName,
        city: record.city,
        country: record.country,
        roleTitle: record.roleTitle,
        preferredSpeakers: record.preferredSpeakers,
        preferredTimeSlot: record.preferredTimeSlot,
        attendingSunday: record.attendingSunday,
        status: record.status,
        createdAt: record.createdAt,
        verifiedByToken: Boolean(tokenParam && tokenParam === record.qrToken),
        qrPayload,
        qrDataUrl,
        checkIns: history,
      },
    });
  } catch (err) {
    console.error("[GET /api/badges/lookup] error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Erreur lors de la recherche du badge.",
        },
      },
      { status: 500 },
    );
  }
}

