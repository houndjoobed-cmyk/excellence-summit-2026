"use client";

import {
  ArrowDown,
  ArrowRight,
  Calendar,
  Eye,
  MapPin,
  QrCode,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HeroSpeakerArch } from "@/components/HeroSpeakerArch";
import { useLocale } from "@/components/LocaleProvider";
import {
  AnimatedCounter,
  RevealWords,
  TiltGlowCard,
} from "@/components/MotionPrimitives";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { SpeakerCard, SpeakerModal } from "@/components/SpeakerShowcase";
import { EVENT_INFO, PROGRAMME_BLOCKS } from "@/data/event";
import { GUEST_SPEAKERS, HOST_COUPLE, type SpeakerProfile } from "@/data/speakers";
import { trackClarityEvent } from "@/lib/clarity";

export function LandingSections() {
  const { locale, t } = useLocale();
  const prefersReduced = useReducedMotion();
  const [selectedProfile, setSelectedProfile] = useState<SpeakerProfile | null>(
    null,
  );
  const [flyerOpen, setFlyerOpen] = useState(false);

  const heroCarouselProfiles = [...GUEST_SPEAKERS, ...HOST_COUPLE];

  const heroColumns = [
    {
      title:
        locale === "fr" ? "01 – 06 Déc. 2026" : "Dec 01 – 06, 2026",
      description: `${t.facts.daysLabel} · ${t.facts.scheduleValue}`,
    },
    {
      title:
        locale === "fr"
          ? "Cité d'Excellence & Gratitude"
          : "Cité d'Excellence & Gratitude",
      description: t.hero.venuePill,
    },
    {
      title: t.facts.accessValue,
      description: t.facts.accessLabel,
    },
  ];

  const keyFacts = [
    {
      icon: Calendar,
      iconWrapper: "bg-royal-900/6 text-royal-900",
      value: 6,
      suffix: "",
      unit: locale === "fr" ? "jours" : "days",
      sublabel: t.facts.daysValue,
    },
    {
      icon: Users,
      iconWrapper: "bg-royal-900/6 text-royal-900",
      value: 4,
      suffix: "",
      unit: locale === "fr" ? "orateurs invités" : "guest speakers",
      sublabel: t.facts.scheduleValue,
    },
    {
      icon: MapPin,
      iconWrapper: "bg-red-50 text-crimson-600",
      value: 2,
      suffix: "",
      unit: locale === "fr" ? "lieux d'accueil" : "host venues",
      sublabel: t.facts.venuesLabel,
    },
    {
      icon: QrCode,
      iconWrapper: "bg-amber-50 text-gold-600",
      value: 100,
      suffix: "%",
      unit: locale === "fr" ? "gratuit" : "free",
      sublabel: `${t.facts.accessValue} · ${t.facts.accessLabel}`,
    },
  ];

  return (
    <main>
      {/* HERO SECTION */}
      <section
        id="top"
        className="relative overflow-hidden bg-royal-grid pt-24 pb-12 text-white sm:pt-28 sm:pb-16"
      >
        {/* Atmospheric royal depth glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-110 w-215 -translate-x-1/2 rounded-full bg-royal-700/35 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-24 left-1/2 h-55 w-130 -translate-x-1/2 rounded-full bg-gold-400/8 blur-3xl"
        />

        {/* Centered Editorial Headline & CTAs */}
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-8">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-gold-400/35 bg-white/6 px-3 py-1.5 text-[11px] font-semibold leading-snug text-gold-200 backdrop-blur-md sm:gap-2.5 sm:rounded-full sm:px-3.5 sm:text-xs"
          >
            <Image
              src="/images/church-crest.webp"
              alt={EVENT_INFO.churchName}
              width={22}
              height={22}
              className="h-5 w-5 shrink-0 rounded-full object-cover sm:h-5.5 sm:w-5.5"
            />
            <span>{t.hero.kicker}</span>
          </motion.div>

          <RevealWords
            as="h1"
            text={t.hero.title}
            immediate
            delay={0.06}
            stagger={0.09}
            wordClassName="text-gold-shimmer"
            className="mt-3.5 font-display text-[2.65rem] leading-[1.04] font-bold tracking-tight text-balance sm:text-7xl lg:text-[5rem] lg:leading-[1.03]"
          />

          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 14, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3.5 inline-flex max-w-full flex-wrap items-center justify-center gap-2"
          >
            <span className="rounded-full bg-crimson-500 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md sm:text-xs">
              {t.hero.datePill}
            </span>
            <span className="rounded-2xl border border-gold-400/40 bg-royal-900/80 px-3.5 py-1 text-[11px] font-medium leading-snug text-gold-200 sm:rounded-full sm:text-xs">
              {t.hero.themePrefix} {t.hero.themeQuote}
            </span>
          </motion.div>

          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 14, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.52, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-3.5 max-w-2xl text-sm leading-relaxed text-white/85 text-pretty sm:text-base"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-5 flex w-full max-w-xs flex-col items-center justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-3.5"
          >
            <a
              href="#inscription"
              onClick={() => trackClarityEvent("cta_register_clicked")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-3.5 text-sm font-bold text-royal-950 shadow-[0_14px_34px_rgba(243,198,56,0.4)] transition-[background-color,transform,box-shadow] duration-200 hover:bg-gold-300 active:scale-[0.96] sm:w-auto sm:px-7"
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>{t.hero.ctaPrimary}</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </a>

            <Link
              href="/badge"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/8 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-[background-color,border-color,transform] duration-200 hover:border-gold-400/60 hover:bg-white/15 active:scale-[0.96] sm:w-auto"
            >
              <QrCode className="h-4 w-4 shrink-0 text-gold-300" />
              <span>{t.hero.ctaBadge}</span>
            </Link>
          </motion.div>
        </div>

        {/* Full-Width 3D Curved Marquee Showcase (4 Guest Speakers + 2 Hosts) */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroSpeakerArch
            profiles={heroCarouselProfiles}
            onSelect={setSelectedProfile}
          />
        </motion.div>

        {/* Bottom 3-Column Strip Separated by Golden Hairlines */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-4 max-w-5xl px-5 sm:mt-5 sm:px-8"
        >
          <div className="grid grid-cols-1 divide-y divide-gold-400/20 text-center md:grid-cols-3 md:divide-x md:divide-y-0 md:divide-gold-400/25">
            {heroColumns.map((col) => (
              <div key={col.title} className="px-4 py-4 md:px-8 md:py-2">
                <h2 className="font-display text-xl font-bold tracking-tight text-gold-200 sm:text-2xl">
                  {col.title}
                </h2>
                <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-white/75 text-balance sm:text-sm">
                  {col.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center sm:mt-10">
            <a
              href="#programme"
              aria-label={t.hero.scrollCue}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold-400/35 bg-white/6 text-gold-300 transition-[background-color,border-color,transform] duration-200 hover:border-gold-400/65 hover:bg-gold-400/15 active:scale-[0.96]"
            >
              <ArrowDown className="h-4 w-4 motion-safe:animate-bounce" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* KEY FACTS STRIP */}
      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-5 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:gap-5">
          {keyFacts.map((fact, idx) => {
            const Icon = fact.icon;
            return (
              <TiltGlowCard
                key={fact.unit}
                index={idx}
                maxTilt={2.6}
                glowColor="rgba(243, 198, 56, 0.14)"
                className="rounded-2xl border border-slate-200/85 bg-ivory/45 p-4 hover:border-gold-400/55 hover:shadow-[0_14px_34px_rgba(4,18,71,0.06)]"
              >
                <div className="relative z-20 flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${fact.iconWrapper}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-2xl font-bold leading-none text-royal-900">
                      <AnimatedCounter
                        value={fact.value}
                        suffix={fact.suffix}
                      />{" "}
                      <span className="text-lg font-bold text-royal-900">
                        {fact.unit}
                      </span>
                    </p>
                    <p className="mt-1.5 text-xs leading-snug text-ink-muted">
                      {fact.sublabel}
                    </p>
                  </div>
                </div>
              </TiltGlowCard>
            );
          })}
        </div>
      </section>

      {/* THEME & 4 PILLARS */}
      <section className="bg-ivory py-16 sm:py-22">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            {t.themeSection.eyebrow}
          </p>
          <RevealWords
            as="h2"
            text={t.themeSection.quote}
            className="mt-3 font-display text-4xl font-bold text-royal-900 text-balance sm:text-5xl"
          />
          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-muted text-pretty sm:text-lg"
          >
            {t.themeSection.description}
          </motion.p>
        </div>
      </section>

      <section className="bg-royal-grid py-16 text-white sm:py-22">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <RevealWords
              as="h2"
              text={t.themeSection.pillarsHeading}
              className="font-display text-3xl font-bold text-gold-200 text-balance sm:text-4xl"
            />
            <p className="mt-3 text-sm leading-relaxed text-white/75 text-pretty sm:text-base">
              {t.themeSection.pillarsIntro}
            </p>
          </div>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.themeSection.pillars.map((pillar, idx) => (
              <li key={pillar.title} className="h-full">
                <TiltGlowCard
                  index={idx}
                  maxTilt={3.8}
                  glowColor="rgba(243, 198, 56, 0.18)"
                  className="h-full rounded-2xl border border-gold-400/25 bg-white/6 p-6 backdrop-blur-md hover:border-gold-400/55 hover:shadow-[0_20px_48px_rgba(243,198,56,0.12)]"
                >
                  <div className="relative z-20">
                    <span className="font-mono-code text-xs font-bold text-gold-300">
                      0{idx + 1}
                    </span>
                    <h3 className="mt-2 font-display text-2xl font-bold text-white">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/75">
                      {pillar.text}
                    </p>
                  </div>
                </TiltGlowCard>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PROGRAMME TIMELINE */}
      <section id="programme" className="bg-white py-18 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-crimson-600">
                {t.programme.eyebrow}
              </p>
              <RevealWords
                as="h2"
                text={t.programme.heading}
                className="mt-2 font-display text-4xl font-bold text-royal-900 text-balance sm:text-5xl"
              />
              <p className="mt-3 text-sm leading-relaxed text-ink-muted text-pretty sm:text-base">
                {t.programme.subheading}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                trackClarityEvent("programme_flyer_opened");
                setFlyerOpen(true);
              }}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-royal-900/15 bg-ivory px-4 py-2.5 text-xs font-bold text-royal-900 transition-[background-color,color,transform] duration-200 hover:bg-royal-900 hover:text-white active:scale-[0.96]"
            >
              <Eye className="h-4 w-4" />
              <span>{t.programme.viewFlyer}</span>
            </button>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {PROGRAMME_BLOCKS.map((block, idx) => (
              <TiltGlowCard
                key={block.id}
                index={idx}
                maxTilt={2.6}
                glowColor="rgba(243, 198, 56, 0.14)"
                className="rounded-3xl border border-slate-200 bg-ivory/65 shadow-xs hover:border-gold-400/60 hover:shadow-[0_18px_44px_rgba(4,18,71,0.08)]"
              >
                <article className="relative z-20 flex h-full flex-col justify-between p-6">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-3.5 py-1 text-xs font-bold tracking-wider uppercase ${block.highlight === "crimson"
                            ? "bg-crimson-500 text-white"
                            : "bg-royal-900 text-gold-300"
                          }`}
                      >
                        {block.dateBadge[locale]}
                      </span>
                      <span className="text-xs font-semibold text-ink-muted">
                        {block.dayRange[locale]}
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-2xl font-bold text-royal-900 sm:text-3xl">
                      {block.title[locale]}
                    </h3>

                    <div className="mt-4 space-y-2.5">
                      {block.slots.map((slot) => (
                        <div
                          key={slot.time}
                          className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5"
                        >
                          <span className="shrink-0 rounded-lg bg-gold-400/20 px-2.5 py-1 font-mono-code text-xs font-bold text-royal-900">
                            {slot.time}
                          </span>
                          <p className="text-sm font-medium text-ink">
                            {slot.label[locale]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-200/70 pt-3.5 text-xs text-ink-muted">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-crimson-500" />
                      <span>{block.venue[locale]}</span>
                    </span>
                  </div>
                </article>
              </TiltGlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* 4 GUEST SPEAKERS + HOST COUPLE */}
      <section id="orateurs" className="bg-ivory py-18 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
                {t.speakersSection.eyebrow}
              </p>
              <RevealWords
                as="h2"
                text={t.speakersSection.heading}
                className="mt-2 font-display text-4xl font-bold text-royal-900 text-balance sm:text-5xl"
              />
              <p className="mt-3 text-sm leading-relaxed text-ink-muted text-pretty sm:text-base">
                {t.speakersSection.subheading}
              </p>
            </div>
            <Link
              href="/intervenants"
              className="inline-flex items-center gap-2 self-start rounded-full border border-royal-900/15 bg-white px-5 py-2.5 text-xs font-bold text-royal-900 transition-[background-color,color,transform] duration-200 hover:bg-royal-900 hover:text-white active:scale-[0.96]"
            >
              <Users className="h-4 w-4" />
              <span>{t.speakersSection.seeAllLink}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {GUEST_SPEAKERS.map((speaker, idx) => (
              <SpeakerCard
                key={speaker.id}
                profile={speaker}
                index={idx}
                onSelect={setSelectedProfile}
              />
            ))}
          </div>

          {/* Prophetic Host Couple */}
          <div className="mt-16 rounded-3xl border border-gold-400/35 bg-royal-grid p-6 text-white shadow-xl sm:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">
                  {t.speakersSection.hostsEyebrow}
                </p>
                <RevealWords
                  as="h3"
                  text={t.speakersSection.hostsHeading}
                  className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl"
                />
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  {t.speakersSection.hostsSubtitle}
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {HOST_COUPLE.map((host) => (
                    <button
                      key={host.id}
                      type="button"
                      onClick={() => setSelectedProfile(host)}
                      className="rounded-full border border-gold-400/45 bg-white/8 px-4 py-2 text-xs font-semibold text-gold-200 transition-[background-color,color,transform] duration-200 hover:bg-gold-400 hover:text-royal-950 active:scale-[0.96]"
                    >
                      {host.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
                {HOST_COUPLE.map((host, idx) => (
                  <TiltGlowCard
                    key={host.id}
                    index={idx}
                    interactive
                    maxTilt={3.8}
                    glowColor="rgba(243, 198, 56, 0.2)"
                    className="rounded-2xl border border-gold-400/30 bg-[radial-gradient(circle_at_50%_22%,rgba(14,53,179,0.85),#020822_82%)] hover:border-gold-400/65 hover:shadow-[0_22px_52px_rgba(243,198,56,0.2)]"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedProfile(host)}
                      className="group relative aspect-[4/4.6] w-full overflow-hidden rounded-[inherit] text-left"
                    >
                      <Image
                        src={host.image}
                        alt={host.name}
                        fill
                        sizes="(max-width: 640px) 88vw, (max-width: 768px) 44vw, 280px"
                        className={`transition-transform duration-500 group-hover:scale-105 ${host.isCutout
                            ? "object-contain object-bottom pt-3"
                            : "object-cover object-top"
                          }`}
                      />
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/12"
                      />
                      <div className="relative z-20 flex h-full items-end">
                        <div className="w-full bg-linear-to-t from-royal-950 via-royal-950/75 to-transparent p-3.5 pt-10">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gold-300">
                            {host.flagEmoji} {host.roleTitle[locale]}
                          </p>
                          <p className="font-display text-lg font-bold text-white">
                            {host.name}
                          </p>
                        </div>
                      </div>
                    </button>
                  </TiltGlowCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GUIDED 3-STEP ONBOARDING */}
      <section id="inscription" className="bg-white py-18 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-crimson-600">
              {t.onboarding.eyebrow}
            </p>
            <RevealWords
              as="h2"
              text={t.onboarding.heading}
              className="mt-2 font-display text-4xl font-bold text-royal-900 text-balance sm:text-5xl"
            />
            <p className="mt-3 text-sm leading-relaxed text-ink-muted text-pretty sm:text-base">
              {t.onboarding.subheading}
            </p>
          </div>

          <OnboardingWizard />
        </div>
      </section>

      <SpeakerModal
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />

      {/* Programme Flyer Lightbox */}
      <AnimatePresence>
        {flyerOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-royal-950/85 p-4 backdrop-blur-sm"
            onClick={() => setFlyerOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-lg overflow-hidden rounded-2xl border border-gold-400/50 bg-royal-950 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setFlyerOpen(false)}
                aria-label={t.programme.closeFlyer}
                className="absolute top-3 right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-royal-950/85 text-white ring-1 ring-white/25 hover:bg-royal-800"
              >
                <X className="h-4 w-4" />
              </button>
              <Image
                src="/images/programme-flyer.webp"
                alt="Programme officiel Excellence Summit 2026"
                width={900}
                height={1200}
                className="h-auto max-h-[86vh] w-auto max-w-full object-contain"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

