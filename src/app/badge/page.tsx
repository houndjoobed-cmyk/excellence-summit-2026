"use client";

import {
  AlertCircle,
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Loader2,
  QrCode,
  Search,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { BadgePassCard, type BadgePassData } from "@/components/BadgePassCard";
import { Footer } from "@/components/Footer";
import { useLocale } from "@/components/LocaleProvider";
import { Navbar } from "@/components/Navbar";
import { SupportWidget } from "@/components/SupportWidget";
import { TitleSync } from "@/components/TitleSync";
import { CONVENTION_SESSIONS } from "@/data/event";

interface LookupBadgeResponse extends BadgePassData {
  verifiedByToken: boolean;
  checkIns: {
    sessionKey: string;
    checkedInAt: string;
    method: string;
  }[];
}

function BadgeLookupContent() {
  const { locale, t } = useLocale();
  const searchParams = useSearchParams();
  const initialCode =
    searchParams.get("code") || searchParams.get("q") || "";
  const initialToken = searchParams.get("t") || "";

  const [query, setQuery] = useState(initialCode);
  const [loading, setLoading] = useState(Boolean(initialCode || initialToken));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [badge, setBadge] = useState<LookupBadgeResponse | null>(null);

  const performLookup = useCallback(
    async (qValue: string, tValue = "") => {
      const cleaned = qValue.trim();
      if (cleaned.length < 4 && !tValue) {
        setErrorMsg(t.badgePage.invalidInput);
        return;
      }

      setErrorMsg(null);
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (cleaned) params.set("query", cleaned);
        if (tValue) params.set("t", tValue);

        const res = await fetch(`/api/badges/lookup?${params.toString()}`);
        const data = (await res.json().catch(() => null)) as {
          badge?: LookupBadgeResponse;
          error?: { code?: string; message?: string };
        } | null;

        if (!res.ok || !data?.badge) {
          setBadge(null);
          if (data?.error?.code === "DB_NOT_CONFIGURED") {
            setErrorMsg(t.onboarding.errors.dbNotConfigured);
          } else {
            setErrorMsg(t.badgePage.notFound);
          }
          return;
        }
        setBadge(data.badge);
      } catch {
        setErrorMsg(t.onboarding.errors.generic);
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    if (!initialCode && !initialToken) return;
    let cancelled = false;
    const params = new URLSearchParams();
    if (initialCode.trim()) params.set("query", initialCode.trim());
    if (initialToken) params.set("t", initialToken);

    fetch(`/api/badges/lookup?${params.toString()}`)
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as {
          badge?: LookupBadgeResponse;
          error?: { code?: string };
        } | null;
        if (cancelled) return;
        if (!res.ok || !data?.badge) {
          setBadge(null);
          setErrorMsg(
            data?.error?.code === "DB_NOT_CONFIGURED"
              ? t.onboarding.errors.dbNotConfigured
              : t.badgePage.notFound,
          );
          return;
        }
        setBadge(data.badge);
      })
      .catch(() => {
        if (!cancelled) setErrorMsg(t.onboarding.errors.generic);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialCode, initialToken, t]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void performLookup(query);
  }

  const sessionMap = new Map(CONVENTION_SESSIONS.map((s) => [s.key, s]));

  return (
    <main className="min-h-screen bg-ivory">
      <section className="bg-royal-grid pt-30 pb-16 text-white sm:pt-36 sm:pb-20">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-white/8 px-3.5 py-1 text-xs font-semibold text-gold-200">
            <QrCode className="h-3.5 w-3.5 text-gold-300" />
            <span>{t.badgePage.eyebrow}</span>
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold text-white sm:text-5xl">
            {t.badgePage.heading}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            {t.badgePage.subheading}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 max-w-xl rounded-3xl border border-gold-400/35 bg-white p-4 text-left text-ink shadow-2xl sm:p-5"
          >
            <label
              htmlFor="badge-search-input"
              className="block text-xs font-bold uppercase tracking-wider text-royal-900"
            >
              {t.badgePage.inputLabel}
            </label>
            <div className="mt-2 flex flex-col gap-2.5 sm:flex-row">
              <input
                id="badge-search-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder={t.badgePage.inputPlaceholder}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:border-royal-800 focus:ring-2 focus:ring-royal-800/15"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gold-400 px-5 py-3 text-sm font-bold text-royal-950 transition-colors hover:bg-gold-300 active:scale-[0.96] disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>
                  {loading ? t.badgePage.searching : t.badgePage.searchBtn}
                </span>
              </button>
            </div>
            <p className="mt-2.5 text-xs text-ink-muted">
              {t.badgePage.inputHint}
            </p>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        {errorMsg ? (
          <div
            role="alert"
            className="mx-auto flex max-w-xl items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-crimson-600"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        {badge ? (
          <div className="space-y-8">
            {badge.verifiedByToken ? (
              <div className="mx-auto flex max-w-xl items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                <span>{t.badgePage.verifiedBanner}</span>
              </div>
            ) : null}

            <BadgePassCard badge={badge} />

            <div className="no-print mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-royal-900">
                <CalendarCheck className="h-5 w-5 text-gold-600" />
                <span>{t.badgePage.checkInHistoryTitle}</span>
              </h2>

              {badge.checkIns.length === 0 ? (
                <p className="mt-3 text-sm text-ink-muted">
                  {t.badgePage.noCheckInsYet}
                </p>
              ) : (
                <ul className="mt-4 space-y-2.5">
                  {badge.checkIns.map((ci) => {
                    const session = sessionMap.get(ci.sessionKey);
                    return (
                      <li
                        key={`${ci.sessionKey}-${ci.checkedInAt}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-2.5 text-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <div>
                            <p className="font-semibold text-ink">
                              {session ? session.title[locale] : ci.sessionKey}
                            </p>
                            {session ? (
                              <p className="text-xs text-ink-muted">
                                {session.dateLabel[locale]} · {session.timeLabel}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <span className="font-mono-code text-xs text-emerald-800 tabular-nums">
                          {new Date(ci.checkedInAt).toLocaleTimeString(
                            locale === "fr" ? "fr-FR" : "en-US",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        ) : null}

        <div className="no-print mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-royal-900 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t.badgePage.backHome}</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function BadgePage() {
  return (
    <>
      <TitleSync pageKey="badgeTitle" />
      <Navbar />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-royal-950 text-white">
            <Loader2 className="h-7 w-7 animate-spin text-gold-400" />
          </div>
        }
      >
        <BadgeLookupContent />
      </Suspense>
      <Footer />
      <SupportWidget />
    </>
  );
}
