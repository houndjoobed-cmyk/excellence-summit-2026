import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/db";
import { checkIns, registrations } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { parseScannedPayload } from "@/lib/badge";
import { verifyCheckInSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentification requise." } },
      { status: 401 },
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: { code: "DB_NOT_CONFIGURED", message: "Neon non configuré." } },
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

  const parsed = verifyCheckInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Code QR ou session invalide.",
        },
      },
      { status: 422 },
    );
  }

  const { codeOrToken, sessionKey, method, commit } = parsed.data;
  const payload = parseScannedPayload(codeOrToken);
  const db = getDb();

  let matched: typeof registrations.$inferSelect | undefined;

  if (payload.qrToken) {
    const rows = await db
      .select()
      .from(registrations)
      .where(eq(registrations.qrToken, payload.qrToken))
      .limit(1);
    matched = rows[0];
  }

  if (!matched && payload.badgeCode) {
    const rows = await db
      .select()
      .from(registrations)
      .where(eq(registrations.badgeCode, payload.badgeCode))
      .limit(1);
    matched = rows[0];
  }

  if (!matched) {
    return NextResponse.json(
      {
        outcome: "not_found",
        message: "Aucun badge correspondant trouvé dans la base Neon.",
      },
      { status: 404 },
    );
  }

  const history = await db
    .select()
    .from(checkIns)
    .where(eq(checkIns.registrationId, matched.id))
    .orderBy(desc(checkIns.checkedInAt));

  if (matched.status === "cancelled") {
    return NextResponse.json({
      outcome: "cancelled",
      message: "Ce badge a été annulé. L'accès ne doit pas être validé.",
      registration: matched,
      sessionHistory: history,
    });
  }

  const existingForSession = history.find((h) => h.sessionKey === sessionKey);
  if (existingForSession) {
    return NextResponse.json({
      outcome: "already_checked_in",
      message: "Ce badge a déjà été pointé sur cette session.",
      registration: matched,
      checkIn: existingForSession,
      sessionHistory: history,
    });
  }

  if (!commit) {
    return NextResponse.json({
      outcome: "valid_preview",
      message: "Badge valide et prêt pour le pointage sur cette session.",
      registration: matched,
      sessionHistory: history,
    });
  }

  // Idempotent insert with conflict guard
  const [inserted] = await db
    .insert(checkIns)
    .values({
      registrationId: matched.id,
      sessionKey,
      checkedInBy: session.sub,
      method,
    })
    .onConflictDoNothing()
    .returning();

  if (!inserted) {
    const [existingAfterRace] = await db
      .select()
      .from(checkIns)
      .where(
        and(
          eq(checkIns.registrationId, matched.id),
          eq(checkIns.sessionKey, sessionKey),
        ),
      )
      .limit(1);
    return NextResponse.json({
      outcome: "already_checked_in",
      message: "Ce badge vient déjà d'être pointé sur cette session.",
      registration: matched,
      checkIn: existingAfterRace,
      sessionHistory: history,
    });
  }

  return NextResponse.json({
    outcome: "checked_in",
    message: "Pointage validé avec succès !",
    registration: matched,
    checkIn: inserted,
    sessionHistory: [inserted, ...history],
  });
}

