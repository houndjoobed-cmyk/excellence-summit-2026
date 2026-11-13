import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/db";
import { isAdminAuthConfigured } from "@/lib/auth";
import { getEmailProvider, isEmailConfigured } from "@/lib/email";
import { isRealtimeConfigured } from "@/lib/realtime-server";
import { isSessionSecretConfigured } from "@/lib/site";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

export async function GET() {
  const dbConfigured = isDatabaseConfigured();
  const emailConfigured = isEmailConfigured();
  const emailProvider = getEmailProvider();
  const realtimeConfigured = isRealtimeConfigured();
  const adminConfigured = isAdminAuthConfigured();
  const sessionSecretConfigured = isSessionSecretConfigured();

  if (!dbConfigured) {
    return NextResponse.json(
      {
        status: "setup_required",
        database: false,
        emailConfigured,
        emailProvider,
        realtimeConfigured,
        adminConfigured,
        sessionSecretConfigured,
      },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  }

  try {
    const db = getDb();
    await db.execute(sql`SELECT 1`);
    return NextResponse.json(
      {
        status: "ok",
        database: true,
        emailConfigured,
        emailProvider,
        realtimeConfigured,
        adminConfigured,
        sessionSecretConfigured,
      },
      { headers: NO_STORE_HEADERS },
    );
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        database: false,
        emailConfigured,
        emailProvider,
        realtimeConfigured,
        adminConfigured,
        sessionSecretConfigured,
      },
      { status: 503, headers: NO_STORE_HEADERS },
    );
  }
}

