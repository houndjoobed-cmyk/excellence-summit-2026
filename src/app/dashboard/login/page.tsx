"use client";

import { AlertCircle, ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { TitleSync } from "@/components/TitleSync";

export default function DashboardLoginPage() {
  const { locale } = useLocale();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEn = locale === "en";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        setErrorMsg(
          data?.error?.message ||
          (isEn ? "Invalid password." : "Mot de passe incorrect."),
        );
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMsg(
        isEn ? "Connection error." : "Erreur de connexion au serveur.",
      );
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-royal-grid px-5 py-12 text-white">
      <TitleSync pageKey="loginTitle" />

      <div className="w-full max-w-md rounded-3xl border border-gold-400/40 bg-white p-7 text-ink shadow-2xl sm:p-9">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/images/church-crest.webp"
            alt="La Cité d'Excellence"
            width={60}
            height={60}
            className="h-15 w-15 rounded-full object-cover ring-2 ring-gold-400"
          />
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-royal-900/6 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-royal-900">
            <ShieldCheck className="h-3.5 w-3.5 text-gold-600" />
            <span>
              {isEn ? "Organizing Team Access" : "Accès Équipe d'Organisation"}
            </span>
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold text-royal-900">
            {isEn ? "Dashboard Sign In" : "Connexion Dashboard"}
          </h1>
          <p className="mt-1 text-xs text-ink-muted">
            {isEn
              ? "Manage registrations and verify QR badges at the entrance."
              : "Suivi des inscriptions et vérification des badges QR."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="admin-password"
              className="mb-1.5 block text-xs font-semibold text-ink"
            >
              {isEn ? "Administrator Password" : "Mot de passe administrateur"}
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                id="admin-password"
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-10 text-sm outline-none focus:border-royal-800 focus:ring-2 focus:ring-royal-800/15"
              />
            </div>
          </div>

          {errorMsg ? (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-crimson-600"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-royal-900 py-3 text-sm font-bold text-gold-300 shadow-md transition-colors hover:bg-royal-800 active:scale-[0.96] disabled:opacity-60"
          >
            {loading
              ? isEn
                ? "Signing in..."
                : "Connexion..."
              : isEn
                ? "Access Dashboard"
                : "Accéder au Dashboard"}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-royal-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{isEn ? "Return to public site" : "Retour au site public"}</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

