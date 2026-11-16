import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/db";
import { checkIns, registrations } from "@/db/schema";
import { GUEST_SPEAKERS } from "@/data/speakers";
import { getAdminSession } from "@/lib/auth";

function csvCell(value: string | number | boolean | null | undefined): string {
  const raw = value === null || value === undefined ? "" : String(value);
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
}

export async function GET() {
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

  const db = getDb();
  const [allRegistrations, allCheckIns] = await Promise.all([
    db.select().from(registrations).orderBy(desc(registrations.createdAt)),
    db.select().from(checkIns),
  ]);

  const checkInsMap = new Map<string, string[]>();
  for (const ci of allCheckIns) {
    const arr = checkInsMap.get(ci.registrationId) || [];
    arr.push(ci.sessionKey);
    checkInsMap.set(ci.registrationId, arr);
  }

  const headers = [
    "Reference",
    "Prenom",
    "Nom",
    "Email",
    "Telephone",
    "Ville",
    "Pays",
    "Domaine",
    "Fonction",
    "Organisation",
    "Orateurs_Preferes",
    "Creneau_Prefere",
    "Culte_Majestic_Dimanche",
    "Statut",
    "Nb_Pointages",
    "Sessions_Pointees",
    "Email_Envoye",
    "Date_Inscription",
  ];

  const speakerMap = new Map(GUEST_SPEAKERS.map((s) => [s.id, s]));

  const rows = allRegistrations.map((r) => {
    const sessions = checkInsMap.get(r.id) || [];
    const preferredTracks = (r.preferredSpeakers || []).map((id) => {
      const sp = speakerMap.get(id);
      return sp ? `${sp.masterclassFocus.fr} (${sp.name})` : id;
    });
    return [
      r.badgeCode,
      r.firstName,
      r.lastName,
      r.email,
      r.phone,
      r.city,
      r.country,
      r.domain,
      r.roleTitle,
      r.organization || "",
      preferredTracks.join(" | "),
      r.preferredTimeSlot,
      r.attendingSunday ? "Oui" : "Non",
      r.status,
      sessions.length,
      sessions.join(" | "),
      r.emailSent ? "Oui" : "Non",
      r.createdAt.toISOString(),
    ]
      .map(csvCell)
      .join(",");
  });

  const csv = "\uFEFF" + [headers.map(csvCell).join(","), ...rows].join("\r\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="excellence-summit-2026-inscriptions.csv"`,
    },
  });
}

