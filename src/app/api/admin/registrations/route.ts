import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { CONVENTION_SESSIONS } from "@/data/event";
import { getDb, isDatabaseConfigured } from "@/db";
import { checkIns, registrations, supportMessages } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentification requise." } },
      { status: 401 },
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error: {
          code: "DB_NOT_CONFIGURED",
          message:
            "Base de données Neon non configurée (DATABASE_URL manquante dans .env.local).",
        },
      },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";
  const statusFilter = searchParams.get("status")?.trim() || "all";
  const speakerFilter = searchParams.get("speaker")?.trim() || "all";
  const sessionFilter = searchParams.get("session")?.trim() || "all";
  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize") || "25") || 25),
  );

  const db = getDb();

  try {
    const [allRegistrations, allCheckIns, allSupport] = await Promise.all([
      db.select().from(registrations).orderBy(desc(registrations.createdAt)),
      db.select().from(checkIns).orderBy(desc(checkIns.checkedInAt)),
      db.select().from(supportMessages).orderBy(desc(supportMessages.createdAt)),
    ]);

    const checkInsByReg = new Map<
      string,
      { sessionKey: string; checkedInAt: Date; method: string }[]
    >();
    const sessionCounts: Record<string, number> = {};
    for (const s of CONVENTION_SESSIONS) sessionCounts[s.key] = 0;

    for (const ci of allCheckIns) {
      const list = checkInsByReg.get(ci.registrationId) || [];
      list.push({
        sessionKey: ci.sessionKey,
        checkedInAt: ci.checkedInAt,
        method: ci.method,
      });
      checkInsByReg.set(ci.registrationId, list);
      sessionCounts[ci.sessionKey] = (sessionCounts[ci.sessionKey] || 0) + 1;
    }

    const confirmedCount = allRegistrations.filter(
      (r) => r.status === "confirmed",
    ).length;
    const cancelledCount = allRegistrations.filter(
      (r) => r.status === "cancelled",
    ).length;
    const sundayCount = allRegistrations.filter(
      (r) => r.status === "confirmed" && r.attendingSunday,
    ).length;
    const uniqueCheckedInAttendees = checkInsByReg.size;

    const lowerQ = query.toLowerCase();
    const filtered = allRegistrations.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (
        speakerFilter !== "all" &&
        !(r.preferredSpeakers || []).includes(speakerFilter)
      ) {
        return false;
      }
      if (sessionFilter !== "all") {
        const regCheckIns = checkInsByReg.get(r.id) || [];
        if (!regCheckIns.some((c) => c.sessionKey === sessionFilter)) {
          return false;
        }
      }
      if (lowerQ) {
        const haystack = [
          r.badgeCode,
          r.firstName,
          r.lastName,
          `${r.firstName} ${r.lastName}`,
          r.email,
          r.phone,
          r.city,
          r.organization || "",
          r.roleTitle,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(lowerQ)) return false;
      }
      return true;
    });

    const totalFiltered = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
    const safePage = Math.min(page, totalPages);
    const slice = filtered.slice(
      (safePage - 1) * pageSize,
      safePage * pageSize,
    );

    const items = slice.map((r) => ({
      ...r,
      checkIns: checkInsByReg.get(r.id) || [],
    }));

    return NextResponse.json({
      stats: {
        totalRegistrations: allRegistrations.length,
        confirmedCount,
        cancelledCount,
        sundayCount,
        totalCheckIns: allCheckIns.length,
        uniqueCheckedInAttendees,
        openSupportCount: allSupport.filter((m) => m.status === "new").length,
        sessionCounts,
      },
      registrations: items,
      pagination: {
        page: safePage,
        pageSize,
        totalItems: totalFiltered,
        totalPages,
      },
      supportMessages: allSupport,
    });
  } catch (err) {
    console.error("[GET /api/admin/registrations] error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Erreur serveur Neon." } },
      { status: 500 },
    );
  }
}
