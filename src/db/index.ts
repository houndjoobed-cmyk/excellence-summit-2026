import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let cachedDb: NeonHttpDatabase<typeof schema> | null = null;

/**
 * Returns whether a Neon Postgres connection string is configured.
 */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  return Boolean(url && url.startsWith("postgres"));
}

export function getNeonDatabaseName(): string {
  const rawUrl =
    process.env.DATABASE_URL?.trim() ||
    process.env.DATABASE_URL_UNPOOLED?.trim();
  if (!rawUrl) {
    return "neondb";
  }
  try {
    const parsed = new URL(rawUrl);
    const dbName = parsed.pathname.replace(/^\/+/, "").trim();
    return dbName || "neondb";
  } catch {
    return "neondb";
  }
}

export type DbClient = NeonHttpDatabase<typeof schema>;

/**
 * Lazily initializes and returns the Drizzle Neon HTTP client.
 * Deferring instantiation prevents build-time crashes when DATABASE_URL is absent.
 */
export function getDb(): DbClient {
  if (cachedDb) return cachedDb;

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is missing. Configure your Neon PostgreSQL URL in .env.local.",
    );
  }

  const sql = neon(databaseUrl);
  cachedDb = drizzle(sql, { schema });
  return cachedDb;
}

