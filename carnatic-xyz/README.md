# carnatic.xyz

Carnatic music platform: raga discovery, lyrics and notation library, learning hub, and community features. Built with **Next.js**, **Cloudflare** (Pages, D1, KV), **Clerk**, and **Drizzle ORM**.

---

## Table of contents

- [Repo structure](#repo-structure)
- [Setup](#setup)
- [Run locally](#run-locally)
- [Build & deploy](#build--deploy)
- [Debug & develop](#debug--develop)
- [Features](#features)
- [Credits & sources](#credits--sources)

---

## Repo structure

```
carnatic-xyz/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI: lint + deploy to Cloudflare on push to main
├── docs/
│   └── DEPLOYING-CLOUDFLARE.md # Full Cloudflare deployment guide
├── drizzle/
│   ├── schema.ts               # Drizzle schema (ragas, composers, compositions, etc.)
│   └── migrations/             # SQLite migrations for D1
├── scripts/
│   ├── data/
│   │   ├── compositions.json   # Optional: composition entries (merged into seed)
│   │   ├── karnatik-urls.json   # Optional: slug → karnatik URL for lyrics fetch
│   │   └── README.md           # Data format notes
│   ├── generate-seed.mjs       # Generates seed-generated.sql from ragas/composers/compositions
│   ├── fetch-karnatik-lyrics.mjs # Fetches lyrics/meanings from karnatik.com into compositions.json
│   ├── seed.sql                # Minimal seed for local D1
│   └── seed-generated.sql      # Generated full seed (run generate-seed.mjs first)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes (ragas, compositions, composers, search, audio, etc.)
│   │   ├── ragas/, compositions/, composers/, learn/, community/, search/, credits/, contribute/
│   │   ├── layout.tsx
│   │   └── page.tsx            # Home
│   ├── components/            # React components (UI + feature)
│   │   ├── ui/                 # shadcn-style components
│   │   ├── ragas/, Pagination, SiteNav, SiteFooter, etc.
│   └── lib/                    # DB helper, API client, auth, utils
├── cloudflare-env.d.ts         # Generated Cloudflare env types (npm run cf-typegen)
├── drizzle.config.ts          # Drizzle Kit config (schema + migrations path)
├── next.config.ts              # Next config + OpenNext Cloudflare dev init
├── wrangler.jsonc              # Cloudflare Workers/Pages config (D1, R2, KV bindings)
├── .dev.vars.example          # Example env file; copy to .dev.vars and add Clerk keys
└── package.json
```

**Key config files**

| File | Purpose |
|------|--------|
| `wrangler.jsonc` | Cloudflare: worker name, D1 database id, KV namespace id, vars. Update `database_id` and KV `id` for production. |
| `next.config.ts` | Next.js config; enables OpenNext Cloudflare dev bindings. |
| `drizzle.config.ts` | Drizzle dialect and migrations path for D1 (SQLite). |
| `.dev.vars` | Local secrets (Clerk keys). Not committed; copy from `.dev.vars.example`. |

---

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment (local)**
   - Copy `.dev.vars.example` to `.dev.vars`.
   - Add your [Clerk](https://dashboard.clerk.com) keys to `.dev.vars` (or leave placeholders; app runs with auth disabled if keys are missing/invalid).

3. **Database (local D1)**
   - Apply migrations:
     ```bash
     npx wrangler d1 migrations apply carnatic-music-db --local
     ```
   - **Minimal seed:** `npm run seed` (loads `scripts/seed.sql`).
   - **Full seed (100+ ragas, composers, compositions):**
     ```bash
     node scripts/generate-seed.mjs
     npx wrangler d1 execute carnatic-music-db --local --file=scripts/seed-generated.sql
     ```
     Compositions are merged from `scripts/data/compositions.json` when present (see `scripts/data/README.md`).

---

## Run locally

- **Next.js dev server (with OpenNext Cloudflare D1 bindings):**
  1. **One-time (or after pulling):** create local D1 tables and seed data from the **carnatic-xyz** directory:
     ```bash
     cd carnatic-xyz
     npm run db:local-setup
     ```
  2. Start the dev server:
     ```bash
     npm run dev
     ```
     Open [http://localhost:3000](http://localhost:3000). If you see **"no such table"** or empty compositions/ragas, **stop the dev server**, run `npm run db:local-setup` again, then start `npm run dev` from **carnatic-xyz** so it uses the same local D1 (`.wrangler/state/v3/d1`).

- **If you don’t see changes locally:**  
  Next.js (and Turbopack) can serve cached output. Clear the cache and restart:
  ```bash
  npm run dev:clean
  ```
  Or manually: `rm -rf .next` then `npm run dev`. Use a hard refresh in the browser (e.g. Cmd+Shift+R) or disable cache in DevTools while developing.

- **Preview with Cloudflare bindings (after build):**
  ```bash
  npm run preview
  ```
  Builds with OpenNext Cloudflare and runs the worker locally with D1/KV bindings. Re-run after code changes. Uses the same local D1 as `db:local-setup`.

- **Lint**
  ```bash
  npm run lint
  ```
  Runs ESLint on `src` with zero warnings. Use `npm run lint:fix` to auto-fix.

---

## Build & deploy

- **Build only:** `npm run build` (Next.js build; for Cloudflare use the deploy step which uses OpenNext).
- **Preview (local Cloudflare):** `npm run preview`
- **Deploy to Cloudflare:** `npm run deploy` (builds with OpenNext and deploys via Wrangler).

**Full deployment steps** (creating D1, KV, secrets, migrations, and CI/CD) are in **[docs/DEPLOYING-CLOUDFLARE.md](docs/DEPLOYING-CLOUDFLARE.md)**.

---

## Debug & develop

- **Logs:** Use `console.log` in API routes and server components; in production, check Cloudflare Workers logs in the dashboard.
- **DB:** Inspect local D1 with `npx wrangler d1 execute carnatic-music-db --local --command "SELECT name FROM sqlite_master WHERE type='table';"`. For remote DB use `--remote` instead of `--local`.
- **Types:** Regenerate Cloudflare env types after changing bindings: `npm run cf-typegen`.
- **Migrations:** Add schema changes in `drizzle/schema.ts`, then run `npx drizzle-kit generate` (or equivalent) to create a new migration in `drizzle/migrations`. Apply with `npx wrangler d1 migrations apply carnatic-music-db --local` (or `--remote`).
- **Auth:** Without valid Clerk keys in `.dev.vars`, sign-in/sign-up are disabled; the app still runs. Set real keys for full auth locally and in production.

---

## Features

- **Ragas** – List, filter, detail with scale and comments
- **Compositions** – Table list, detail with lyrics, notation, meaning, rendition links
- **Composers** – List and profile with works
- **Learn** – Q&A, Shruti (violin/tambura), metronome with talas
- **Community** – Public uploads list and audio detail
- **Search** – Global search API (`/api/search/global?q=...`)

---

## Credits & sources

Lyrics, raga organization, and learning structure are inspired by [karnATik](https://www.karnatik.com/) (Carnatic music – South Indian classical lyrics and reference). We attribute karnATik, its maintainer (rani), and lyric contributors (e.g. Lakshman Ragde) on our [Credits](/credits) page and link to karnATik for the most comprehensive lyrics and notations. We do not copy their full archive; we encourage using the originals.
