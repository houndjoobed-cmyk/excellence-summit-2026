import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";
import type { ReactNode } from "react";
import { ClarityAnalytics } from "@/components/ClarityAnalytics";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getPublicSiteOrigin } from "@/lib/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getPublicSiteOrigin()),
  title: "Excellence Summit 2026 · Masterclass & Convention — Houekin Ministries Int.",
  description:
    "1re Convention/26 — Bâtir une génération prophétique & royale. Du 01 au 06 décembre 2026 à Abomey-Calavi & Cotonou. Inscription gratuite avec badge QR officiel.",
  icons: {
    icon: "/images/church-crest.webp",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Excellence Summit 2026",
    title:
      "Excellence Summit 2026 · Masterclass & Convention — Houekin Ministries Int.",
    description:
      "1re Convention/26 — Bâtir une génération prophétique & royale. Du 01 au 06 décembre 2026 à Abomey-Calavi & Cotonou. Inscription gratuite avec badge QR officiel.",
    images: [
      {
        url: "/images/poster-convention.webp",
        alt: "Excellence Summit 2026 — Masterclass & Convention",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Excellence Summit 2026 · Masterclass & Convention",
    description:
      "1re Convention/26 — Bâtir une génération prophétique & royale. Du 01 au 06 décembre 2026 à Abomey-Calavi & Cotonou.",
    images: ["/images/poster-convention.webp"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-[#fafaf7] text-[#071338] antialiased">
        <LocaleProvider>
          <ClarityAnalytics />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}

