# Excellence Summit 2026 — Masterclasses & Convention

Plateforme d'inscription guidée (onboarding), génération de Pass QR et dashboard de suivi / vérification pour la **1re Convention/26 — Excellence Summit** (*Houekin Ministries Int. · Église La Cité d'Excellence*).

## Fonctionnalités principales

- **Site vitrine bilingue (`FR` / `EN`)** aux couleurs de l'affiche officielle (bleu royal, or impérial, accent rouge vermillon).
- **Programme détaillé** du **01 au 06 décembre 2026** (Cité d'Excellence Abomey-Calavi & Majestic de Cadjehoun).
- **Orateurs invités & Couple Prophétique Hôte** (`/`, `/intervenants`) avec présentation modale et fiches centralisées dans [`src/data/speakers.ts`](src/data/speakers.ts).
- **Onboarding d'inscription en 3 étapes** (`#inscription`) avec confirmation immédiate, numéro unique `ES26-XXXXXX`, QR code vérifié cryptographiquement, téléchargement PNG, impression et envoi automatique par e-mail via **Brevo** (sans nom de domaine requis) ou **Resend**.
- **Portail Badge (`/badge`)** : recherche par référence `ES26-...`, e-mail ou téléphone, avec historique des passages enregistrés.
- **Dashboard de suivi & pointage (`/dashboard`)** accessible directement par URL (`/dashboard/login`) et protégé par mot de passe :
  - Scanner QR caméra intégré + saisie manuelle
  - Mises à jour temps réel via **Neon Realtime** (avec rafraîchissement manuel de secours)
  - Suivi des présences par jour/session (avec détection de double passage et badges annulés)
  - Filtres multi-critères, gestion des statuts, renvoi d'e-mail, export CSV UTF-8
  - Suivi des questions envoyées via le widget support flottant

## Configuration locale

1. Copiez `.env.example` vers `.env.local` et renseignez vos variables :

   - **Neon PostgreSQL** : `DATABASE_URL` (pooled) et `DATABASE_URL_UNPOOLED` (migrations Drizzle)
   - **Neon Realtime** *(optionnel)* : `NEON_REALTIME_URL`, `NEXT_PUBLIC_NEON_REALTIME_URL`, `NEON_REALTIME_SECRET`
   - **E-mail transactionnel** : **Brevo** (`BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`) ou **Resend** (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`)
   - **Sécurité Admin** : `ADMIN_PASSWORD` et `ADMIN_SESSION_SECRET` (chaîne aléatoire ≥ 32 caractères, générable via `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

2. Poussez le schéma Drizzle vers votre base **Neon** :

```bash
npm run db:push
```

3. Lancez le serveur de développement :

```bash
npm run dev
```

## Déploiement sur Vercel

1. Renseignez toutes les variables d'environnement de production dans **Vercel → Project Settings → Environment Variables** (sans oublier un `ADMIN_SESSION_SECRET` aléatoire ≥ 32 caractères et votre `ADMIN_PASSWORD`).
2. `NEXT_PUBLIC_SITE_URL` est optionnelle si vous utilisez le sous-domaine `.vercel.app` : en production Vercel, l'application résout automatiquement `VERCEL_PROJECT_PRODUCTION_URL`. Si vous ajoutez un domaine personnalisé plus tard, mettez à jour `NEXT_PUBLIC_SITE_URL`.
3. Vérifiez que le schéma est appliqué sur la base Neon de production (`npm run db:push`).
4. Après déploiement, contrôlez l'état des services sur `/api/health` (`status: "ok"`, `database: true`, `emailConfigured: true`, `adminConfigured: true`).

## Vérifications disponibles

```bash
npm run typecheck
npm run lint
npm run build
```

