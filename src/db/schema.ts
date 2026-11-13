import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Stores masterclass registrations for Excellence Summit 2026.
 * Each confirmed registration receives a unique ES26-XXXXXX code and signed qrToken.
 */
export const registrations = pgTable(
  "registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    badgeCode: varchar("badge_code", { length: 20 }).notNull(),
    qrToken: varchar("qr_token", { length: 96 }).notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    country: varchar("country", { length: 100 }).notNull().default("Bénin"),
    roleTitle: varchar("role_title", { length: 150 }).notNull(),
    domain: varchar("domain", { length: 100 }).notNull(),
    organization: varchar("organization", { length: 160 }),
    preferredSpeakers: jsonb("preferred_speakers")
      .$type<string[]>()
      .notNull()
      .default([]),
    preferredTimeSlot: varchar("preferred_time_slot", { length: 50 })
      .notNull()
      .default("all"),
    attendingSunday: boolean("attending_sunday").notNull().default(true),
    expectations: text("expectations").notNull(),
    referralSource: varchar("referral_source", { length: 100 }).notNull(),
    locale: varchar("locale", { length: 5 }).notNull().default("fr"),
    status: varchar("status", { length: 20 }).notNull().default("confirmed"),
    emailSent: boolean("email_sent").notNull().default(false),
    emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("registrations_badge_code_idx").on(table.badgeCode),
    uniqueIndex("registrations_qr_token_idx").on(table.qrToken),
    uniqueIndex("registrations_email_idx").on(table.email),
    index("registrations_phone_idx").on(table.phone),
    index("registrations_status_idx").on(table.status),
    index("registrations_created_at_idx").on(table.createdAt),
  ],
);

/**
 * Tracks individual attendance scans per convention day/session.
 * A unique constraint on (registrationId, sessionKey) ensures idempotent check-ins.
 */
export const checkIns = pgTable(
  "check_ins",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    registrationId: uuid("registration_id")
      .notNull()
      .references(() => registrations.id, { onDelete: "cascade" }),
    sessionKey: varchar("session_key", { length: 60 }).notNull(),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    checkedInBy: varchar("checked_in_by", { length: 100 })
      .notNull()
      .default("admin"),
    method: varchar("method", { length: 20 }).notNull().default("qr"),
  },
  (table) => [
    uniqueIndex("check_ins_registration_session_idx").on(
      table.registrationId,
      table.sessionKey,
    ),
    index("check_ins_session_key_idx").on(table.sessionKey),
  ],
);

/**
 * Stores questions submitted from the floating support/help widget.
 */
export const supportMessages = pgTable(
  "support_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    message: text("message").notNull(),
    locale: varchar("locale", { length: 5 }).notNull().default("fr"),
    status: varchar("status", { length: 20 }).notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("support_messages_status_idx").on(table.status)],
);

export type RegistrationRecord = typeof registrations.$inferSelect;
export type NewRegistrationRecord = typeof registrations.$inferInsert;
export type CheckInRecord = typeof checkIns.$inferSelect;
export type SupportMessageRecord = typeof supportMessages.$inferSelect;

