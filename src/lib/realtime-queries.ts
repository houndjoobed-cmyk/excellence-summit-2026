import "server-only";

import type { SealedLiveQuery } from "@neon/realtime";
import { desc } from "drizzle-orm";
import { getDb, isDatabaseConfigured, type DbClient } from "@/db";
import { checkIns, registrations, supportMessages } from "@/db/schema";
import type {
  DashboardLiveBundle,
  LiveCheckInRow,
  LiveRegistrationRow,
  LiveSupportMessageRow,
} from "@/lib/dashboard-snapshot";
import {
  getRealtimeServer,
  isRealtimeConfigured,
} from "@/lib/realtime-server";

export type LiveQueryKind = "registrations" | "checkIns" | "supportMessages";

export function liveRegistrationsQuery(db: DbClient) {
  // Select explicit snake_case keys matching PostgreSQL column names (required by drizzleAdapter),
  // intentionally excluding server-only qr_token and unused timestamps.
  return db
    .select({
      id: registrations.id,
      badge_code: registrations.badgeCode,
      first_name: registrations.firstName,
      last_name: registrations.lastName,
      email: registrations.email,
      phone: registrations.phone,
      city: registrations.city,
      country: registrations.country,
      role_title: registrations.roleTitle,
      domain: registrations.domain,
      organization: registrations.organization,
      preferred_speakers: registrations.preferredSpeakers,
      preferred_time_slot: registrations.preferredTimeSlot,
      attending_sunday: registrations.attendingSunday,
      expectations: registrations.expectations,
      referral_source: registrations.referralSource,
      locale: registrations.locale,
      status: registrations.status,
      email_sent: registrations.emailSent,
      created_at: registrations.createdAt,
    })
    .from(registrations)
    .orderBy(desc(registrations.createdAt));
}

export function liveCheckInsQuery(db: DbClient) {
  return db
    .select({
      id: checkIns.id,
      registration_id: checkIns.registrationId,
      session_key: checkIns.sessionKey,
      checked_in_at: checkIns.checkedInAt,
      method: checkIns.method,
    })
    .from(checkIns)
    .orderBy(desc(checkIns.checkedInAt));
}

export function liveSupportMessagesQuery(db: DbClient) {
  return db
    .select({
      id: supportMessages.id,
      name: supportMessages.name,
      email: supportMessages.email,
      phone: supportMessages.phone,
      message: supportMessages.message,
      locale: supportMessages.locale,
      status: supportMessages.status,
      created_at: supportMessages.createdAt,
    })
    .from(supportMessages)
    .orderBy(desc(supportMessages.createdAt));
}

export async function sealDashboardQuery(
  kind: LiveQueryKind,
): Promise<SealedLiveQuery<unknown> | null> {
  const realtime = getRealtimeServer();
  if (!realtime || !isDatabaseConfigured()) {
    return null;
  }

  const db = getDb();
  switch (kind) {
    case "registrations":
      return realtime.seal({ query: liveRegistrationsQuery(db) });
    case "checkIns":
      return realtime.seal({ query: liveCheckInsQuery(db) });
    case "supportMessages":
      return realtime.seal({ query: liveSupportMessagesQuery(db) });
  }
}

export async function loadDashboardLiveBundle(): Promise<DashboardLiveBundle | null> {
  const realtime = getRealtimeServer();
  if (!realtime || !isRealtimeConfigured() || !isDatabaseConfigured()) {
    return null;
  }

  try {
    const db = getDb();
    const regQuery = liveRegistrationsQuery(db);
    const checkInQuery = liveCheckInsQuery(db);
    const supportQuery = liveSupportMessagesQuery(db);

    const [
      regRows,
      sealedReg,
      checkInRows,
      sealedCheckIn,
      supportRows,
      sealedSupport,
    ] = await Promise.all([
      regQuery,
      realtime.seal({ query: regQuery }),
      checkInQuery,
      realtime.seal({ query: checkInQuery }),
      supportQuery,
      realtime.seal({ query: supportQuery }),
    ]);

    return {
      registrations: {
        initialData: regRows,
        sealedQuery: sealedReg as SealedLiveQuery<LiveRegistrationRow>,
      },
      checkIns: {
        initialData: checkInRows,
        sealedQuery: sealedCheckIn as SealedLiveQuery<LiveCheckInRow>,
      },
      supportMessages: {
        initialData: supportRows,
        sealedQuery: sealedSupport as SealedLiveQuery<LiveSupportMessageRow>,
      },
    };
  } catch (err) {
    console.error("[loadDashboardLiveBundle] failed:", err);
    return null;
  }
}
