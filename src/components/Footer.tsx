"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { EVENT_INFO } from "@/data/event";

export function Footer() {
  const { locale, t } = useLocale();

  const scheduleLine =
    locale === "fr"
      ? `${EVENT_INFO.dateRange.fr} · 09h–12h · 19h–21h`
      : `${EVENT_INFO.dateRange.en} · 09:00–12:00 · 19:00–21:00`;

  return (
    <footer className="no-print relative bg-royal-950 text-white">
      <div className="gold-hairline" />

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-3 self-start transition-opacity hover:opacity-90"
          >
            <Image
              src="/images/church-crest.webp"
              alt={EVENT_INFO.churchName}
              width={44}
              height={44}
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-gold-400/60 sm:h-11 sm:w-11"
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl font-medium tracking-tight text-white/95 sm:text-[1.65rem]">
                Excellence
              </span>
              <span className="font-display text-2xl font-bold tracking-[0.12em] uppercase text-gold-gradient sm:text-[1.75rem]">
                SUMMIT
              </span>
            </span>
          </Link>

          <div className="space-y-1 text-left text-xs leading-relaxed text-white/65 sm:text-right sm:text-sm">
            <p className="text-white/80">{t.hero.venuePill}</p>
            <p className="tabular-nums">{scheduleLine}</p>
          </div>
        </div>

        <div className="my-7 h-px w-full bg-white/10" />

        <div className="pr-14 text-xs text-white/50 sm:pr-0">
          <p>{t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
