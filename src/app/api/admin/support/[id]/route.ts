import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/db";
import { supportMessages } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { uuidParamSchema } from "@/lib/site";
import { updateSupportStatusSchema } from "@/lib/validation";

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

  const parsed = updateSupportStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Statut invalide." } },
      { status: 422 },
    );
  }

  const db = getDb();
  const [updated] = await db
    .update(supportMessages)
    .set({ status: parsed.data.status })
    .where(eq(supportMessages.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Message introuvable." } },
      { status: 404 },
    );
  }

  return NextResponse.json({ message: updated });
}

