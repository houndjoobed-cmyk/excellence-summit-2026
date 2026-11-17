"use client";

import { ArrowRight, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { TiltGlowCard } from "@/components/MotionPrimitives";
import type { SpeakerProfile } from "@/data/speakers";

export function SpeakerCard({
  profile,
  index,
  onSelect,
}: {
  profile: SpeakerProfile;
  index: number;
  onSelect: (p: SpeakerProfile) => void;
}) {
  const { locale, t } = useLocale();

  return (
    <TiltGlowCard
      index={index}
      interactive
      maxTilt={3.2}
      glowColor="rgba(243, 198, 56, 0.18)"
      className="h-full rounded-3xl border border-gold-400/25 bg-royal-900 text-white shadow-[0_18px_42px_rgba(2,8,34,0.28)] hover:border-gold-400/55 hover:shadow-[0_24px_56px_rgba(243,198,56,0.16)]"
    >
      <article className="group relative flex h-full flex-col overflow-hidden rounded-[inherit]">
        <div className="relative aspect-4/5 w-full overflow-hidden bg-[radial-gradient(circle_at_50%_22%,rgba(14,53,179,0.9),#020822_78%)]">
          <Image
            src={profile.image}
            alt={profile.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
              profile.isCutout
                ? "object-contain object-bottom pt-4"
                : "object-cover object-top"
            }`}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-t-3xl ring-1 ring-inset ring-white/12"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-royal-900 via-royal-900/75 to-transparent"
          />

          <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full border border-gold-400/45 bg-royal-950/80 px-3 py-1 text-xs font-semibold text-gold-200 backdrop-blur-md">
            <span>{profile.flagEmoji}</span>
            <span>{profile.country[locale]}</span>
          </span>
        </div>

        <div className="relative z-20 flex flex-1 flex-col justify-between p-5 pt-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-300">
              {profile.roleTitle[locale]}
            </p>
            <h3 className="mt-1 font-display font-bold text-white text-2xl/snug">
              {profile.name}
            </h3>
            {profile.masterclassSchedule ? (
              <p className="mt-1.5 inline-block rounded-full border border-gold-400/35 bg-gold-400/12 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-gold-200">
                {profile.masterclassSchedule.dayBadge[locale]}
              </p>
            ) : null}
            <p className="mt-2 line-clamp-2 text-white/75 text-xs/relaxed">
              {profile.masterclassFocus[locale]}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelect(profile)}
            className="mt-4 inline-flex items-center justify-between rounded-xl border border-white/15 bg-white/8 px-3.5 py-2.5 text-xs font-semibold text-gold-200 transition-colors hover:border-gold-400/50 hover:bg-gold-400/15 active:scale-[0.98]"
          >
            <span>{t.speakersSection.viewBio}</span>
            <ArrowRight className="transition-transform size-3.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      </article>
    </TiltGlowCard>
  );
}

export function SpeakerModal({
  profile,
  onClose,
}: {
  profile: SpeakerProfile | null;
  onClose: () => void;
}) {
  const { locale, t } = useLocale();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!profile) return;
    closeBtnRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [profile, onClose]);

  return (
    <AnimatePresence>
      {profile ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-royal-950/75 p-3 py-6 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="speaker-modal-name"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto grid max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-gold-400/40 bg-royal-900 text-white shadow-2xl md:grid-cols-12 md:overflow-hidden"
          >
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label={t.speakersSection.closeModal}
              className="absolute top-3.5 right-3.5 z-20 inline-flex items-center justify-center rounded-full bg-royal-950/85 text-white ring-1 ring-white/25 size-10 hover:bg-royal-800 active:scale-[0.96]"
            >
              <X className="size-4" />
            </button>

            <div className="relative min-h-60 shrink-0 bg-[radial-gradient(circle_at_50%_22%,rgba(14,53,179,0.9),#020822_82%)] sm:min-h-72 md:col-span-5">
              <Image
                src={profile.image}
                alt={profile.name}
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className={
                  profile.isCutout
                    ? "object-contain object-bottom pt-4"
                    : "object-cover object-top"
                }
              />
            </div>

            <div className="flex flex-col justify-between p-6 md:col-span-7 md:p-7">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-crimson-500 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                    {profile.roleTitle[locale]}
                  </span>
                  <span className="rounded-full border border-gold-400/40 bg-gold-400/10 px-3 py-0.5 text-xs font-semibold text-gold-200">
                    {profile.flagEmoji} {profile.country[locale]}
                  </span>
                </div>

                <h3
                  id="speaker-modal-name"
                  className="mt-3 font-display text-3xl font-bold text-white"
                >
                  {profile.name}
                </h3>

                <div className="mt-3 rounded-xl border border-gold-400/25 bg-white/5 p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gold-300">
                    <Sparkles className="size-3.5" />
                    <span>{t.speakersSection.focusLabel}</span>
                  </p>
                  {profile.masterclassSchedule ? (
                    <p className="mt-1 text-xs font-semibold text-white/90">
                      {profile.masterclassSchedule.dateTime[locale]}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm font-medium text-gold-200">
                    {profile.masterclassFocus[locale]}
                  </p>
                </div>

                <div className="mt-4 space-y-3 text-white/80 text-sm/relaxed">
                  {profile.bio[locale].map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-4">
                <Link
                  href="/#inscription"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-bold text-royal-950 hover:bg-gold-300 active:scale-[0.96]"
                >
                  <span>{t.speakersSection.registerCta}</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
