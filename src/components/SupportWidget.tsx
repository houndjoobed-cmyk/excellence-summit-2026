"use client";

import {
  CheckCircle2,
  MessageCircleQuestion,
  PhoneCall,
  Send,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { EVENT_INFO } from "@/data/event";

export function SupportWidget() {
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fabRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        fabRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function handleClose() {
    setOpen(false);
    fabRef.current?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message, locale }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        setErrorMsg(data?.error?.message || t.onboarding.errors.generic);
        setSubmitting(false);
        return;
      }

      setSent(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      setErrorMsg(t.onboarding.errors.generic);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.support.fabLabel}
        className="no-print fixed right-5 bottom-5 z-40 inline-flex h-13 w-13 items-center justify-center rounded-full border border-gold-400/50 bg-royal-900 text-gold-300 shadow-[0_12px_32px_rgba(4,18,71,0.45)] transition-transform hover:scale-105 hover:bg-royal-800 active:scale-[0.96]"
      >
        <MessageCircleQuestion className="h-6 w-6" strokeWidth={1.85} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="no-print fixed inset-0 z-50 flex items-end justify-end bg-royal-950/55 p-4 backdrop-blur-xs sm:items-end sm:p-6"
            onClick={handleClose}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="support-dialog-title"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-gold-400/35 bg-white text-ink shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3 bg-royal-900 px-5 py-4 text-white">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gold-300">
                    {EVENT_INFO.brand}
                  </p>
                  <h2
                    id="support-dialog-title"
                    className="font-display text-xl font-semibold"
                  >
                    {t.support.title}
                  </h2>
                  <p className="mt-0.5 text-xs text-white/75">
                    {t.support.subtitle}
                  </p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={handleClose}
                  aria-label={t.support.close}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-[0.96]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5">
                {sent ? (
                  <div className="py-6 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                    <h3 className="mt-3 font-display text-2xl font-semibold text-royal-900">
                      {t.support.successTitle}
                    </h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      {t.support.successText}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      className="mt-5 rounded-full border border-royal-900/20 px-4 py-2 text-xs font-semibold text-royal-900 hover:bg-royal-900/5"
                    >
                      {t.support.sendAnother}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                      <label
                        htmlFor="support-name"
                        className="mb-1 block text-xs font-semibold text-ink"
                      >
                        {t.support.nameLabel}
                      </label>
                      <input
                        id="support-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-royal-700 focus:ring-2 focus:ring-royal-700/15"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="support-email"
                          className="mb-1 block text-xs font-semibold text-ink"
                        >
                          {t.support.emailLabel}
                        </label>
                        <input
                          id="support-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-royal-700 focus:ring-2 focus:ring-royal-700/15"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="support-phone"
                          className="mb-1 block text-xs font-semibold text-ink"
                        >
                          {t.support.phoneLabel}
                        </label>
                        <input
                          id="support-phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-royal-700 focus:ring-2 focus:ring-royal-700/15"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="support-message"
                        className="mb-1 block text-xs font-semibold text-ink"
                      >
                        {t.support.messageLabel}
                      </label>
                      <textarea
                        id="support-message"
                        rows={3}
                        required
                        minLength={8}
                        placeholder={t.support.messagePlaceholder}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-royal-700 focus:ring-2 focus:ring-royal-700/15"
                      />
                    </div>

                    {errorMsg ? (
                      <p
                        role="alert"
                        className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-crimson-600"
                      >
                        {errorMsg}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-royal-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-royal-800 active:scale-[0.96] disabled:opacity-60"
                    >
                      <Send className="h-4 w-4" />
                      <span>
                        {submitting ? t.support.sending : t.support.sendBtn}
                      </span>
                    </button>
                  </form>
                )}

                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    {t.support.whatsappCta}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {EVENT_INFO.contacts.map((c) => (
                      <a
                        key={c.display}
                        href={`https://wa.me/${c.wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        <span className="tabular-nums">{c.display}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

