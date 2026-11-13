"use client";

import { ArrowRight, QrCode, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Footer } from "@/components/Footer";
import { useLocale } from "@/components/LocaleProvider";
import { RevealWords } from "@/components/MotionPrimitives";
import { Navbar } from "@/components/Navbar";
import { SpeakerCard, SpeakerModal } from "@/components/SpeakerShowcase";
import { SupportWidget } from "@/components/SupportWidget";
import { TitleSync } from "@/components/TitleSync";
import { EVENT_INFO } from "@/data/event";
import { GUEST_SPEAKERS, HOST_COUPLE, type SpeakerProfile } from "@/data/speakers";

export default function IntervenantsPage() {
  const { locale, t } = useLocale();
  const [selectedProfile, setSelectedProfile] = useState<SpeakerProfile | null>(
    null,
  );

  return (
    <>
      <TitleSync pageKey="speakersTitle" />
      <Navbar />

      <main className="min-h-screen bg-ivory">
        <section className="bg-royal-grid pt-30 pb-16 text-white sm:pt-36 sm:pb-20">
          <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">
              {EVENT_INFO.brand} · {EVENT_INFO.dateRange[locale]}
            </p>
            <RevealWords
              as="h1"
              text={t.speakersSection.heading}
              immediate
              wordClassName="text-gold-shimmer"
              className="mt-3 font-display text-4xl font-bold text-balance sm:text-6xl"
            />
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
              {t.speakersSection.subheading}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/#inscription"
                className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-bold text-royal-950 hover:bg-gold-300 active:scale-[0.96]"
              >
                <Sparkles className="h-4 w-4" />
                <span>{t.speakersSection.registerCta}</span>
              </Link>
              <Link
                href="/badge"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/8 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15"
              >
                <QrCode className="h-4 w-4 text-gold-300" />
                <span>{t.nav.badge}</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            {t.speakersSection.eyebrow}
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {GUEST_SPEAKERS.map((speaker, idx) => (
              <SpeakerCard
                key={speaker.id}
                profile={speaker}
                index={idx}
                onSelect={setSelectedProfile}
              />
            ))}
          </div>

          <div className="mt-16 border-t border-slate-200 pt-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-crimson-600">
              {t.speakersSection.hostsEyebrow}
            </p>
            <RevealWords
              as="h2"
              text={t.speakersSection.hostsHeading}
              className="mt-2 font-display text-3xl font-bold text-royal-900 sm:text-4xl"
            />
            <p className="mt-2 max-w-2xl text-sm text-ink-muted">
              {t.speakersSection.hostsSubtitle}
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:max-w-3xl">
              {HOST_COUPLE.map((host, idx) => (
                <SpeakerCard
                  key={host.id}
                  profile={host}
                  index={idx}
                  onSelect={setSelectedProfile}
                />
              ))}
            </div>
          </div>

          <div className="mt-14 flex justify-center">
            <Link
              href="/#inscription"
              className="inline-flex items-center gap-2 rounded-full bg-royal-900 px-7 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-royal-800 active:scale-[0.96]"
            >
              <span>{t.hero.ctaPrimary}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <SpeakerModal
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />
      <Footer />
      <SupportWidget />
    </>
  );
}

