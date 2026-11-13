"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Database,
  Download,
  Eye,
  LogOut,
  Mail,
  MessageSquare,
  QrCode,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DashboardLiveConnector,
  useLiveDashboardState,
} from "@/components/DashboardLiveConnector";
import { useLocale } from "@/components/LocaleProvider";
import { NeonRealtimeProvider } from "@/components/NeonRealtimeProvider";
import { QrCameraScanner } from "@/components/QrCameraScanner";
import { TitleSync } from "@/components/TitleSync";
import { CONVENTION_SESSIONS, DOMAINS } from "@/data/event";
import { GUEST_SPEAKERS } from "@/data/speakers";
import {
  buildDashboardSnapshot,
  type CheckInItem,
  type DashboardLiveBundle,
  type DashboardStats,
  type RegistrationItem,
  type SupportMessageItem,
} from "@/lib/dashboard-snapshot";

interface VerifyOutcome {
  outcome:
  | "checked_in"
  | "already_checked_in"
  | "cancelled"
  | "not_found"
  | "valid_preview";
  message: string;
  registration?: RegistrationItem;
  checkIn?: CheckInItem;
  sessionHistory?: CheckInItem[];
}

interface DashboardClientProps {
  realtimeUrl?: string | null;
  initialLiveBundle?: DashboardLiveBundle | null;
}

export function DashboardClient({
  realtimeUrl = null,
  initialLiveBundle = null,
}: DashboardClientProps = {}) {
  if (realtimeUrl && initialLiveBundle) {
    return (
      <NeonRealtimeProvider url={realtimeUrl}>
        <DashboardLiveConnector bundle={initialLiveBundle}>
          <DashboardView />
        </DashboardLiveConnector>
      </NeonRealtimeProvider>
    );
  }

  return <DashboardView />;
}

