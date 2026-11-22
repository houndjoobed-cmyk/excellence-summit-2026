"use client";

import { ExternalLink, MessageCircle } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { EVENT_INFO } from "@/data/event";
import { setClarityTag, trackClarityEvent } from "@/lib/clarity";

/**
 * High-visibility callout inviting confirmed participants to join the official WhatsApp group.
 */
export function WhatsappGroupBanner({
  source,
  className = "",
}: {
  source: "onboarding" | "badge";
  className?: string;
}) {
  const { t } = useLocale();

  return (
    <div
      className={`no-print rounded-2xl border-2 border-emerald-500/35 bg-emerald-50/90 p-4 text-left shadow-sm sm:p-5 ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 space-y-1">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            <MessageCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{t.onboarding.success.whatsappStepEyebrow}</span>
          </p>
          <h4 className="font-display text-lg font-bold text-royal-950 sm:text-xl">
            {t.onboarding.success.whatsappTitle}
          </h4>
          <p className="text-xs leading-relaxed text-emerald-950/80">
            {t.onboarding.success.whatsappDesc}
          </p>
        </div>

        <a
          href={EVENT_INFO.whatsappGroupUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            setClarityTag("whatsapp_cta_source", source);
            trackClarityEvent("whatsapp_group_clicked");
          }}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-emerald-700 active:scale-[0.96] sm:w-auto"
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          <span>{t.onboarding.success.whatsappCta}</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-85" />
        </a>
      </div>
    </div>
  );
}
