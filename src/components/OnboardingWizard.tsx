"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  MailCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BadgePassCard, type BadgePassData } from "@/components/BadgePassCard";
import { useLocale } from "@/components/LocaleProvider";
import { DOMAINS, REFERRAL_SOURCES } from "@/data/event";
import { MASTERCLASS_SPEAKERS } from "@/data/speakers";

const COUNTRY_DIAL_CODES = [
  { code: "+229", label: "🇧🇯 +229 (Bénin)" },
  { code: "+228", label: "🇹🇬 +228 (Togo)" },
  { code: "+225", label: "🇨🇮 +225 (Côte d'Ivoire)" },
  { code: "+241", label: "🇬🇦 +241 (Gabon)" },
  { code: "+33", label: "🇫🇷 +33 (France)" },
  { code: "+221", label: "🇸🇳 +221 (Sénégal)" },
  { code: "+237", label: "🇨🇲 +237 (Cameroun)" },
  { code: "+243", label: "🇨🇩 +243 (RD Congo)" },
  { code: "+242", label: "🇨🇬 +242 (Congo)" },
  { code: "+1", label: "🇺🇸 +1 (USA / Canada)" },
];

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  dialCode: string;
  phoneNumber: string;
  city: string;
  country: string;
  domain: string;
  roleTitle: string;
  organization: string;
  preferredSpeakers: string[];
  preferredTimeSlot: "all" | "morning" | "evening";
  attendingSunday: boolean;
  expectations: string;
  referralSource: string;
  acceptedCommitment: boolean;
  acceptedPrivacy: boolean;
}

const INITIAL_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  dialCode: "+229",
  phoneNumber: "",
  city: "",
  country: "Bénin",
  domain: "",
  roleTitle: "",
  organization: "",
  preferredSpeakers: [],
  preferredTimeSlot: "all",
  attendingSunday: true,
  expectations: "",
  referralSource: "",
  acceptedCommitment: false,
  acceptedPrivacy: false,
};

interface CreatedBadgeResponse extends BadgePassData {
  emailSent: boolean;
}

