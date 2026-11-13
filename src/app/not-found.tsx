import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#070d1f] text-[#f8f5ec] flex items-center justify-center px-6 py-20">
      <div className="max-w-lg w-full rounded-3xl border border-[#d4af37]/30 bg-[#0d1633]/90 p-8 sm:p-10 text-center shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4af37]">
          Excellence Summit 2026
        </p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight text-white">
          404
        </h1>
        <h2 className="mt-3 text-xl font-semibold text-[#f8f5ec]">
          Page introuvable
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
          Revenez à l&apos;accueil pour consulter le programme ou obtenir votre
          badge officiel.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#d4af37] px-6 py-3 text-sm font-semibold text-[#070d1f] transition hover:bg-[#e3c256]"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/intervenants"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-[#d4af37]/40 px-6 py-3 text-sm font-semibold text-[#f8f5ec] transition hover:border-[#d4af37] hover:bg-white/5"
          >
            Voir les intervenants
          </Link>
        </div>
      </div>
    </main>
  );
}

