import "server-only";

import { createRealtime } from "@neon/realtime/server";
import { drizzleAdapter } from "@neon/realtime-drizzle";
import { getNeonDatabaseName, isDatabaseConfigured } from "@/db";

function createSummitRealtime(secret: string) {
  return createRealtime({
    secret,
    db: getNeonDatabaseName(),
    adapter: drizzleAdapter(),
    debugMode: process.env.NODE_ENV !== "production",
  });
}

export type SummitRealtimeServer = ReturnType<typeof createSummitRealtime>;

let cachedRealtime: SummitRealtimeServer | null = null;

export function getPublicRealtimeUrl(): string | null {
  const url =
    process.env.NEXT_PUBLIC_NEON_REALTIME_URL?.trim() ||
    process.env.NEON_REALTIME_URL?.trim();
  if (!url) {
    return null;
  }
  return url;
}

export function isRealtimeConfigured(): boolean {
  const secret = process.env.NEON_REALTIME_SECRET?.trim();
  const publicUrl = getPublicRealtimeUrl();
  return Boolean(secret && publicUrl && isDatabaseConfigured());
}

export function getRealtimeServer(): SummitRealtimeServer | null {
  const secret = process.env.NEON_REALTIME_SECRET?.trim();
  if (!secret || !isRealtimeConfigured()) {
    return null;
  }

  if (!cachedRealtime) {
    cachedRealtime = createSummitRealtime(secret);
  }

  return cachedRealtime;
}
