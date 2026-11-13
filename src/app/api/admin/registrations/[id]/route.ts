import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { Locale } from "@/data/event";
import { getDb, isDatabaseConfigured } from "@/db";
import { registrations } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { resolveRequestOrigin } from "@/lib/badge";
import { sendBadgeEmail } from "@/lib/email";
import { uuidParamSchema } from "@/lib/site";
import { updateRegistrationStatusSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
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

  const { id } = await context.params;
  if (!uuidParamSchema.safeParse(id).success) {
    return NextResponse.json(
      { error: { code: "INVALID_ID", message: "Identifiant invalide." } },
      { status: 400 },
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

  const parsed = updateRegistrationStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Données invalides." } },
      { status: 422 },
    );
  }

  const db = getDb();
  const [existing] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Inscription introuvable." } },
      { status: 404 },
    );
  }

  let updated = existing;

  if (parsed.data.status && parsed.data.status !== existing.status) {
    const [row] = await db
      .update(registrations)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(registrations.id, id))
      .returning();
    updated = row;
  }

  let emailResult: { sent: boolean; reason?: string } | undefined;
  if (parsed.data.resendEmail) {
    emailResult = await sendBadgeEmail({
      to: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      badgeCode: updated.badgeCode,
      qrToken: updated.qrToken,
      locale: (updated.locale === "en" ? "en" : "fr") as Locale,
      baseUrl: resolveRequestOrigin(request),
    });
    if (emailResult.sent) {
      const [row] = await db
        .update(registrations)
        .set({
          emailSent: true,
          emailSentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(registrations.id, id))
        .returning();
      updated = row;
    }
  }

  return NextResponse.json({ registration: updated, emailResult });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
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

  const { id } = await context.params;
  if (!uuidParamSchema.safeParse(id).success) {
    return NextResponse.json(
      { error: { code: "INVALID_ID", message: "Identifiant invalide." } },
      { status: 400 },
    );
  }
  const db = getDb();
  const deleted = await db
    .delete(registrations)
    .where(eq(registrations.id, id))
    .returning({ id: registrations.id });

  if (deleted.length === 0) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Inscription introuvable." } },
      { status: 404 },
    );
  }

  return NextResponse.json({ deletedId: id });
}

