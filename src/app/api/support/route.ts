import { NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/db";
import { supportMessages } from "@/db/schema";
import { sendSupportNotificationEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { supportMessageSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`support:${ip}`, 8, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: "Trop de messages envoyés. Patientez quelques minutes.",
        },
      },
      { status: 429 },
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

  const parsed = supportMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Veuillez compléter votre nom, e-mail et message.",
        },
      },
      { status: 422 },
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

  try {
    const db = getDb();
    const [saved] = await db
      .insert(supportMessages)
      .values({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        message: parsed.data.message,
        locale: parsed.data.locale,
      })
      .returning({ id: supportMessages.id, createdAt: supportMessages.createdAt });

    let emailSent = false;
    let emailReason: string | undefined;
    try {
      const emailResult = await sendSupportNotificationEmail({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        message: parsed.data.message,
        locale: parsed.data.locale,
      });
      emailSent = emailResult.sent;
      emailReason = emailResult.reason;
      if (!emailResult.sent) {
        console.warn("[POST /api/support] Email notification skipped/failed:", {
          reason: emailResult.reason,
          detail: emailResult.detail,
        });
      }
    } catch (emailErr) {
      console.error("[POST /api/support] Unexpected email error:", emailErr);
    }

    return NextResponse.json(
      { message: saved, emailSent, emailReason },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/support] error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Erreur serveur." } },
      { status: 500 },
    );
  }
}

