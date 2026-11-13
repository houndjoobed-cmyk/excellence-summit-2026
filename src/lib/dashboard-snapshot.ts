import type { SealedLiveQuery } from "@neon/realtime";
import { CONVENTION_SESSIONS } from "@/data/event";

export interface CheckInItem {
  sessionKey: string;
  checkedInAt: string;
  method: string;
}

export interface RegistrationItem {
  id: string;
  badgeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  roleTitle: string;
  domain: string;
  organization: string | null;
  preferredSpeakers: string[];
  preferredTimeSlot: string;
  attendingSunday: boolean;
  expectations: string;
  referralSource: string;
  locale: string;
  status: "confirmed" | "cancelled";
  emailSent: boolean;
  createdAt: string;
  checkIns: CheckInItem[];
}

export interface SupportMessageItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  locale: string;
  status: "new" | "resolved";
  createdAt: string;
}

export interface DashboardStats {
  totalRegistrations: number;
  confirmedCount: number;
  cancelledCount: number;
  sundayCount: number;
  totalCheckIns: number;
  uniqueCheckedInAttendees: number;
  openSupportCount: number;
  sessionCounts: Record<string, number>;
}

export interface LiveRegistrationRow {
  id: string;
  badge_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  role_title: string;
  domain: string;
  organization: string | null;
  preferred_speakers: string[] | string | null;
  preferred_time_slot: string;
  attending_sunday: boolean;
  expectations: string;
  referral_source: string;
  locale: string;
  status: string;
  email_sent: boolean;
  created_at: Date | string;
}

export interface LiveCheckInRow {
  id: string;
  registration_id: string;
  session_key: string;
  checked_in_at: Date | string;
  method: string;
}

export interface LiveSupportMessageRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  locale: string;
  status: string;
  created_at: Date | string;
}

export interface DashboardLiveBundle {
  registrations: {
    initialData: LiveRegistrationRow[];
    sealedQuery: SealedLiveQuery<LiveRegistrationRow>;
  };
  checkIns: {
    initialData: LiveCheckInRow[];
    sealedQuery: SealedLiveQuery<LiveCheckInRow>;
  };
  supportMessages: {
    initialData: LiveSupportMessageRow[];
    sealedQuery: SealedLiveQuery<LiveSupportMessageRow>;
  };
}

export interface DashboardFilterState {
  search: string;
  statusFilter: string;
  speakerFilter: string;
  sessionFilter: string;
  page: number;
  pageSize: number;
}

export interface DashboardSnapshot {
  stats: DashboardStats;
  registrations: RegistrationItem[];
  allRegistrations: RegistrationItem[];
  supportMessages: SupportMessageItem[];
  totalFiltered: number;
  totalPages: number;
  safePage: number;
}

function toIsoString(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : String(value);
}

function parseSpeakersArray(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const inner = trimmed.slice(1, -1).trim();
      if (!inner) return [];
      return inner
        .split(",")
        .map((part) => part.trim().replace(/^"(.*)"$/, "$1"))
        .filter(Boolean);
    }
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === "string");
        }
      } catch {
        return [];
      }
    }
  }
  return [];
}

export function buildDashboardSnapshot(
  raw: {
    registrations: readonly LiveRegistrationRow[];
    checkIns: readonly LiveCheckInRow[];
    supportMessages: readonly LiveSupportMessageRow[];
  },
  filters: DashboardFilterState,
): DashboardSnapshot {
  const checkInsByReg = new Map<string, CheckInItem[]>();
  const sessionCounts: Record<string, number> = {};
  for (const session of CONVENTION_SESSIONS) {
    sessionCounts[session.key] = 0;
  }

  for (const ci of raw.checkIns) {
    const list = checkInsByReg.get(ci.registration_id) || [];
    list.push({
      sessionKey: ci.session_key,
      checkedInAt: toIsoString(ci.checked_in_at),
      method: ci.method,
    });
    checkInsByReg.set(ci.registration_id, list);
    sessionCounts[ci.session_key] = (sessionCounts[ci.session_key] || 0) + 1;
  }

  const normalizedRegistrations: RegistrationItem[] = raw.registrations.map((r) => ({
    id: r.id,
    badgeCode: r.badge_code,
    firstName: r.first_name,
    lastName: r.last_name,
    email: r.email,
    phone: r.phone,
    city: r.city,
    country: r.country,
    roleTitle: r.role_title,
    domain: r.domain,
    organization: r.organization,
    preferredSpeakers: parseSpeakersArray(r.preferred_speakers),
    preferredTimeSlot: r.preferred_time_slot,
    attendingSunday: Boolean(r.attending_sunday),
    expectations: r.expectations,
    referralSource: r.referral_source,
    locale: r.locale,
    status: r.status === "cancelled" ? "cancelled" : "confirmed",
    emailSent: Boolean(r.email_sent),
    createdAt: toIsoString(r.created_at),
    checkIns: checkInsByReg.get(r.id) || [],
  }));

  const normalizedSupport: SupportMessageItem[] = raw.supportMessages.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    message: m.message,
    locale: m.locale,
    status: m.status === "resolved" ? "resolved" : "new",
    createdAt: toIsoString(m.created_at),
  }));

  const confirmedCount = normalizedRegistrations.filter(
    (r) => r.status === "confirmed",
  ).length;
  const cancelledCount = normalizedRegistrations.filter(
    (r) => r.status === "cancelled",
  ).length;
  const sundayCount = normalizedRegistrations.filter(
    (r) => r.status === "confirmed" && r.attendingSunday,
  ).length;

  const lowerQ = filters.search.trim().toLowerCase();
  const filtered = normalizedRegistrations.filter((r) => {
    if (filters.statusFilter !== "all" && r.status !== filters.statusFilter) {
      return false;
    }
    if (
      filters.speakerFilter !== "all" &&
      !r.preferredSpeakers.includes(filters.speakerFilter)
    ) {
      return false;
    }
    if (filters.sessionFilter !== "all") {
      if (!r.checkIns.some((c) => c.sessionKey === filters.sessionFilter)) {
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
  const pageSize = Math.max(1, filters.pageSize);
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(Math.max(1, filters.page), totalPages);
  const slice = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  return {
    stats: {
      totalRegistrations: normalizedRegistrations.length,
      confirmedCount,
      cancelledCount,
      sundayCount,
      totalCheckIns: raw.checkIns.length,
      uniqueCheckedInAttendees: checkInsByReg.size,
      openSupportCount: normalizedSupport.filter((m) => m.status === "new").length,
      sessionCounts,
    },
    registrations: slice,
    allRegistrations: normalizedRegistrations,
    supportMessages: normalizedSupport,
    totalFiltered,
    totalPages,
    safePage,
  };
}
