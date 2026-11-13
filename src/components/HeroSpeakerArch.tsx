"use client";

import {
  useAnimationFrame,
  useReducedMotion,
  useScroll,
} from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { SpeakerProfile } from "@/data/speakers";

interface HeroSpeakerArchProps {
  profiles: SpeakerProfile[];
  onSelect: (profile: SpeakerProfile) => void;
}

const DESKTOP_BREAKPOINT = 768;

function getMetrics(viewportWidth: number) {
  const isDesktop = viewportWidth >= DESKTOP_BREAKPOINT;
  const cardWidth = isDesktop ? 192 : 132;
  const cardGap = isDesktop ? 22 : 12;
  const slotStep = cardWidth + cardGap;
  const halfSpan = isDesktop
    ? Math.max(viewportWidth * 0.56, 380)
    : Math.max(viewportWidth * 0.54, 180);
  const maxAngle = isDesktop ? 34 : 22;
  return { cardWidth, slotStep, halfSpan, maxAngle, isDesktop };
}

function computeCardStyle(
  slotIndex: number,
  totalSlots: number,
  trackOffset: number,
  viewportWidth: number,
  cardEl?: HTMLElement | null,
) {
  const { cardWidth, slotStep, halfSpan, maxAngle, isDesktop } =
    getMetrics(viewportWidth);
  const totalWidth = totalSlots * slotStep;
  const halfTotal = totalWidth / 2;

  let dx = ((slotIndex * slotStep - trackOffset) % totalWidth + totalWidth) % totalWidth;
  if (dx > halfTotal) {
    dx -= totalWidth;
  }

  const clampedNorm = Math.max(-1.15, Math.min(1.15, dx / halfSpan));
  const absNorm = Math.min(Math.abs(clampedNorm), 1.1);

  // Concave amphitheater arc: center card sits slightly deeper/shorter,
  // outer cards sweep forward and angle inward symmetrically around center Y.
  const scale = isDesktop
    ? 0.86 + 0.25 * Math.pow(absNorm, 1.42)
    : 0.9 + 0.16 * Math.pow(absNorm, 1.4);
  const rotateY = -clampedNorm * maxAngle;
  // Slightly pull extreme angled cards inward so visual gaps stay uniform despite cos(rotateY) foreshortening.
  const foreshortenCompensation = -Math.sign(dx) * Math.pow(absNorm, 2.2) * (isDesktop ? 22 : 8);
  const finalX = dx + foreshortenCompensation;

  // Fade gently only past the outermost viewport edge so wraps happen invisibly offscreen.
  const visibilityRatio = Math.abs(finalX) / (viewportWidth * 0.5 + cardWidth);
  const opacity = visibilityRatio > 1.05 ? 0 : 1;
  const zIndex = Math.round(10 + absNorm * 20);

  const transform = `translate3d(${finalX.toFixed(2)}px, 0px, 0px) perspective(920px) rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;

  if (cardEl) {
    cardEl.style.transform = transform;
    cardEl.style.zIndex = String(zIndex);
    cardEl.style.opacity = String(opacity);
  }

  return { transform, zIndex, opacity };
}

/**
 * Full-width curved 3D concave portrait carousel combining invited guest
 * speakers and hosts. Scrolls automatically in a seamless horizontal loop,
 * slows gently on hover/focus, shifts subtly with page scroll, and opens the
 * speaker bio modal when any card is clicked.
 */
export function HeroSpeakerArch({
  profiles,
  onSelect,
}: HeroSpeakerArchProps) {
  const { locale, t } = useLocale();
  const prefersReduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(0);
  const speedMultiplierRef = useRef(1);
  const isSlowedRef = useRef(false);
  const viewportWidthRef = useRef(1280);
  const { scrollY } = useScroll();

  // Repeat 3x (18 cards total) so wrapping happens cleanly outside even ultrawide viewports.
  const slots = [...profiles, ...profiles, ...profiles];
  const totalSlots = slots.length;

  const applyFrame = useCallback(
    (offset: number, width: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const children = stage.children;
      for (let i = 0; i < children.length; i += 1) {
        const el = children[i] as HTMLElement | undefined;
        if (!el) continue;
        computeCardStyle(i, totalSlots, offset, width, el);
      }
    },
    [totalSlots],
  );

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measureAndPaint = () => {
      const w = stage.clientWidth || window.innerWidth || 1280;
      viewportWidthRef.current = w;
      const offset = prefersReduced
        ? 0
        : phaseRef.current + scrollY.get() * 0.24;
      applyFrame(offset, w);
    };

    measureAndPaint();
    const observer = new ResizeObserver(measureAndPaint);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [applyFrame, prefersReduced, scrollY]);

  useEffect(() => {
    if (!prefersReduced) return;
    applyFrame(0, viewportWidthRef.current);
  }, [applyFrame, prefersReduced]);

  useAnimationFrame((_, delta) => {
    if (prefersReduced) return;
    const clampedDelta = Math.min(delta, 50) / 1000;
    const targetSpeed = isSlowedRef.current ? 0.24 : 1;
    speedMultiplierRef.current +=
      (targetSpeed - speedMultiplierRef.current) * Math.min(1, clampedDelta * 7);

    phaseRef.current += clampedDelta * 30 * speedMultiplierRef.current;
    const totalOffset = phaseRef.current + scrollY.get() * 0.24;
    applyFrame(totalOffset, viewportWidthRef.current);
  });

  return (
    <div
      className="relative mt-4 w-full overflow-hidden py-2 select-none sm:mt-5 sm:py-3"
      onPointerEnter={() => {
        isSlowedRef.current = true;
      }}
      onPointerLeave={() => {
        isSlowedRef.current = false;
      }}
      onFocusCapture={() => {
        isSlowedRef.current = true;
      }}
      onBlurCapture={() => {
        isSlowedRef.current = false;
      }}
    >
      {/* Subtle atmospheric royal vignette edges for seamless blend into night blue */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-30 w-10 bg-linear-to-r from-[#030b2c]/95 via-[#030b2c]/40 to-transparent sm:w-20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-30 w-10 bg-linear-to-l from-[#030b2c]/95 via-[#030b2c]/40 to-transparent sm:w-20"
      />

      <div
        ref={stageRef}
        className="relative mx-auto h-52 w-full sm:h-64 md:h-76"
      >
        {slots.map((profile, index) => {
          const initial = computeCardStyle(index, totalSlots, 0, 1280);
          return (
            <button
              key={`${profile.id}-${index}`}
              type="button"
              onClick={() => onSelect(profile)}
              suppressHydrationWarning
              aria-label={`${profile.name} — ${profile.roleTitle[locale]} (${profile.country[locale]}). ${t.speakersSection.viewBio}`}
              style={{
                transform: initial.transform,
                zIndex: initial.zIndex,
                opacity: initial.opacity,
                transformOrigin: "center center",
                backfaceVisibility: "hidden",
                outline: "1px solid transparent",
              }}
              className="group absolute top-1/2 left-1/2 -mt-22.25 -ml-16.5 h-44.5 w-33 overflow-hidden rounded-2xl border border-white/15 bg-royal-900 shadow-[0_22px_50px_rgba(2,8,34,0.62)] transition-[border-color,box-shadow] duration-300 hover:border-gold-400/65 hover:shadow-[0_24px_60px_rgba(243,198,56,0.22)] focus-visible:border-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 md:-mt-30.75 md:-ml-24 md:h-61.5 md:w-48 md:rounded-[20px]"
            >
              <div
                className={`relative overflow-hidden size-full ${
                  profile.isCutout
                    ? "bg-[radial-gradient(circle_at_50%_20%,rgba(14,53,179,0.92),#020822_82%)]"
                    : "bg-royal-900"
                }`}
              >
                <Image
                  src={profile.image}
                  alt={profile.name}
                  fill
                  sizes="(max-width: 768px) 150px, 210px"
                  preload={index < 6}
                  loading="eager"
                  className={`object-cover object-top transition-transform duration-500 ease-out ${
                    profile.isCutout
                      ? "origin-[50%_15%] scale-[1.48] group-hover:scale-[1.54]"
                      : "group-hover:scale-[1.04]"
                  }`}
                />

                {/* Crisp inner border outline per dark-surface UI polish */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/15"
                />

                {/* Photo-only at rest; clean royal-gold caption overlay fades in on hover / keyboard focus */}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start justify-end bg-linear-to-t from-royal-950 via-royal-950/90 to-transparent px-3 pt-10 pb-3 text-left opacity-0 transition-opacity duration-250 ease-out group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-300">
                    <span>{profile.flagEmoji}</span>
                    <span className="truncate">{profile.roleTitle[locale]}</span>
                  </span>
                  <span className="mt-0.5 line-clamp-1 font-display font-bold text-white text-base/tight md:text-lg">
                    {profile.name}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
