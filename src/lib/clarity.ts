"use client";

import Clarity from "@microsoft/clarity";

let clarityInitialized = false;

/**
 * Initializes Microsoft Clarity once for public pages, excluding admin dashboard routes.
 */
export function initClarity(pathname: string | null): boolean {
  if (typeof window === "undefined") return false;
  if (pathname?.startsWith("/dashboard")) return false;
  if (clarityInitialized) return true;

  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
  if (!projectId) return false;

  try {
    Clarity.init(projectId);
    clarityInitialized = true;
    return true;
  } catch {
    return false;
  }
}

/**
 * Sends a named custom event to Microsoft Clarity for funnel and interaction tracking.
 */
export function trackClarityEvent(eventName: string): void {
  if (typeof window === "undefined" || !clarityInitialized || !eventName) return;
  try {
    Clarity.event(eventName);
  } catch {
    // Analytics must never interrupt user flows
  }
}

/**
 * Attaches a custom filter tag to the active Microsoft Clarity session.
 */
export function setClarityTag(key: string, value: string | string[]): void {
  if (typeof window === "undefined" || !clarityInitialized || !key) return;
  if (Array.isArray(value) && value.length === 0) return;
  if (!Array.isArray(value) && !value.trim()) return;

  try {
    Clarity.setTag(key, value);
  } catch {
    // Analytics must never interrupt user flows
  }
}

/**
 * Upgrades the priority of the current session recording (e.g., after an error).
 */
export function upgradeClaritySession(reason: string): void {
  if (typeof window === "undefined" || !clarityInitialized || !reason) return;
  try {
    Clarity.upgrade(reason);
  } catch {
    // Analytics must never interrupt user flows
  }
}

/**
 * Associates the session with an anonymous registration reference (never PII).
 */
export function identifyClarityBadge(badgeCode: string): void {
  if (typeof window === "undefined" || !clarityInitialized || !badgeCode.trim()) {
    return;
  }
  try {
    Clarity.identify(badgeCode.trim());
  } catch {
    // Analytics must never interrupt user flows
  }
}