function DashboardView() {
  const { locale, setLocale } = useLocale();
  const isEn = locale === "en";
  const router = useRouter();
  const liveState = useLiveDashboardState();
  const isLiveMode = Boolean(liveState);

  const [tab, setTab] = useState<"scanner" | "registrations" | "support">(
    "scanner",
  );
  const [fetchedLoading, setFetchedLoading] = useState(!isLiveMode);
  const [refreshingLive, setRefreshingLive] = useState(false);
  const [dbMissing, setDbMissing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [fetchedStats, setFetchedStats] = useState<DashboardStats | null>(null);
  const [fetchedItems, setFetchedItems] = useState<RegistrationItem[]>([]);
  const [fetchedSupportItems, setFetchedSupportItems] = useState<
    SupportMessageItem[]
  >([]);
  const [page, setPage] = useState(1);
  const [fetchedTotalPages, setFetchedTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [speakerFilter, setSpeakerFilter] = useState("all");
  const [sessionFilter, setSessionFilter] = useState("all");

  // Scanner state
  const [activeSessionKey, setActiveSessionKey] = useState(
    CONVENTION_SESSIONS[1].key,
  );
  const [manualInput, setManualInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyOutcome | null>(null);

  // Modals & row busy state
  const [selectedAttendeeRaw, setSelectedAttendee] =
    useState<RegistrationItem | null>(null);
  const [busyRowId, setBusyRowId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const liveSnapshot = useMemo(() => {
    if (!liveState) return null;
    return buildDashboardSnapshot(
      {
        registrations: liveState.registrations,
        checkIns: liveState.checkIns,
        supportMessages: liveState.supportMessages,
      },
      {
        search,
        statusFilter,
        speakerFilter,
        sessionFilter,
        page,
        pageSize: 20,
      },
    );
  }, [liveState, search, statusFilter, speakerFilter, sessionFilter, page]);

  const stats = liveSnapshot ? liveSnapshot.stats : fetchedStats;
  const items = liveSnapshot ? liveSnapshot.registrations : fetchedItems;
  const supportItems = liveSnapshot
    ? liveSnapshot.supportMessages
    : fetchedSupportItems;
  const totalPages = liveSnapshot ? liveSnapshot.totalPages : fetchedTotalPages;
  const loading = isLiveMode ? refreshingLive : fetchedLoading;

  const selectedAttendee = useMemo(() => {
    if (!selectedAttendeeRaw) return null;
    if (!liveSnapshot) return selectedAttendeeRaw;
    return (
      liveSnapshot.allRegistrations.find(
        (r) => r.id === selectedAttendeeRaw.id,
      ) ?? selectedAttendeeRaw
    );
  }, [selectedAttendeeRaw, liveSnapshot]);

  const buildDashboardParams = useCallback(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "20",
    });
    if (search.trim()) params.set("q", search.trim());
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (speakerFilter !== "all") params.set("speaker", speakerFilter);
    if (sessionFilter !== "all") params.set("session", sessionFilter);
    return params;
  }, [page, search, statusFilter, speakerFilter, sessionFilter]);

  const liveRefreshFn = liveState?.refresh;

  const fetchDashboard = useCallback(async () => {
    if (liveRefreshFn) {
      setRefreshingLive(true);
      setErrorMsg(null);
      try {
        await liveRefreshFn();
      } catch {
        setErrorMsg(
          isEn
            ? "Unable to refresh Neon Realtime queries."
            : "Impossible de rafraîchir les requêtes Neon Realtime.",
        );
      } finally {
        setRefreshingLive(false);
      }
      return;
    }

    setFetchedLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/admin/registrations?${buildDashboardParams().toString()}`,
      );
      if (res.status === 401) {
        router.push("/dashboard/login");
        return;
      }
      const data = (await res.json().catch(() => null)) as {
        stats?: DashboardStats;
        registrations?: RegistrationItem[];
        supportMessages?: SupportMessageItem[];
        pagination?: { totalPages: number };
        error?: { code?: string; message?: string };
      } | null;

      if (!res.ok) {
        if (data?.error?.code === "DB_NOT_CONFIGURED") {
          setDbMissing(true);
        } else {
          setErrorMsg(data?.error?.message || "Erreur lors du chargement.");
        }
        return;
      }

      setDbMissing(false);
      setFetchedStats(data?.stats || null);
      setFetchedItems(data?.registrations || []);
      setFetchedSupportItems(data?.supportMessages || []);
      setFetchedTotalPages(data?.pagination?.totalPages || 1);
    } catch {
      setErrorMsg("Erreur réseau lors du chargement du dashboard.");
    } finally {
      setFetchedLoading(false);
    }
  }, [buildDashboardParams, isEn, liveRefreshFn, router]);

  useEffect(() => {
    if (isLiveMode) return;
    let cancelled = false;
    fetch(`/api/admin/registrations?${buildDashboardParams().toString()}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 401) {
          router.push("/dashboard/login");
          return;
        }
        const data = (await res.json().catch(() => null)) as {
          stats?: DashboardStats;
          registrations?: RegistrationItem[];
          supportMessages?: SupportMessageItem[];
          pagination?: { totalPages: number };
          error?: { code?: string; message?: string };
        } | null;
        if (cancelled) return;
        if (!res.ok) {
          if (data?.error?.code === "DB_NOT_CONFIGURED") {
            setDbMissing(true);
          } else {
            setErrorMsg(data?.error?.message || "Erreur lors du chargement.");
          }
          return;
        }
        setDbMissing(false);
        setErrorMsg(null);
        setFetchedStats(data?.stats || null);
        setFetchedItems(data?.registrations || []);
        setFetchedSupportItems(data?.supportMessages || []);
        setFetchedTotalPages(data?.pagination?.totalPages || 1);
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMsg("Erreur réseau lors du chargement du dashboard.");
        }
      })
      .finally(() => {
        if (!cancelled) setFetchedLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [buildDashboardParams, isLiveMode, router]);

  useEffect(() => {
    if (!selectedAttendee) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedAttendee(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedAttendee]);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  }

  async function handleVerify(
    codeOrToken: string,
    method: "qr" | "manual",
    commit = true,
  ) {
    const cleaned = codeOrToken.trim();
    if (!cleaned) return;
    setVerifying(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codeOrToken: cleaned,
          sessionKey: activeSessionKey,
          method,
          commit,
        }),
      });
      if (res.status === 401) {
        router.push("/dashboard/login");
        return;
      }
      const data = (await res.json().catch(() => null)) as VerifyOutcome | null;
      if (data) {
        setVerifyResult(data);
        if (data.outcome === "checked_in") {
          void fetchDashboard();
        }
      }
    } finally {
      setVerifying(false);
    }
  }

  async function handleToggleStatus(item: RegistrationItem) {
    setBusyRowId(item.id);
    const nextStatus = item.status === "confirmed" ? "cancelled" : "confirmed";
    try {
      const res = await fetch(`/api/admin/registrations/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showToast(
          nextStatus === "cancelled"
            ? `Badge ${item.badgeCode} annulé.`
            : `Badge ${item.badgeCode} réactivé.`,
        );
        await fetchDashboard();
      }
    } finally {
      setBusyRowId(null);
    }
  }

  async function handleResendEmail(item: RegistrationItem) {
    setBusyRowId(item.id);
    try {
      const res = await fetch(`/api/admin/registrations/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resendEmail: true }),
      });
      const data = (await res.json().catch(() => null)) as {
        emailResult?: { sent: boolean; reason?: string; detail?: string };
      } | null;
      if (data?.emailResult?.sent) {
        showToast(`E-mail renvoyé à ${item.email}.`);
        await fetchDashboard();
      } else {
        const reason = data?.emailResult?.reason;
        const detail = data?.emailResult?.detail;
        const missingConfig =
          reason === "EMAIL_NOT_CONFIGURED" ||
          reason === "RESEND_NOT_CONFIGURED";
        showToast(
          missingConfig
            ? isEn
              ? "Email provider not configured yet (set BREVO_API_KEY + BREVO_SENDER_EMAIL, or RESEND_API_KEY)."
              : "Envoi impossible : configurez BREVO_API_KEY + BREVO_SENDER_EMAIL (ou RESEND_API_KEY)."
            : reason === "BREVO_UNAUTHORIZED_IP"
              ? isEn
                ? "Brevo blocked Vercel's dynamic IP. Disable IP blocking in Brevo → Security → Authorized IPs."
                : "Brevo bloque l'IP Vercel. Désactivez le blocage IP dans Brevo → Sécurité → Adresses IP autorisées."
              : isEn
                ? `Email delivery failed (${detail || reason || "provider error"}).`
                : `Échec d'envoi (${detail || reason || "erreur fournisseur"}).`,
        );
      }
    } finally {
      setBusyRowId(null);
    }
  }

  async function handleDelete(item: RegistrationItem) {
    const ok = window.confirm(
      isEn
        ? `Delete registration ${item.badgeCode} (${item.firstName} ${item.lastName})?`
        : `Supprimer définitivement l'inscription ${item.badgeCode} (${item.firstName} ${item.lastName}) ?`,
    );
    if (!ok) return;
    setBusyRowId(item.id);
    try {
      const res = await fetch(`/api/admin/registrations/${item.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(`Inscription ${item.badgeCode} supprimée.`);
        if (selectedAttendee?.id === item.id) setSelectedAttendee(null);
        await fetchDashboard();
      }
    } finally {
      setBusyRowId(null);
    }
  }

  async function handleSupportToggle(msg: SupportMessageItem) {
    const next = msg.status === "new" ? "resolved" : "new";
    const res = await fetch(`/api/admin/support/${msg.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      await fetchDashboard();
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/dashboard/login");
  }

  const sessionMap = new Map(CONVENTION_SESSIONS.map((s) => [s.key, s]));
  const domainMap = new Map(DOMAINS.map((d) => [d.value as string, d]));
  const speakerMap = new Map(GUEST_SPEAKERS.map((s) => [s.id, s]));

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <TitleSync pageKey="dashboardTitle" />

      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 border-b border-gold-400/25 bg-royal-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/images/church-crest.webp"
              alt="La Cité d'Excellence"
              width={38}
              height={38}
              className="rounded-full object-cover ring-1 ring-gold-400/70 size-9.5"
            />
            <div>
              <p className="font-display text-xl font-bold text-gold-200">
                Excellence Summit · Dashboard
              </p>
              <p className="text-[11px] text-white/65">
                {isEn
                  ? "Masterclasses Tracking & QR Verification"
                  : "Suivi des inscriptions & Vérification QR"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {liveState ? (
              <span
                title={liveState.errorMessage || "Neon Realtime WebSocket"}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  liveState.status === "live"
                    ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-200"
                    : liveState.status === "error" ||
                        liveState.status === "closed"
                      ? "border-red-400/40 bg-crimson-500/20 text-red-200"
                      : "border-gold-400/40 bg-gold-400/15 text-gold-200"
                }`}
              >
                <span
                  className={`rounded-full size-2 ${
                    liveState.status === "live"
                      ? "animate-pulse bg-emerald-400"
                      : liveState.status === "error" ||
                          liveState.status === "closed"
                        ? "bg-red-400"
                        : "animate-pulse bg-gold-300"
                  }`}
                />
                <span>
                  {liveState.status === "live"
                    ? isEn
                      ? "Neon Live"
                      : "Temps réel"
                    : liveState.status === "error" ||
                        liveState.status === "closed"
                      ? isEn
                        ? "Live offline"
                        : "Hors ligne"
                      : isEn
                        ? "Syncing…"
                        : "Connexion…"}
                </span>
              </span>
            ) : null}

            <div className="flex rounded-full border border-white/15 bg-white/5 p-0.5">
              <button
                type="button"
                onClick={() => setLocale("fr")}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${locale === "fr" ? "bg-gold-400 text-royal-950" : "text-white/75"
                  }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${locale === "en" ? "bg-gold-400 text-royal-950" : "text-white/75"
                  }`}
              >
                EN
              </button>
            </div>

            <a
              href="/api/admin/export"
              className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/40 bg-gold-400/15 px-3.5 py-1.5 text-xs font-semibold text-gold-200 hover:bg-gold-400/25"
            >
              <Download className="size-3.5" />
              <span>Export CSV</span>
            </a>

            <button
              type="button"
              onClick={() => void fetchDashboard()}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
            >
              <RefreshCw
                className={`size-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {isEn ? "Refresh" : "Actualiser"}
              </span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white"
            >
              <ArrowLeft className="size-3.5" />
              <span className="hidden sm:inline">Site</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full bg-crimson-500/90 px-3 py-1.5 text-xs font-bold text-white hover:bg-crimson-500"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">
                {isEn ? "Logout" : "Déconnexion"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-8 sm:py-8">
        {toastMsg ? (
          <div
            role="status"
            className="rounded-2xl border border-gold-400 bg-royal-900 px-4 py-3 text-xs font-semibold text-gold-200 shadow-lg"
          >
            {toastMsg}
          </div>
        ) : null}

        {dbMissing ? (
          <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 text-amber-950 shadow-xs">
            <div className="flex items-start gap-3">
              <Database className="mt-0.5 shrink-0 text-amber-700 size-6" />
              <div>
                <h2 className="font-display text-2xl font-bold">
                  {isEn
                    ? "Connect your Neon Database to activate live data"
                    : "Connectez votre base Neon pour activer le suivi en direct"}
                </h2>
                <p className="mt-1 text-sm text-amber-900">
                  {isEn
                    ? "Add your Neon Postgres connection string in .env.local then run the Drizzle schema push:"
                    : "Ajoutez votre chaîne de connexion Neon dans .env.local puis poussez le schéma Drizzle :"}
                </p>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-royal-950 p-3.5 font-mono-code text-xs text-gold-200">
                  {`DATABASE_URL="postgresql://..."\nnpm run db:push`}
                </pre>
              </div>
            </div>
          </div>
        ) : null}

        {errorMsg ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-crimson-600"
          >
            {errorMsg}
          </div>
        ) : null}

        {/* KPI Grid */}
        <section className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              {isEn ? "Total Registered" : "Total Inscrits"}
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-royal-900 tabular-nums">
              {stats?.totalRegistrations ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              {isEn ? "Active Passes" : "Badges Actifs"}
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-emerald-700 tabular-nums">
              {stats?.confirmedCount ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              {isEn ? "Unique Attendees" : "Présents uniques"}
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-royal-800 tabular-nums">
              {stats?.uniqueCheckedInAttendees ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              {isEn ? "Total Scans" : "Total Pointages"}
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-gold-600 tabular-nums">
              {stats?.totalCheckIns ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-crimson-600">
              Majestic (Dim. 06)
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-crimson-600 tabular-nums">
              {stats?.sundayCount ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              {isEn ? "Open Questions" : "Questions ouvertes"}
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-royal-900 tabular-nums">
              {stats?.openSupportCount ?? 0}
            </p>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setTab("scanner")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors ${tab === "scanner"
              ? "bg-royal-900 text-gold-300 shadow-sm"
              : "bg-white text-ink hover:bg-slate-100"
              }`}
          >
            <QrCode className="size-4" />
            <span>
              {isEn ? "QR Scanner & Check-in" : "Vérification & Scanner QR"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab("registrations")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors ${tab === "registrations"
              ? "bg-royal-900 text-gold-300 shadow-sm"
              : "bg-white text-ink hover:bg-slate-100"
              }`}
          >
            <Users className="size-4" />
            <span>
              {isEn ? "Registrations" : "Inscrits"} (
              <span className="tabular-nums">
                {stats?.totalRegistrations ?? 0}
              </span>
              )
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab("support")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors ${tab === "support"
              ? "bg-royal-900 text-gold-300 shadow-sm"
              : "bg-white text-ink hover:bg-slate-100"
              }`}
          >
            <MessageSquare className="size-4" />
            <span>
              {isEn ? "Questions" : "Messages Support"} (
              <span className="tabular-nums">
                {stats?.openSupportCount ?? 0}
              </span>
              )
            </span>
          </button>
        </div>

        {/* TAB 1: QR SCANNER & VERIFICATION */}
        {tab === "scanner" ? (
          <section className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-royal-900">
                  {isEn
                    ? "Entrance Verification & Check-in"
                    : "Contrôle & Pointage à l'entrée"}
                </h2>
                <p className="mt-1 text-xs text-ink-muted">
                  {isEn
                    ? "Select the active convention session, then scan a badge QR code or enter an ES26 reference."
                    : "Choisissez la session en cours puis scannez le QR code ou saisissez le numéro ES26."}
                </p>
              </div>

              <div>
                <label
                  htmlFor="active-session"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-royal-900"
                >
                  {isEn ? "Active Session" : "Session active à pointer"}
                </label>
                <select
                  id="active-session"
                  value={activeSessionKey}
                  onChange={(e) => setActiveSessionKey(e.target.value)}
                  className="w-full rounded-xl border border-royal-900/20 bg-ivory px-3.5 py-2.5 text-sm font-semibold text-royal-900 outline-none focus:border-royal-800"
                >
                  {CONVENTION_SESSIONS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.dayShort[locale]} · {s.timeLabel} — {s.title[locale]} (
                      {stats?.sessionCounts?.[s.key] ?? 0})
                    </option>
                  ))}
                </select>
              </div>

              <QrCameraScanner
                disabled={verifying || dbMissing}
                onScan={(text) => void handleVerify(text, "qr", true)}
                startLabel={
                  isEn ? "Start Camera Scanner" : "Activer la caméra QR"
                }
                stopLabel={isEn ? "Stop Camera" : "Arrêter la caméra"}
                scanningHint={
                  isEn
                    ? "Point the camera at the participant's QR code"
                    : "Pointez la caméra vers le QR code du participant"
                }
                permissionDeniedText={
                  isEn
                    ? "Camera permission denied. Allow camera access or use manual code entry."
                    : "Accès caméra refusé. Autorisez la caméra dans votre navigateur ou utilisez la saisie manuelle."
                }
                unavailableText={
                  isEn
                    ? "Camera unavailable on this device. Please use manual code entry below."
                    : "Caméra indisponible sur cet appareil. Utilisez la saisie manuelle ci-dessous."
                }
              />

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleVerify(manualInput, "manual", true);
                }}
                className="space-y-2.5 border-t border-slate-100 pt-4"
              >
                <label
                  htmlFor="manual-code-input"
                  className="block text-xs font-bold text-ink"
                >
                  {isEn
                    ? "Manual code or scanned link"
                    : "Saisie manuelle (ex. ES26-7K9P2M)"}
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="manual-code-input"
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="ES26-XXXXXX"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-mono-code text-sm uppercase outline-none focus:border-royal-800 focus:ring-2 focus:ring-royal-800/15"
                  />
                  <button
                    type="submit"
                    disabled={verifying || !manualInput.trim() || dbMissing}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gold-400 px-4 py-2.5 text-xs font-bold text-royal-950 hover:bg-gold-300 active:scale-[0.96] disabled:opacity-50"
                  >
                    <UserCheck className="size-4" />
                    <span>
                      {isEn ? "Verify & Check In" : "Vérifier & Pointer"}
                    </span>
                  </button>
                </div>
                <button
                  type="button"
                  disabled={verifying || !manualInput.trim() || dbMissing}
                  onClick={() => void handleVerify(manualInput, "manual", false)}
                  className="text-xs font-semibold text-royal-800 underline underline-offset-4 hover:text-royal-950 disabled:opacity-50"
                >
                  {isEn
                    ? "Check validity without recording check-in"
                    : "Vérifier la validité sans enregistrer de passage"}
                </button>
              </form>
            </div>

            {/* Verification Outcome Card */}
            <div className="space-y-5 lg:col-span-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <h3 className="font-display text-2xl font-bold text-royal-900">
                  {isEn ? "Verification Result" : "Résultat du contrôle"}
                </h3>

                {!verifyResult ? (
                  <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-ivory/70 py-14 text-center">
                    <QrCode className="text-royal-900/30 size-10" />
                    <p className="mt-3 max-w-xs text-sm text-ink-muted">
                      {isEn
                        ? "Scan a QR badge or enter a registration number to view attendee details and check-in history."
                        : "Scannez un QR code ou entrez un numéro ES26 pour afficher l'état du badge et ses pointages."}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div
                      role="status"
                      className={`flex items-start gap-3 rounded-2xl border p-4 ${verifyResult.outcome === "checked_in"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : verifyResult.outcome === "already_checked_in"
                          ? "border-amber-300 bg-amber-50 text-amber-950"
                          : verifyResult.outcome === "valid_preview"
                            ? "border-blue-200 bg-blue-50 text-royal-900"
                            : "border-red-300 bg-red-50 text-crimson-600"
                        }`}
                    >
                      {verifyResult.outcome === "checked_in" ||
                        verifyResult.outcome === "valid_preview" ? (
                        <CheckCircle2 className="mt-0.5 shrink-0 size-6" />
                      ) : verifyResult.outcome === "already_checked_in" ? (
                        <AlertTriangle className="mt-0.5 shrink-0 size-6" />
                      ) : (
                        <XCircle className="mt-0.5 shrink-0 size-6" />
                      )}
                      <div>
                        <p className="text-sm font-bold">{verifyResult.message}</p>
                        {verifyResult.checkIn ? (
                          <p className="mt-0.5 text-xs opacity-85 tabular-nums">
                            {new Date(
                              verifyResult.checkIn.checkedInAt,
                            ).toLocaleString(locale === "fr" ? "fr-FR" : "en-US")}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {verifyResult.registration ? (
                      <div className="rounded-2xl border border-royal-900/12 bg-ivory p-5">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <span className="font-mono-code rounded-lg bg-royal-900 px-2.5 py-1 text-xs font-bold text-gold-300">
                              {verifyResult.registration.badgeCode}
                            </span>
                            <h4 className="mt-2 font-display text-2xl font-bold text-royal-900">
                              {verifyResult.registration.firstName}{" "}
                              {verifyResult.registration.lastName}
                            </h4>
                            <p className="text-xs font-medium text-ink-muted">
                              {verifyResult.registration.roleTitle} ·{" "}
                              {verifyResult.registration.city},{" "}
                              {verifyResult.registration.country}
                            </p>
                          </div>

                          {verifyResult.outcome === "valid_preview" ? (
                            <button
                              type="button"
                              onClick={() =>
                                void handleVerify(
                                  verifyResult.registration!.badgeCode,
                                  "manual",
                                  true,
                                )
                              }
                              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                            >
                              {isEn ? "Confirm Check-in" : "Valider le pointage"}
                            </button>
                          ) : null}
                        </div>

                        {verifyResult.sessionHistory &&
                          verifyResult.sessionHistory.length > 0 ? (
                          <div className="mt-4 border-t border-slate-200 pt-3">
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                              {isEn
                                ? "Attended Sessions"
                                : "Historique des passages"}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {verifyResult.sessionHistory.map((h) => {
                                const sess = sessionMap.get(h.sessionKey);
                                return (
                                  <span
                                    key={h.sessionKey}
                                    className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-900"
                                  >
                                    <CalendarCheck className="size-3" />
                                    <span>
                                      {sess ? sess.dayShort[locale] : h.sessionKey}
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Per-Session Live Attendance Strip */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-royal-900">
                  {isEn
                    ? "Check-ins by Convention Session"
                    : "Pointages par session"}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CONVENTION_SESSIONS.map((s) => (
                    <div
                      key={s.key}
                      className={`rounded-xl border p-2.5 text-xs ${s.key === activeSessionKey
                        ? "border-royal-900 bg-royal-900/5"
                        : "border-slate-100 bg-ivory/60"
                        }`}
                    >
                      <p className="truncate font-semibold text-ink">
                        {s.dayShort[locale]}
                      </p>
                      <p className="mt-0.5 font-mono-code text-base font-bold text-royal-900 tabular-nums">
                        {stats?.sessionCounts?.[s.key] ?? 0}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* TAB 2: REGISTRATIONS TABLE */}
        {tab === "registrations" ? (
          <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
            <div className="grid gap-3 md:grid-cols-12">
              <div className="relative md:col-span-5">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-muted size-4" />
                <input
                  id="dashboard-attendee-search"
                  name="search"
                  aria-label={isEn ? "Search attendee" : "Rechercher un inscrit"}
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder={
                    isEn
                      ? "Search ES26 code, name, email, phone, city..."
                      : "Rechercher ES26, nom, e-mail, tél, ville..."
                  }
                  className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-10 text-sm outline-none focus:border-royal-800"
                />
              </div>

              <select
                id="dashboard-status-filter"
                name="statusFilter"
                aria-label="Filtrer par statut"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold outline-none md:col-span-2"
              >
                <option value="all">
                  {isEn ? "All statuses" : "Tous statuts"}
                </option>
                <option value="confirmed">
                  {isEn ? "Confirmed" : "Confirmés"}
                </option>
                <option value="cancelled">
                  {isEn ? "Cancelled" : "Annulés"}
                </option>
              </select>

              <select
                id="dashboard-speaker-filter"
                name="speakerFilter"
                aria-label="Filtrer par orateur préféré"
                value={speakerFilter}
                onChange={(e) => {
                  setSpeakerFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold outline-none md:col-span-2"
              >
                <option value="all">
                  {isEn ? "All speakers" : "Tous orateurs"}
                </option>
                {GUEST_SPEAKERS.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name}
                  </option>
                ))}
              </select>

              <select
                id="dashboard-session-filter"
                name="sessionFilter"
                aria-label="Filtrer par pointage session"
                value={sessionFilter}
                onChange={(e) => {
                  setSessionFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold outline-none md:col-span-3"
              >
                <option value="all">
                  {isEn ? "All check-in sessions" : "Toutes sessions pointées"}
                </option>
                {CONVENTION_SESSIONS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.dayShort[locale]}
                  </option>
                ))}
              </select>
            </div>

            {items.length === 0 ? (
              <div className="py-12 text-center text-sm text-ink-muted">
                {isEn
                  ? "No registrations match the current filters."
                  : "Aucune inscription ne correspond aux critères sélectionnés."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-195 text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                      <th className="py-3 pr-3">Badge</th>
                      <th className="py-3 pr-3">
                        {isEn ? "Participant" : "Participant"}
                      </th>
                      <th className="py-3 pr-3">Contact</th>
                      <th className="py-3 pr-3">
                        {isEn ? "Profile" : "Profil"}
                      </th>
                      <th className="py-3 pr-3">
                        {isEn ? "Check-ins" : "Présences"}
                      </th>
                      <th className="py-3 pr-3">Statut</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-ivory/70">
                        <td className="py-3 pr-3 font-mono-code text-xs font-bold text-royal-900">
                          {item.badgeCode}
                        </td>
                        <td className="py-3 pr-3">
                          <p className="font-semibold text-ink">
                            {item.firstName} {item.lastName}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {item.city}, {item.country}
                          </p>
                        </td>
                        <td className="py-3 pr-3 text-xs">
                          <p className="text-ink">{item.email}</p>
                          <p className="text-ink-muted tabular-nums">
                            {item.phone}
                          </p>
                        </td>
                        <td className="py-3 pr-3 text-xs">
                          <p className="font-medium text-ink">
                            {item.roleTitle}
                          </p>
                          <p className="text-ink-muted">
                            {domainMap.get(item.domain)?.[locale] || item.domain}
                          </p>
                        </td>
                        <td className="py-3 pr-3 font-mono-code text-xs font-bold text-royal-900 tabular-nums">
                          {item.checkIns.length} / {CONVENTION_SESSIONS.length}
                        </td>
                        <td className="py-3 pr-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${item.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-crimson-600"
                              }`}
                          >
                            {item.status === "confirmed"
                              ? isEn
                                ? "Confirmed"
                                : "Confirmé"
                              : isEn
                                ? "Cancelled"
                                : "Annulé"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedAttendee(item)}
                              title="Détails"
                              className="rounded-lg p-2 text-ink-muted hover:bg-slate-100 hover:text-royal-900"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              type="button"
                              disabled={busyRowId === item.id}
                              onClick={() => void handleResendEmail(item)}
                              title="Renvoyer l'e-mail"
                              className="rounded-lg p-2 text-ink-muted hover:bg-slate-100 hover:text-royal-900 disabled:opacity-50"
                            >
                              <Mail className="size-4" />
                            </button>
                            <button
                              type="button"
                              disabled={busyRowId === item.id}
                              onClick={() => void handleToggleStatus(item)}
                              title={
                                item.status === "confirmed"
                                  ? "Annuler"
                                  : "Réactiver"
                              }
                              className="rounded-lg p-2 text-ink-muted hover:bg-slate-100 hover:text-amber-700 disabled:opacity-50"
                            >
                              <ShieldAlert className="size-4" />
                            </button>
                            <button
                              type="button"
                              disabled={busyRowId === item.id}
                              onClick={() => void handleDelete(item)}
                              title="Supprimer"
                              className="rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-crimson-600 disabled:opacity-50"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 ? (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-full border border-slate-200 px-4 py-1.5 disabled:opacity-50"
                >
                  {isEn ? "Previous" : "Précédent"}
                </button>
                <span className="tabular-nums text-ink-muted">
                  Page {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-full border border-slate-200 px-4 py-1.5 disabled:opacity-50"
                >
                  {isEn ? "Next" : "Suivant"}
                </button>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* TAB 3: SUPPORT MESSAGES */}
        {tab === "support" ? (
          <section className="space-y-3">
            {supportItems.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-ink-muted">
                {isEn
                  ? "No support questions received yet."
                  : "Aucune question reçue pour le moment."}
              </div>
            ) : (
              supportItems.map((m) => (
                <article
                  key={m.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-start"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${m.status === "new"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-emerald-100 text-emerald-800"
                          }`}
                      >
                        {m.status === "new"
                          ? isEn
                            ? "New"
                            : "Nouveau"
                          : isEn
                            ? "Resolved"
                            : "Traité"}
                      </span>
                      <p className="text-sm font-bold text-ink">{m.name}</p>
                      <span className="text-xs text-ink-muted">{m.email}</span>
                      {m.phone ? (
                        <span className="text-xs text-ink-muted tabular-nums">
                          · {m.phone}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-ink text-sm/relaxed">
                      {m.message}
                    </p>
                    <p className="text-[11px] text-ink-muted tabular-nums">
                      {new Date(m.createdAt).toLocaleString(
                        locale === "fr" ? "fr-FR" : "en-US",
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleSupportToggle(m)}
                    className="shrink-0 rounded-full border border-royal-900/15 px-4 py-2 text-xs font-bold text-royal-900 hover:bg-royal-900 hover:text-white"
                  >
                    {m.status === "new"
                      ? isEn
                        ? "Mark resolved"
                        : "Marquer traité"
                      : isEn
                        ? "Reopen"
                        : "Réouvrir"}
                  </button>
                </article>
              ))
            )}
          </section>
        ) : null}
      </main>

      {/* Attendee Detail Modal */}
      {selectedAttendee ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-royal-950/70 p-4 backdrop-blur-xs"
          onClick={() => setSelectedAttendee(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-gold-400/40 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono-code rounded-lg bg-royal-900 px-2.5 py-1 text-xs font-bold text-gold-300">
                  {selectedAttendee.badgeCode}
                </span>
                <h3 className="mt-2 font-display text-2xl font-bold text-royal-900">
                  {selectedAttendee.firstName} {selectedAttendee.lastName}
                </h3>
                <p className="text-xs text-ink-muted">
                  {selectedAttendee.roleTitle}
                  {selectedAttendee.organization
                    ? ` · ${selectedAttendee.organization}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAttendee(null)}
                className="rounded-full p-2 text-ink-muted hover:bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold text-ink-muted">Contact</dt>
                <dd>
                  {selectedAttendee.email} · {selectedAttendee.phone}
                </dd>
                <dd className="text-xs text-ink-muted">
                  {selectedAttendee.city}, {selectedAttendee.country}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-ink-muted">
                  {isEn ? "Preferred Speakers" : "Orateurs sélectionnés"}
                </dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {selectedAttendee.preferredSpeakers.length === 0 ? (
                    <span className="text-xs text-ink-muted">
                      {isEn ? "All 4 speakers" : "Les 4 orateurs"}
                    </span>
                  ) : (
                    selectedAttendee.preferredSpeakers.map((id) => (
                      <span
                        key={id}
                        className="rounded-full bg-royal-900/6 px-2.5 py-0.5 text-xs font-semibold text-royal-900"
                      >
                        {speakerMap.get(id)?.name || id}
                      </span>
                    ))
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-ink-muted">
                  {isEn ? "Expectations" : "Attentes exprimées"}
                </dt>
                <dd className="mt-1 rounded-xl bg-ivory p-3 text-ink text-xs/relaxed">
                  {selectedAttendee.expectations}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-4">
              <Link
                href={`/badge?code=${encodeURIComponent(selectedAttendee.badgeCode)}`}
                target="_blank"
                className="rounded-full bg-gold-400 px-4 py-2 text-xs font-bold text-royal-950 hover:bg-gold-300"
              >
                {isEn ? "Open QR Pass" : "Ouvrir le Badge QR"}
              </Link>
              <button
                type="button"
                onClick={() => setSelectedAttendee(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold"
              >
                {isEn ? "Close" : "Fermer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
