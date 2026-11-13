"use client";

import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { useEffect, useRef } from "react";

type HeadingTag = "h1" | "h2" | "h3" | "p" | "span";

interface RevealWordsProps {
  text: string;
  as?: HeadingTag;
  className?: string;
  wordClassName?: string;
  immediate?: boolean;
  delay?: number;
  stagger?: number;
}

/**
 * Staggered word-by-word entrance with subtle vertical rise and blur clear.
 * Splits text cleanly visually while keeping aria-label intact for screen readers.
 */
export function RevealWords({
  text,
  as: Tag = "h2",
  className = "",
  wordClassName = "",
  immediate = false,
  delay = 0,
  stagger = 0.045,
}: RevealWordsProps) {
  const prefersReduced = useReducedMotion();
  const words = text.trim().split(/\s+/);

  if (prefersReduced) {
    return (
      <Tag className={className}>
        {wordClassName ? <span className={wordClassName}>{text}</span> : text}
      </Tag>
    );
  }

  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, index) => (
        <span key={`${index}-${word}`} aria-hidden="true">
          <motion.span
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={
              immediate ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined
            }
            whileInView={
              immediate ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }
            }
            viewport={immediate ? undefined : { once: true, amount: 0.25 }}
            transition={{
              duration: 0.5,
              delay: delay + Math.min(index * stagger, 0.45),
              ease: [0.22, 1, 0.36, 1],
            }}
            className={`inline-block pb-[0.04em] ${wordClassName}`}
          >
            {word}
          </motion.span>
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}

interface TiltGlowCardProps {
  children: ReactNode;
  className?: string;
  index?: number;
  maxTilt?: number;
  glowColor?: string;
  interactive?: boolean;
}

/**
 * Stagger-revealed surface card with smooth pointer-driven 3D micro-tilt
 * and localized golden halo spotlight on desktop pointers.
 */
export function TiltGlowCard({
  children,
  className = "",
  index = 0,
  maxTilt = 3.5,
  glowColor = "rgba(243, 198, 56, 0.16)",
  interactive = false,
}: TiltGlowCardProps) {
  const prefersReduced = useReducedMotion();
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const spotX = useMotionValue(50);
  const spotY = useMotionValue(50);
  const spotOpacity = useMotionValue(0);

  const springConfig = { stiffness: 260, damping: 24, mass: 0.6 };
  const rotateX = useSpring(rawRotateX, springConfig);
  const rotateY = useSpring(rawRotateY, springConfig);
  const spotlightBackground = useMotionTemplate`radial-gradient(280px circle at ${spotX}% ${spotY}%, ${glowColor}, transparent 72%)`;

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (prefersReduced || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rawRotateY.set((px - 0.5) * 2 * maxTilt);
    rawRotateX.set((0.5 - py) * 2 * maxTilt);
    spotX.set(px * 100);
    spotY.set(py * 100);
    spotOpacity.set(1);
  }

  function handlePointerLeave() {
    rawRotateX.set(0);
    rawRotateY.set(0);
    spotOpacity.set(0);
  }

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 18 }}
      whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.07, 0.28),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileTap={
        !prefersReduced && interactive ? { scale: 0.985 } : undefined
      }
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        prefersReduced
          ? undefined
          : {
              rotateX,
              rotateY,
              transformPerspective: 950,
            }
      }
      className={`relative transition-[border-color,box-shadow] duration-300 ${className}`}
    >
      {!prefersReduced && (
        <motion.div
          aria-hidden="true"
          style={{
            opacity: spotOpacity,
            background: spotlightBackground,
          }}
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] transition-opacity duration-300"
        />
      )}
      {children}
    </motion.div>
  );
}

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

/**
 * Counts up smoothly when scrolled into view using tabular numerals.
 * Starts rendered with the target value for SSR/no-JS legibility.
 */
export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  className = "",
  duration = 1.1,
}: AnimatedCounterProps) {
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.4 });
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (prefersReduced || !inView || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;
    const node = textRef.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(latest) {
        node.textContent = `${prefix}${Math.round(latest)}${suffix}`;
      },
    });

    return () => controls.stop();
  }, [duration, inView, prefersReduced, prefix, suffix, value]);

  return (
    <span ref={containerRef} className={`tabular-nums ${className}`}>
      <span ref={textRef}>
        {prefix}
        {value}
        {suffix}
      </span>
    </span>
  );
}

