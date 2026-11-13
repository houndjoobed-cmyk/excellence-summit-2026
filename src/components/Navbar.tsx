"use client";

import { Menu, QrCode, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

export function Navbar() {
  const { locale, setLocale, t } = useLocale();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    if (drawerOpen) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [drawerOpen]);

  const isHome = pathname === "/";

  const navItems = [
    {
      label: t.nav.programme,
      href: isHome ? "#programme" : "/#programme",
      active: false,
    },
    {
      label: t.nav.speakers,
      href: "/intervenants",
      active: pathname === "/intervenants",
    },
    {
      label: t.nav.register,
      href: isHome ? "#inscription" : "/#inscription",
      active: false,
    },
  ];

  return (
    <>
      <header className="no-print fixed inset-x-0 top-3 z-40 flex justify-center px-3 pointer-events-none sm:top-4 sm:px-4">
        <nav
          aria-label="Navigation principale"
          className="pointer-events-auto flex w-full max-w-4xl items-center justify-between gap-2 rounded-full border border-gold-400/25 bg-royal-900/90 px-2.5 py-1.5 text-white shadow-[0_14px_38px_rgba(2,8,34,0.45)] backdrop-blur-xl sm:px-3.5 sm:py-2 md:w-auto md:gap-5 md:px-4"
        >
          <Link
            href={isHome ? "#top" : "/"}
            aria-label={isHome ? "Revenir en haut de la page" : "Accueil Excellence Summit"}
            className="flex min-w-0 items-center gap-2 rounded-full pr-1 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 sm:gap-2.5 sm:pr-2"
          >
            <Image
              src="/images/church-crest.webp"
              alt="Église La Cité d'Excellence"
              width={36}
              height={36}
              className="shrink-0 rounded-full object-cover ring-1 ring-gold-400/60 size-8 sm:size-9"
              preload
            />
            <span className="truncate font-display text-[15px] font-semibold tracking-wide text-gold-200 sm:text-lg">
              Excellence Summit
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  item.active
                    ? "bg-white/15 text-gold-300"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/badge"
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition-colors whitespace-nowrap ${
                pathname === "/badge"
                  ? "bg-gold-400 font-semibold text-royal-950"
                  : "border border-gold-400/40 bg-gold-400/12 font-medium text-gold-200 hover:bg-gold-400/20"
              }`}
            >
              <QrCode className="size-4" strokeWidth={1.75} />
              <span>{t.nav.badge}</span>
            </Link>
          </div>

          <div className="hidden items-center gap-1 rounded-full border border-white/15 bg-white/5 p-0.5 md:flex">
            <button
              type="button"
              onClick={() => setLocale("fr")}
              aria-pressed={locale === "fr"}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors active:scale-[0.96] ${
                locale === "fr"
                  ? "bg-gold-400 text-royal-950"
                  : "text-white/75 hover:text-white"
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setLocale("en")}
              aria-pressed={locale === "en"}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors active:scale-[0.96] ${
                locale === "en"
                  ? "bg-gold-400 text-royal-950"
                  : "text-white/75 hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:hidden">
            <Link
              href="/badge"
              aria-label={t.nav.badge}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-gold-400/40 bg-gold-400/15 px-2.5 text-[11px] font-semibold text-gold-200 transition-colors hover:bg-gold-400/25 active:scale-[0.96] sm:h-10 sm:px-3 sm:text-xs"
            >
              <QrCode className="shrink-0 size-3.5" strokeWidth={1.8} />
              <span className="min-[400px]:hidden">Badge</span>
              <span className="hidden min-[400px]:inline">{t.nav.badge}</span>
            </Link>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={t.nav.openMenu}
              aria-expanded={drawerOpen}
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-transform size-10 active:scale-[0.96] sm:size-11"
            >
              <Menu className="size-5" strokeWidth={1.75} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {drawerOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="no-print fixed inset-0 z-50 flex items-end bg-royal-950/70 backdrop-blur-sm md:hidden"
            onClick={() => setDrawerOpen(false)}
          >
            <motion.nav
              aria-label="Menu mobile"
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 48, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-t-3xl border-t border-gold-400/35 bg-royal-900 px-5 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-white shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Image
                    src="/images/church-crest.webp"
                    alt="La Cité d'Excellence"
                    width={36}
                    height={36}
                    className="rounded-full object-cover ring-1 ring-gold-400/60 size-9"
                  />
                  <div>
                    <p className="font-display text-lg font-semibold text-gold-200">
                      Excellence Summit
                    </p>
                    <p className="text-xs text-white/65">01 – 06 Déc. 2026</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label={t.nav.closeMenu}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 text-white size-11 active:scale-[0.96]"
                >
                  <X className="size-5" strokeWidth={1.75} />
                </button>
              </div>

              <div className="grid gap-2">
                <Link
                  href="/"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-white hover:bg-white/10"
                >
                  {t.nav.home}
                </Link>
                <Link
                  href={isHome ? "#programme" : "/#programme"}
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-white hover:bg-white/10"
                >
                  {t.nav.programme}
                </Link>
                <Link
                  href="/intervenants"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-white hover:bg-white/10"
                >
                  {t.nav.speakers}
                </Link>
                <Link
                  href={isHome ? "#inscription" : "/#inscription"}
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-xl bg-gold-400 px-4 py-3 text-center text-base font-bold text-royal-950 active:scale-[0.98]"
                >
                  {t.nav.register}
                </Link>
                <Link
                  href="/badge"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-gold-400/35 bg-white/5 px-4 py-3 text-base font-medium text-gold-200"
                >
                  <span>{t.nav.badge}</span>
                  <QrCode className="size-5" strokeWidth={1.75} />
                </Link>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-xs font-medium text-white/70">
                  {t.nav.switchLang}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLocale("fr")}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                      locale === "fr"
                        ? "bg-gold-400 text-royal-950"
                        : "border border-white/20 text-white/80"
                    }`}
                  >
                    Français
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocale("en")}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                      locale === "en"
                        ? "bg-gold-400 text-royal-950"
                        : "border border-white/20 text-white/80"
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

