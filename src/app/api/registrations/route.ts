import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/db";
import { registrations } from "@/db/schema";
import {
  buildQrVerificationUrl,
  generateBadgeCode,
  generateQrCodeDataUrl,
  generateQrToken,
  resolveRequestOrigin,
} from "@/lib/badge";
import { sendBadgeEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isSessionSecretConfigured } from "@/lib/site";
import { registrationSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`register:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: "Trop de tentatives. Veuillez réessayer dans quelques minutes.",
        },
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error: {
          code: "DB_NOT_CONFIGURED",
          message:
            "Base de données Neon non configurée (DATABASE_URL manquante).",
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
          message:
            "Configuration de signature serveur manquante (ADMIN_SESSION_SECRET).",
        },
      },
      { status: 503 },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_JSON",
          message: "Requête JSON invalide.",
        },
      },
      { status: 400 },
    );
  }

  const parsed = registrationSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Certains champs sont invalides ou incomplets.",
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            code: i.message,
          })),
        },
      },
      { status: 422 },
    );
  }

  const input = parsed.data;
  const db = getDb();

  try {
    const existing = await db
      .select({ id: registrations.id })
      .from(registrations)
      .where(eq(registrations.email, input.email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "DUPLICATE_EMAIL",
            message:
              "Cette adresse e-mail est déjà enregistrée. Utilisez la page Mon Badge pour le retrouver.",
          },
        },
        { status: 409 },
      );
    }

    let createdRecord: typeof registrations.$inferSelect | null = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const badgeCode = generateBadgeCode();
      const qrToken = generateQrToken(badgeCode);
      try {
        const [inserted] = await db
          .insert(registrations)
          .values({
            badgeCode,
            qrToken,
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            city: input.city,
            country: input.country,
            roleTitle: input.roleTitle,
            domain: input.domain,
            organization: input.organization || null,
            preferredSpeakers: input.preferredSpeakers,
            preferredTimeSlot: input.preferredTimeSlot,
            attendingSunday: input.attendingSunday,
            expectations: input.expectations,
            referralSource: input.referralSource,
            locale: input.locale,
            status: "confirmed",
          })
          .returning();
        createdRecord = inserted;
        break;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("registrations_email_idx")) {
          return NextResponse.json(
            {
              error: {
                code: "DUPLICATE_EMAIL",
                message:
                  "Cette adresse e-mail est déjà enregistrée. Utilisez la page Mon Badge pour le retrouver.",
              },
            },
            { status: 409 },
          );
        }
        if (attempt === 4) throw err;
      }
    }

    if (!createdRecord) {
      throw new Error("Could not allocate unique badge code");
    }

    const origin = resolveRequestOrigin(request);
    const qrPayload = buildQrVerificationUrl(
      createdRecord.badgeCode,
      createdRecord.qrToken,
      origin,
    );
    const qrDataUrl = await generateQrCodeDataUrl(qrPayload);

    const emailResult = await sendBadgeEmail({
      to: createdRecord.email,
      firstName: createdRecord.firstName,
      lastName: createdRecord.lastName,
      badgeCode: createdRecord.badgeCode,
      qrToken: createdRecord.qrToken,
      locale: input.locale,
      baseUrl: origin,
    });

    if (emailResult.sent) {
      await db
        .update(registrations)
        .set({ emailSent: true, emailSentAt: new Date() })
        .where(eq(registrations.id, createdRecord.id));
    }

    return NextResponse.json(
      {
        registration: {
          id: createdRecord.id,
          badgeCode: createdRecord.badgeCode,
          firstName: createdRecord.firstName,
          lastName: createdRecord.lastName,
          city: createdRecord.city,
          country: createdRecord.country,
          roleTitle: createdRecord.roleTitle,
          preferredSpeakers: createdRecord.preferredSpeakers,
          preferredTimeSlot: createdRecord.preferredTimeSlot,
          attendingSunday: createdRecord.attendingSunday,
          status: createdRecord.status,
          createdAt: createdRecord.createdAt,
          emailSent: emailResult.sent,
          qrPayload,
          qrDataUrl,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/registrations] unexpected error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Impossible d'enregistrer votre inscription pour le moment.",
        },
      },
      { status: 500 },
    );
  }
}

