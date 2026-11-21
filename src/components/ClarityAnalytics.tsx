"use client";

import Clarity from "@microsoft/clarity";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

let clarityInitialized = false;

/**
 * Initializes Microsoft Clarity on public pages while excluding admin dashboard routes.
 */
export function ClarityAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
    if (!projectId || clarityInitialized || pathname?.startsWith("/dashboard")) {
      return;
    }

    Clarity.init(projectId);
    clarityInitialized = true;
  }, [pathname]);

  return null;
}
