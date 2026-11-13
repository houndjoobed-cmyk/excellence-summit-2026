import { z } from "zod";
import { CONVENTION_SESSIONS } from "@/data/event";
import { GUEST_SPEAKERS } from "@/data/speakers";

const speakerIds = GUEST_SPEAKERS.map((s) => s.id);
const sessionKeys = CONVENTION_SESSIONS.map((s) => s.key);

export const registrationSchema = z.object({
  firstName: z.string().trim().min(2, "FIRST_NAME_MIN").max(100),
  lastName: z.string().trim().min(2, "LAST_NAME_MIN").max(100),
  email: z.string().trim().toLowerCase().email("EMAIL_INVALID").max(255),
  phone: z
    .string()
    .trim()
    .min(8, "PHONE_INVALID")
    .max(40)
    .regex(/^[+\d\s()-]{8,40}$/, "PHONE_INVALID"),
  city: z.string().trim().min(2, "CITY_REQUIRED").max(120),
  country: z.string().trim().min(2, "COUNTRY_REQUIRED").max(100).default("Bénin"),
  roleTitle: z.string().trim().min(2, "ROLE_REQUIRED").max(150),
  domain: z.string().trim().min(2, "DOMAIN_REQUIRED").max(100),
  organization: z.string().trim().max(160).optional().default(""),
  preferredSpeakers: z
    .array(z.string())
    .default([])
    .transform((items) => items.filter((id) => speakerIds.includes(id))),
  preferredTimeSlot: z.enum(["all", "morning", "evening"]).default("all"),
  attendingSunday: z.boolean().default(true),
  expectations: z.string().trim().min(15, "EXPECTATIONS_MIN").max(1500),
  referralSource: z.string().trim().min(2, "REFERRAL_REQUIRED").max(100),
  locale: z.enum(["fr", "en"]).default("fr"),
  acceptedCommitment: z.literal(true, {
    error: "COMMITMENT_REQUIRED",
  }),
  acceptedPrivacy: z.literal(true, {
    error: "PRIVACY_REQUIRED",
  }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const supportMessageSchema = z.object({
  name: z.string().trim().min(2, "NAME_REQUIRED").max(120),
  email: z.string().trim().toLowerCase().email("EMAIL_INVALID").max(255),
  phone: z.string().trim().max(40).optional().default(""),
  message: z.string().trim().min(8, "MESSAGE_MIN").max(2000),
  locale: z.enum(["fr", "en"]).default("fr"),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, "PASSWORD_REQUIRED").max(200),
});

export const verifyCheckInSchema = z.object({
  codeOrToken: z.string().trim().min(3, "CODE_REQUIRED").max(300),
  sessionKey: z
    .string()
    .refine((val) => sessionKeys.includes(val), "INVALID_SESSION"),
  method: z.enum(["qr", "manual"]).default("qr"),
  commit: z.boolean().default(true),
});

export const updateRegistrationStatusSchema = z.object({
  status: z.enum(["confirmed", "cancelled"]).optional(),
  resendEmail: z.boolean().optional(),
});

export const updateSupportStatusSchema = z.object({
  status: z.enum(["new", "resolved"]),
});

