"use client";

import { useEffect } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { Dictionary } from "@/lib/i18n";

type PageKey = keyof Dictionary["meta"];

export function TitleSync({ pageKey }: { pageKey: PageKey }) {
  const { t } = useLocale();
  const title = t.meta[pageKey];

  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}

