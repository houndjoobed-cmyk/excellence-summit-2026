"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { initClarity, setClarityTag } from "@/lib/clarity";

/**
 * Mounts Microsoft Clarity on public pages and tags sessions with the active locale.
 */
export function ClarityAnalytics() {
  const pathname = usePathname();
  const { locale } = useLocale();

  useEffect(() => {
    const active = initClarity(pathname);
    if (active && !pathname?.startsWith("/dashboard")) {
      setClarityTag("locale", locale);
    }
  }, [pathname, locale]);

  return null;
}
