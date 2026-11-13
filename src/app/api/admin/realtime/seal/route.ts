import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  sealDashboardQuery,
  type LiveQueryKind,
} from "@/lib/realtime-queries";

const VALID_KINDS = new Set<LiveQueryKind>([
  "registrations",
  "checkIns",
  "supportMessages",
]);

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentification requise." } },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  let body: { kind?: unknown } | null = null;
  try {
    body = (await request.json()) as { kind?: unknown };
  } catch {
    body = null;
  }

  const kind = typeof body?.kind === "string" ? body.kind : "";
  if (!VALID_KINDS.has(kind as LiveQueryKind)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Type de requête invalide." } },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const sealed = await sealDashboardQuery(kind as LiveQueryKind);
    if (!sealed) {
      return NextResponse.json(
        {
          error: {
            code: "REALTIME_NOT_CONFIGURED",
            message: "Neon Realtime non configuré.",
          },
        },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(sealed, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[POST /api/admin/realtime/seal] error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Impossible de renouveler la requête Neon Realtime.",
        },
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
