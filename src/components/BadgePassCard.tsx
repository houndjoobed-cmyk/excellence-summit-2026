"use client";

import {
  CheckCircle2,
  Download,
  ExternalLink,
  Printer,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { EVENT_INFO } from "@/data/event";

export interface BadgePassData {
  badgeCode: string;
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  roleTitle: string;
  status: string;
  attendingSunday: boolean;
  preferredTimeSlot: string;
  qrDataUrl: string;
  qrPayload: string;
  createdAt?: string | Date;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function BadgePassCard({
  badge,
  showBadgePageLink = false,
}: {
  badge: BadgePassData;
  showBadgePageLink?: boolean;
}) {
  const { locale, t } = useLocale();
  const [downloading, setDownloading] = useState(false);

  const isConfirmed = badge.status !== "cancelled";
  const fullName = `${badge.firstName} ${badge.lastName}`;

  async function handleDownloadPng() {
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 900;
      canvas.height = 1280;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Royal deep backdrop gradient
      const bg = ctx.createLinearGradient(0, 0, 900, 1280);
      bg.addColorStop(0, "#020822");
      bg.addColorStop(0.5, "#041247");
      bg.addColorStop(1, "#072078");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 900, 1280);

      // Subtle gold halo
      const glow = ctx.createRadialGradient(450, 220, 20, 450, 220, 460);
      glow.addColorStop(0, "rgba(243, 198, 56, 0.22)");
      glow.addColorStop(1, "rgba(243, 198, 56, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 900, 720);

      // Outer & inner golden borders
      ctx.strokeStyle = "#f3c638";
      ctx.lineWidth = 5;
      drawRoundedRect(ctx, 28, 28, 844, 1224, 34);
      ctx.stroke();

      ctx.strokeStyle = "rgba(253, 224, 115, 0.35)";
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, 44, 44, 812, 1192, 24);
      ctx.stroke();

      // Crest image
      try {
        const crest = await loadImage("/images/church-crest.webp");
        ctx.save();
        ctx.beginPath();
        ctx.arc(450, 128, 56, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(crest, 394, 72, 112, 112);
        ctx.restore();
      } catch {
        // Skip crest if image load fails
      }

      ctx.textAlign = "center";
      ctx.fillStyle = "#fde073";
      ctx.font = "700 20px sans-serif";
      ctx.fillText(t.badgePage.passHeader, 450, 225);

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 56px Georgia, serif";
      ctx.fillText("EXCELLENCE SUMMIT", 450, 290);

      ctx.fillStyle = "#dbe4ff";
      ctx.font = "500 22px sans-serif";
      ctx.fillText(EVENT_INFO.theme[locale], 450, 330);

      // Crimson pill date badge
      ctx.fillStyle = "#dc2626";
      drawRoundedRect(ctx, 295, 358, 310, 44, 22);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 20px sans-serif";
      ctx.fillText(t.badgePage.passDates.toUpperCase(), 450, 387);

      // QR container
      ctx.fillStyle = "#ffffff";
      drawRoundedRect(ctx, 260, 434, 380, 380, 28);
      ctx.fill();

      const qrImg = await loadImage(badge.qrDataUrl);
      ctx.drawImage(qrImg, 290, 464, 320, 320);

      // Reference badge pill
      ctx.fillStyle = "rgba(243, 198, 56, 0.16)";
      drawRoundedRect(ctx, 210, 845, 480, 76, 18);
      ctx.fill();
      ctx.strokeStyle = "#f3c638";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#fde073";
      ctx.font = "700 38px monospace";
      ctx.fillText(badge.badgeCode, 450, 896);

      // Holder name & role
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 40px Georgia, serif";
      ctx.fillText(fullName.slice(0, 32), 450, 990);

      ctx.fillStyle = "#fde073";
      ctx.font = "600 22px sans-serif";
      ctx.fillText(badge.roleTitle.slice(0, 44), 450, 1030);

      ctx.fillStyle = "#dbe4ff";
      ctx.font = "500 20px sans-serif";
      ctx.fillText(`${badge.city}, ${badge.country}`, 450, 1066);

      // Footer info
      ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(110, 1110);
      ctx.lineTo(790, 1110);
      ctx.stroke();

      ctx.fillStyle = "#fde073";
      ctx.font = "600 18px sans-serif";
      ctx.fillText(t.badgePage.passLocation, 450, 1150);

      ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
      ctx.font = "500 16px sans-serif";
      ctx.fillText(
        "Houekin Ministries Int. · +229 0196 320 444 / +229 01 65 185 630",
        450,
        1188,
      );

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `badge-${badge.badgeCode}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="print-pass-only relative overflow-hidden rounded-3xl border-2 border-gold-400/70 bg-royal-grid p-5 text-white shadow-[0_24px_60px_rgba(4,18,71,0.45)] sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/images/church-crest.webp"
              alt={EVENT_INFO.churchName}
              width={44}
              height={44}
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-gold-400/70 sm:h-11 sm:w-11"
            />
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-gold-300 sm:text-[11px]">
                {t.badgePage.passHeader}
              </p>
              <p className="truncate font-display text-lg font-bold text-white sm:text-xl">
                Excellence Summit 2026
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              isConfirmed
                ? "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40"
                : "bg-red-500/25 text-red-200 ring-1 ring-red-400/50"
            }`}
          >
            {isConfirmed ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5" />
            )}
            <span>
              {isConfirmed
                ? t.badgePage.statusConfirmed
                : t.badgePage.statusCancelled}
            </span>
          </span>
        </div>

        <div className="mt-6 grid items-center gap-6 sm:grid-cols-12">
          <div className="flex flex-col items-center sm:col-span-5">
            <div className="rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={badge.qrDataUrl}
                alt={`QR ${badge.badgeCode}`}
                width={184}
                height={184}
                className="h-44 w-44 rounded-lg object-contain"
              />
            </div>
            <div className="mt-3 rounded-xl border border-gold-400/50 bg-gold-400/12 px-4 py-2 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gold-300">
                {t.badgePage.passRef}
              </p>
              <p className="font-mono-code text-lg font-bold tracking-wider text-white">
                {badge.badgeCode}
              </p>
            </div>
          </div>

          <div className="space-y-4 sm:col-span-7">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gold-300">
                {t.badgePage.passHolder}
              </p>
              <h3 className="mt-0.5 font-display text-3xl font-bold leading-tight text-white">
                {fullName}
              </h3>
              <p className="mt-1 text-sm font-medium text-gold-200">
                {badge.roleTitle}
              </p>
              <p className="text-xs text-white/75">
                {badge.city}, {badge.country}
              </p>
            </div>

            <div className="space-y-2 rounded-2xl border border-white/15 bg-white/6 p-3.5 text-xs">
              <div className="flex items-center gap-2 font-semibold text-gold-200">
                <Sparkles className="h-3.5 w-3.5 text-gold-400" />
                <span>{t.onboarding.success.accessValue}</span>
              </div>
              <p className="text-white/80">{t.badgePage.passDates}</p>
              <p className="text-white/70">{t.badgePage.passLocation}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="no-print mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-bold text-royal-950 shadow-md transition-colors hover:bg-gold-300 active:scale-[0.96] disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          <span>{t.badgePage.downloadPng}</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full border border-royal-900/20 bg-white px-5 py-2.5 text-sm font-semibold text-royal-900 shadow-xs transition-colors hover:bg-slate-50 active:scale-[0.96]"
        >
          <Printer className="h-4 w-4" />
          <span>{t.badgePage.printPass}</span>
        </button>

        {showBadgePageLink ? (
          <Link
            href={`/badge?code=${encodeURIComponent(badge.badgeCode)}`}
            className="inline-flex items-center gap-2 rounded-full border border-royal-900/15 bg-royal-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-royal-800 active:scale-[0.96]"
          >
            <ExternalLink className="h-4 w-4" />
            <span>{t.onboarding.actions.viewBadgePage}</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