export function OnboardingWizard() {
  const { locale, t } = useLocale();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdBadge, setCreatedBadge] = useState<CreatedBadgeResponse | null>(
    null,
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldError(null);
    setDuplicateError(false);
  }

  function toggleSpeaker(id: string) {
    setForm((prev) => {
      const exists = prev.preferredSpeakers.includes(id);
      return {
        ...prev,
        preferredSpeakers: exists
          ? prev.preferredSpeakers.filter((item) => item !== id)
          : [...prev.preferredSpeakers, id],
      };
    });
  }

  function validateStep1(): boolean {
    if (form.preferredSpeakers.length === 0) {
      setFieldError(t.onboarding.errors.masterclassRequired);
      return false;
    }
    return true;
  }

  function validateStep2(): boolean {
    if (form.firstName.trim().length < 2) {
      setFieldError(t.onboarding.errors.firstName);
      return false;
    }
    if (form.lastName.trim().length < 2) {
      setFieldError(t.onboarding.errors.lastName);
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFieldError(t.onboarding.errors.email);
      return false;
    }
    const digits = form.phoneNumber.replace(/\D/g, "");
    if (digits.length < 6) {
      setFieldError(t.onboarding.errors.phone);
      return false;
    }
    if (form.city.trim().length < 2) {
      setFieldError(t.onboarding.errors.city);
      return false;
    }
    if (!form.domain) {
      setFieldError(t.onboarding.errors.domain);
      return false;
    }
    if (form.roleTitle.trim().length < 2) {
      setFieldError(t.onboarding.errors.roleTitle);
      return false;
    }
    if (!form.referralSource) {
      setFieldError(t.onboarding.errors.referralSource);
      return false;
    }
    return true;
  }

  function goNext() {
    setFieldError(null);
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 3) {
      goNext();
      return;
    }
    setFieldError(null);
    setDuplicateError(false);

    if (!form.acceptedCommitment || !form.acceptedPrivacy) {
      setFieldError(t.onboarding.errors.commitments);
      return;
    }

    setSubmitting(true);
    try {
      const fullPhone = `${form.dialCode} ${form.phoneNumber.trim()}`;
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: fullPhone,
          city: form.city.trim(),
          country: form.country.trim() || "Bénin",
          domain: form.domain,
          roleTitle: form.roleTitle.trim(),
          organization: form.organization.trim(),
          preferredSpeakers: form.preferredSpeakers,
          preferredTimeSlot: form.preferredTimeSlot,
          attendingSunday: form.attendingSunday,
          expectations: form.expectations.trim(),
          referralSource: form.referralSource,
          locale,
          acceptedCommitment: true,
          acceptedPrivacy: true,
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        registration?: CreatedBadgeResponse;
        error?: { code?: string; message?: string };
      } | null;

      if (!res.ok || !data?.registration) {
        if (data?.error?.code === "DUPLICATE_EMAIL") {
          setDuplicateError(true);
          setFieldError(t.onboarding.errors.duplicateEmail);
        } else if (data?.error?.code === "DB_NOT_CONFIGURED") {
          setFieldError(t.onboarding.errors.dbNotConfigured);
        } else {
          setFieldError(data?.error?.message || t.onboarding.errors.generic);
        }
        setSubmitting(false);
        return;
      }

      setCreatedBadge(data.registration);
    } catch {
      setFieldError(t.onboarding.errors.generic);
    } finally {
      setSubmitting(false);
    }
  }

  if (createdBadge) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-gold-400/40 bg-white p-6 shadow-[0_24px_60px_rgba(4,18,71,0.12)] sm:p-10">
        <div className="mb-6 text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="mt-3 font-display text-3xl font-bold text-royal-900 sm:text-4xl">
            {t.onboarding.success.title}
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            {t.onboarding.success.subtitle}
          </p>

          <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-royal-900/10 bg-ivory px-4 py-1.5 text-xs font-medium text-royal-900">
            <MailCheck className="h-4 w-4 text-gold-600" />
            <span>
              {createdBadge.emailSent
                ? t.onboarding.success.emailSent
                : t.onboarding.success.emailPending}
            </span>
          </div>
        </div>

        <BadgePassCard badge={createdBadge} showBadgePageLink />

        <p className="mx-auto mt-6 max-w-lg text-center text-xs leading-relaxed text-ink-muted">
          {t.onboarding.success.keepNotice}
        </p>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setCreatedBadge(null);
              setForm(INITIAL_FORM);
              setStep(1);
            }}
            className="text-xs font-semibold text-royal-800 underline underline-offset-4 hover:text-royal-950"
          >
            {t.onboarding.actions.newRegistration}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-royal-900/12 bg-white shadow-[0_24px_64px_rgba(4,18,71,0.12)]">
      {/* Top golden accent line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-royal-800 via-gold-400 to-crimson-500" />

      {/* 3-Step Stepper Header */}
      <div className="border-b border-slate-100 bg-ivory/70 px-4 py-4 sm:px-8 sm:py-5">
        <ol className="flex items-center gap-2 sm:grid sm:grid-cols-3 sm:gap-4">
          {t.onboarding.steps.map((label, idx) => {
            const num = (idx + 1) as 1 | 2 | 3;
            const active = step === num;
            const done = step > num;
            return (
              <li
                key={label}
                className={`flex items-center gap-2 rounded-2xl border px-2.5 py-2 transition-colors sm:px-3.5 ${active
                    ? "min-w-0 flex-1 border-royal-900 bg-royal-900 text-white shadow-sm"
                    : done
                      ? "shrink-0 justify-center border-emerald-200 bg-emerald-50 text-emerald-900 sm:min-w-0 sm:flex-1 sm:justify-start"
                      : "shrink-0 justify-center border-slate-200 bg-white text-ink-muted sm:min-w-0 sm:flex-1 sm:justify-start"
                  }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${active
                      ? "bg-gold-400 text-royal-950"
                      : done
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-ink-muted"
                    }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : num}
                </span>
                <span
                  className={`truncate text-xs font-semibold ${active ? "inline" : "hidden sm:inline"
                    }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-9">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 ? (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <div>
                <h3 className="font-display text-2xl font-bold text-royal-900 sm:text-3xl">
                  {t.onboarding.step1Title}
                </h3>
                <p className="mt-1 text-sm text-ink-muted">
                  {t.onboarding.step1Desc}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-ink">
                  {t.onboarding.fields.preferredSpeakers} *
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {t.onboarding.fields.preferredSpeakersHint}
                </p>
                <div className="mt-3 grid gap-3">
                  {MASTERCLASS_SPEAKERS.map((sp) => {
                    const selected = form.preferredSpeakers.includes(sp.id);
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => toggleSpeaker(sp.id)}
                        aria-pressed={selected}
                        className={`flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-colors active:scale-[0.99] sm:p-4 ${
                          selected
                            ? "border-royal-900 bg-royal-900/6 ring-1 ring-royal-900"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <Image
                          src={sp.image}
                          alt={sp.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 shrink-0 rounded-full object-cover object-top ring-1 ring-black/10"
                        />
                        <div className="min-w-0 flex-1">
                          {sp.masterclassSchedule ? (
                            <span className="mb-1 inline-block rounded-full bg-gold-400/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-royal-900">
                              {sp.masterclassSchedule.dayBadge[locale]}
                            </span>
                          ) : null}
                          <p className="text-sm font-bold text-ink sm:text-base">
                            {sp.masterclassFocus[locale]}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-ink-muted">
                            {sp.name} · {sp.roleTitle[locale]} {sp.flagEmoji}{" "}
                            {sp.country[locale]}
                          </p>
                        </div>
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                            selected
                              ? "bg-royal-900 text-gold-300"
                              : "border border-slate-300 bg-white"
                          }`}
                        >
                          {selected ? <Check className="h-3.5 w-3.5" /> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : null}

          {step === 2 ? (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <div>
                <h3 className="font-display text-2xl font-bold text-royal-900 sm:text-3xl">
                  {t.onboarding.step2Title}
                </h3>
                <p className="mt-1 text-sm text-ink-muted">
                  {t.onboarding.step2Desc}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="reg-firstName"
                    className="mb-1.5 block text-xs font-semibold text-ink"
                  >
                    {t.onboarding.fields.firstName} *
                  </label>
                  <input
                    id="reg-firstName"
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-royal-800 focus:ring-2 focus:ring-royal-800/15"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reg-lastName"
                    className="mb-1.5 block text-xs font-semibold text-ink"
                  >
                    {t.onboarding.fields.lastName} *
                  </label>
                  <input
                    id="reg-lastName"
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-royal-800 focus:ring-2 focus:ring-royal-800/15"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="mb-1.5 block text-xs font-semibold text-ink"
                >
                  {t.onboarding.fields.email} *
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-royal-800 focus:ring-2 focus:ring-royal-800/15"
                />
                <p className="mt-1 text-xs text-ink-muted">
                  {t.onboarding.fields.emailHint}
                </p>
              </div>

              <div>
                <label
                  htmlFor="reg-phone"
                  className="mb-1.5 block text-xs font-semibold text-ink"
                >
                  {t.onboarding.fields.phone} *
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    id="reg-dialCode"
                    name="dialCode"
                    aria-label={t.onboarding.fields.countryCode}
                    value={form.dialCode}
                    onChange={(e) => update("dialCode", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-royal-800 focus:ring-2 focus:ring-royal-800/15 sm:w-44 sm:shrink-0"
                  >
                    {COUNTRY_DIAL_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    placeholder="01 96 320 444"
                    value={form.phoneNumber}
                    onChange={(e) => update("phoneNumber", e.target.value)}
                    className="min-w-0 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm tabular-nums outline-none transition-colors focus:border-royal-800 focus:ring-2 focus:ring-royal-800/15"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="reg-city"
                    className="mb-1.5 block text-xs font-semibold text-ink"
                  >
                    {t.onboarding.fields.city} *
                  </label>
                  <input
                    id="reg-city"
                    type="text"
                    required
                    placeholder="Abomey-Calavi / Cotonou"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-royal-800 focus:ring-2 focus:ring-royal-800/15"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reg-country"
                    className="mb-1.5 block text-xs font-semibold text-ink"
                  >
                    {t.onboarding.fields.country} *
                  </label>
                  <input
                    id="reg-country"
                    type="text"
                    required
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-royal-800 focus:ring-2 focus:ring-royal-800/15"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="reg-domain"
                    className="mb-1.5 block text-xs font-semibold text-ink"
                  >
                    {t.onboarding.fields.domain} *
                  </label>
                  <select
                    id="reg-domain"
                    required
                    value={form.domain}
                    onChange={(e) => update("domain", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-royal-800 focus:ring-2 focus:ring-royal-800/15"
                  >
                    <option value="">
                      {t.onboarding.fields.domainPlaceholder}
                    </option>
                    {DOMAINS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d[locale]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="reg-role"
                    className="mb-1.5 block text-xs font-semibold text-ink"
                  >
                    {t.onboarding.fields.roleTitle} *
                  </label>
                  <input
                    id="reg-role"
                    type="text"
                    required
                    placeholder={t.onboarding.fields.rolePlaceholder}
                    value={form.roleTitle}
                    onChange={(e) => update("roleTitle", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-royal-800 focus:ring-2 focus:ring-royal-800/15"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-org"
                  className="mb-1.5 block text-xs font-semibold text-ink"
                >
                  {t.onboarding.fields.organization}
                </label>
                <input
                  id="reg-org"
                  type="text"
                  placeholder={t.onboarding.fields.organizationPlaceholder}
                  value={form.organization}
                  onChange={(e) => update("organization", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-royal-800 focus:ring-2 focus:ring-royal-800/15"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-slot"
                  className="mb-1.5 block text-xs font-semibold text-ink"
                >
                  {t.onboarding.fields.preferredTimeSlot}
                </label>
                <select
                  id="reg-slot"
                  value={form.preferredTimeSlot}
                  onChange={(e) =>
                    update(
                      "preferredTimeSlot",
                      e.target.value as "all" | "morning" | "evening",
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-royal-800 focus:ring-2 focus:ring-royal-800/15"
                >
                  <option value="all">{t.onboarding.fields.timeSlots.all}</option>
                  <option value="morning">
                    {t.onboarding.fields.timeSlots.morning}
                  </option>
                  <option value="evening">
                    {t.onboarding.fields.timeSlots.evening}
                  </option>
                </select>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-crimson-500/20 bg-red-50/50 p-3.5 text-xs font-medium text-ink">
                <input
                  type="checkbox"
                  checked={form.attendingSunday}
                  onChange={(e) => update("attendingSunday", e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-royal-900"
                />
                <span>{t.onboarding.fields.attendingSunday}</span>
              </label>

              <div>
                <label
                  htmlFor="reg-expectations"
                  className="mb-1.5 block text-xs font-semibold text-ink"
                >
                  {t.onboarding.fields.expectations}
                </label>
                <textarea
                  id="reg-expectations"
                  rows={3}
                  placeholder={t.onboarding.fields.expectationsPlaceholder}
                  value={form.expectations}
                  onChange={(e) => update("expectations", e.target.value)}
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-royal-800 focus:ring-2 focus:ring-royal-800/15"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-referral"
                  className="mb-1.5 block text-xs font-semibold text-ink"
                >
                  {t.onboarding.fields.referralSource} *
                </label>
                <select
                  id="reg-referral"
                  required
                  value={form.referralSource}
                  onChange={(e) => update("referralSource", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-royal-800 focus:ring-2 focus:ring-royal-800/15"
                >
                  <option value="">
                    {t.onboarding.fields.referralPlaceholder}
                  </option>
                  {REFERRAL_SOURCES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r[locale]}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          ) : null}

          {step === 3 ? (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <div>
                <h3 className="font-display text-2xl font-bold text-royal-900 sm:text-3xl">
                  {t.onboarding.step3Title}
                </h3>
                <p className="mt-1 text-sm text-ink-muted">
                  {t.onboarding.step3Desc}
                </p>
              </div>

              <div className="rounded-2xl border border-royal-900/12 bg-ivory p-5">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-royal-900">
                  <UserCheck className="h-4 w-4 text-gold-600" />
                  <span>{t.onboarding.summary.reviewTitle}</span>
                </p>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-ink-muted">
                      {t.onboarding.summary.identityLabel}
                    </dt>
                    <dd className="font-semibold text-ink">
                      {form.firstName} {form.lastName}
                    </dd>
                    <dd className="text-xs text-ink-muted">{form.email}</dd>
                    <dd className="text-xs text-ink-muted tabular-nums">
                      {form.dialCode} {form.phoneNumber}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-ink-muted">
                      {t.onboarding.summary.profileLabel}
                    </dt>
                    <dd className="font-semibold text-ink">{form.roleTitle}</dd>
                    <dd className="text-xs text-ink-muted">
                      {form.city}, {form.country}
                    </dd>
                    <dd className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-royal-800">
                      <Sparkles className="h-3.5 w-3.5 text-gold-600" />
                      <span>{t.onboarding.success.accessValue}</span>
                    </dd>
                  </div>

                  <div className="sm:col-span-2">
                    <dt className="text-xs text-ink-muted">
                      {t.onboarding.summary.focusLabel}
                    </dt>
                    <dd className="mt-1.5 flex flex-wrap gap-1.5">
                      {MASTERCLASS_SPEAKERS.filter((sp) =>
                        form.preferredSpeakers.includes(sp.id),
                      ).map((sp) => (
                        <span
                          key={sp.id}
                          className="rounded-full bg-royal-900/8 px-3 py-1 text-xs font-semibold text-royal-900"
                        >
                          {sp.masterclassSchedule
                            ? `${sp.masterclassSchedule.dayBadge[locale]} · `
                            : ""}
                          {sp.masterclassFocus[locale]} ({sp.name})
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>

                <p className="mt-4 border-t border-slate-200/80 pt-3 text-xs font-medium text-emerald-800">
                  {t.onboarding.summary.instantNote}
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3.5 text-xs font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={form.acceptedCommitment}
                    onChange={(e) =>
                      update("acceptedCommitment", e.target.checked)
                    }
                    className="mt-0.5 h-4 w-4 accent-royal-900"
                  />
                  <span>{t.onboarding.fields.acceptedCommitment}</span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3.5 text-xs font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={form.acceptedPrivacy}
                    onChange={(e) => update("acceptedPrivacy", e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-royal-900"
                  />
                  <span>{t.onboarding.fields.acceptedPrivacy}</span>
                </label>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {fieldError ? (
          <div
            role="alert"
            className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-crimson-600"
          >
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{fieldError}</span>
            </span>
            {duplicateError ? (
              <Link
                href={`/badge?q=${encodeURIComponent(form.email.trim())}`}
                className="rounded-full bg-royal-900 px-3 py-1 text-[11px] font-bold text-white hover:bg-royal-800"
              >
                {t.onboarding.errors.duplicateLink}
              </Link>
            ) : null}
          </div>
        ) : null}

        <div className="mt-7 flex flex-wrap-reverse items-center justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-nowrap">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                setFieldError(null);
                setStep((prev) => (prev === 3 ? 2 : 1));
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50 active:scale-[0.96] sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t.onboarding.actions.back}</span>
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-royal-900 px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-royal-800 active:scale-[0.96] sm:w-auto"
            >
              <span>{t.onboarding.actions.next}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-400 px-7 py-3 text-sm font-bold text-royal-950 shadow-[0_10px_28px_rgba(243,198,56,0.45)] transition-colors hover:bg-gold-300 active:scale-[0.96] disabled:opacity-60 sm:w-auto"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {submitting
                  ? t.onboarding.actions.submitting
                  : t.onboarding.actions.submit}
              </span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
