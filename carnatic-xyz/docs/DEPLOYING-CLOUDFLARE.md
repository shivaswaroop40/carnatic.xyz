# Deploying carnatic.xyz to Cloudflare

This guide walks through deploying the Next.js app to **Cloudflare Pages** (with Workers and bindings for D1 and KV). R2 is not used (no audio file uploads).

## Prerequisites

- **Node.js** 20+ and npm
- **Cloudflare account** ([sign up](https://dash.cloudflare.com/sign-up))
- **Git** (for GitHub integration and CLI deploy)
- **Workers Paid** recommended: the Free plan allows only **10 ms CPU per request**; this Next.js app needs more. Upgrade at [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers) → **Upgrade** or [pricing](https://developers.cloudflare.com/workers/platform/pricing/).

## 1. Cloudflare resources

Create these in the [Cloudflare dashboard](https://dash.cloudflare.com) before first deploy.

### D1 database

1. Go to **Workers & Pages** → **D1** → **Create database**.
2. Name: `carnatic-music-db`.
3. After creation, open the database and copy the **Database ID** (UUID).
4. In `wrangler.jsonc`, set `database_id` under `d1_databases` to this UUID (replace the placeholder `00000000-0000-0000-0000-000000000000`).

### R2 bucket (skipped)

Audio file uploads and R2 are not used. No R2 bucket or binding is configured.

### KV namespace (optional)

KV is optional; the app runs without it (no API response caching). To enable:

1. Go to **Workers & Pages** → **KV** → **Create namespace**.
2. Name it (e.g. `carnatic-cache`).
3. Copy the **Namespace ID** (32-char hex).
4. In `wrangler.jsonc`, add a `kv_namespaces` array with `binding: "CACHE"` and this `id`.
5. In `cloudflare-env.d.ts`, change `CACHE?: KVNamespace` to `CACHE: KVNamespace`.

---

### (Optional) Custom domain

- In **Workers & Pages** → your project → **Custom domains**, add e.g. `carnatic.xyz` and follow DNS instructions.
- **If you see "already has externally managed DNS records"**: The zone already has an A or CNAME for that hostname. In **DNS** → **Records** for the zone, delete (or temporarily remove) the existing **A** or **CNAME** record for `carnatic.xyz` (and `www` if needed), then add the custom domain again in Workers & Pages. Cloudflare will create the correct record for the Worker.

---

## 2. Wrangler configuration

Edit **`wrangler.jsonc`** in the repo root:

- **`d1_databases[0].database_id`** – your D1 database UUID.
- **`vars.NEXT_PUBLIC_APP_URL`** – production URL (e.g. `https://carnatic.xyz`).
- Optional: **`kv_namespaces`** if you created a KV namespace for caching.

Do **not** commit real API keys or secrets into wrangler; use [Cloudflare secrets](https://developers.cloudflare.com/workers/configuration/secrets/) or env vars in CI.

---

## 3. Environment variables and secrets

### Required for the app

- **Clerk (auth):**  
  In [Clerk Dashboard](https://dashboard.clerk.com) create an application and get:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`  
  For production, set these as **Cloudflare Workers secrets** (see below) or in Pages build env.

- **Contact / suggestion form (optional):**  
  The `/contact` page sends suggestions to **contact-me@shivu.io** via [Resend](https://resend.com). To enable the form in production, set:
  - `RESEND_API_KEY` – create an API key at [Resend](https://resend.com/api-keys).
  - `RESEND_FROM` (optional) – sender address, e.g. `Carnatic.xyz <contact@carnatic.xyz>`. If unset, uses Resend’s onboarding domain. For a custom domain, verify it in the Resend dashboard.
  If `RESEND_API_KEY` is not set, the form returns a friendly error and users are prompted to email **contact-me@shivu.io** directly.

### Setting secrets (Cloudflare)

After the first deploy, set secrets so the Worker can use them at runtime:

```bash
npx wrangler secret put CLERK_SECRET_KEY
npx wrangler secret put NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```

Or in the dashboard: **Workers & Pages** → your project → **Settings** → **Variables and Secrets**.

### Build-time env (for OpenNext/Clerk)

If your build needs env vars (e.g. `NEXT_PUBLIC_*`), configure them in:

- **GitHub Actions:** Repository **Settings** → **Secrets and variables** → **Actions** (e.g. `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`), and pass them into the build step.
- **Cloudflare Pages (Connect to Git):** **Settings** → **Environment variables** for the production environment.

---

## 4. Database migrations (D1)

Run migrations against the **production** D1 database once (or when you add new migrations):

```bash
npx wrangler d1 migrations apply carnatic-music-db --remote
```

Use `--remote` for the live DB; omit for local. Run this after creating the D1 database and before or right after first deploy.

---

## 5. Seed data (optional)

To load initial ragas, composers, and compositions:

**Option A – Seed file on remote only**

```bash
npm run seed:remote
```

This runs `scripts/seed.sql` on the remote D1 database (72 melakartas, 2 janyas, 2 composers, 1 composition, 2 resources).

**Option B – Replicate local → remote (compare and sync)**

If you develop with a local D1 and want production to match it exactly:

1. Ensure local has schema and data:
   ```bash
   npx wrangler d1 migrations apply carnatic-music-db --local
   npm run seed
   ```
   (Or use `scripts/seed-generated.sql` if you ran `node scripts/generate-seed.mjs`.)

2. Export local, clear remote, and re-import:
   ```bash
   npm run db:push
   ```
   This runs `scripts/sync-d1-local-to-remote.mjs`: exports local (data only), clears remote tables in FK order, then applies the export to remote. It also prints row counts (local vs remote before/after).

**Other commands**

- `npm run db:export-local` – export local D1 to `scripts/local-export.sql` (data only, `--no-schema`).
- To load the generated seed on remote: `npx wrangler d1 execute carnatic-music-db --remote --file=scripts/seed-generated.sql`

---

## 6. Deploy from your machine (CLI)

1. Install dependencies and build:

   ```bash
   npm ci
   npm run build
   ```

   The build uses `@opennextjs/cloudflare` and produces `.open-next/` (worker + assets).

2. Log in to Cloudflare (if not already):

   ```bash
   npx wrangler login
   ```

3. Deploy:

   ```bash
   npm run deploy
   ```

   This runs `opennextjs-cloudflare build && opennextjs-cloudflare deploy`, which builds and then deploys the Worker and assets to Cloudflare.

4. Set secrets (if not set yet):

   ```bash
   npx wrangler secret put CLERK_SECRET_KEY
   npx wrangler secret put NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   ```

Your site will be live at the Worker route (e.g. `*.workers.dev`) or your custom domain.

---

## 7. Deploy via GitHub Actions (CI/CD)

The repo includes a workflow that builds and deploys on push to `main`.

### One-time setup

1. **Cloudflare API token**  
   - [Create an API token](https://dash.cloudflare.com/profile/api-tokens) with **“Edit Cloudflare Workers”** or **“Cloudflare Pages Edit”** permission (and optionally “D1 Edit” if you run migrations from CI).  
   - In your GitHub repo: **Settings** → **Secrets and variables** → **Actions** → **New repository secret** → name: `CLOUDFLARE_API_TOKEN`, value: the token.

2. **Cloudflare account ID**  
   - In GitHub: **Settings** → **Secrets and variables** → **Actions** → **Variables** → **New repository variable** → name: `CLOUDFLARE_ACCOUNT_ID`, value: your Cloudflare account ID (find it in the dashboard URL when viewing Workers, or under **Workers & Pages** → **Overview** in the right sidebar).  
   - This avoids Wrangler calling the `/memberships` API, which can fail with some tokens (auth error 10001).

3. **Wrangler config**  
   - Ensure `wrangler.jsonc` has the correct **production** `database_id` and KV `id` (and optional `vars`).  
   - Do not put the API token in wrangler; the workflow uses the GitHub secret.

4. **Build env (Clerk, etc.)**  
   - If the build needs `CLERK_SECRET_KEY` or `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, add them as GitHub Actions secrets and pass them into the deploy job (see `.github/workflows/deploy.yml`).

### What the workflow does

- **Lint:** runs `npm run lint` on the codebase.
- **Deploy:** on push to `main`, runs `npm ci`, then `npm run deploy` with `CLOUDFLARE_API_TOKEN` set, so every merge to `main` deploys to Cloudflare.

Trigger a deploy by pushing to `main` or by re-running the workflow from the **Actions** tab.

---

## 7b. Connect Cloudflare project to this Git repository (dashboard)

To link your **existing** Cloudflare Worker (e.g. `carnatic-xyz`) to the GitHub repo so Cloudflare runs builds on every push (alternative to GitHub Actions):

1. **Install the GitHub App**  
   - Go to [Cloudflare Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages).  
   - Open your Worker project **carnatic-xyz** (or create it first via **Create** → **Worker** and then connect Git).  
   - Go to **Settings** → **Builds** → **Manage** under **Git Repository** (or **Connect to Git** if not connected yet).

2. **Connect the repository**  
   - Choose **GitHub** and authorize the [Cloudflare Workers and Pages](https://github.com/apps/cloudflare-workers-and-pages) app if prompted.  
   - Select **Repository**: `shivaswaroop40/carnatic.xyz` (or your fork).  
   - **Branch**: `main`.

3. **Build configuration**  
   - **Build command:** `npm ci`  
   - **Deploy command:** `npm run deploy`  
   - **Root directory:** If this repo is the **carnatic-xyz** app at the repo root, leave blank. If the repo root is a parent folder and the app lives in `carnatic-xyz`, set **Root directory** to `carnatic-xyz`.

4. **Save**  
   - Cloudflare will run a build on the next push to `main` and on any manual retry.  
   - Optional: under **Build variables and secrets**, add `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` if the build or runtime needs them.

You can use **either** GitHub Actions (Section 7) **or** Cloudflare’s Git integration (this section); both deploy on push to `main`.

---

## 8. Cloudflare “Connect to Git” (alternative)

Instead of GitHub Actions, you can let Cloudflare build and deploy on every push:

1. **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → choose the repo and branch (e.g. `main`).
2. **Build configuration:**
   - **Framework preset:** None (or Next.js if available; we use a custom build).
   - **Build command:** `npx @opennextjs/cloudflare build`
   - **Build output directory:** `.open-next` (or leave default and check OpenNext docs for Pages).
   - **Root directory:** (blank if repo root).
3. Add **Environment variables** for production (e.g. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).
4. For **D1 and KV**, configure bindings in the Pages project settings if the UI supports it; otherwise CLI deploy or the GitHub Action may be easier.

Note: OpenNext for Cloudflare is tuned for Workers. If you use “Connect to Git” with Pages, confirm in [OpenNext Cloudflare docs](https://opennext.js.org/cloudflare) that the build output and bindings match.

---

## 9. Troubleshooting

| Issue | What to check |
|-------|----------------|
| **Worker exceeded resource limits** (Error 1102) | On **Workers Free**, CPU time is **10 ms per request**; a Next.js app doing SSR exceeds this. **Fix:** Upgrade to [Workers Paid](https://developers.cloudflare.com/workers/platform/pricing/) ($5/month) for 30 s CPU/request. In Dashboard: **Workers & Pages** → **Overview** → **Upgrade** (or add a paid Workers subscription). After upgrading, the error should stop. Optionally set `limits.cpu_ms` in `wrangler.jsonc` (see [Cloudflare limits](https://developers.cloudflare.com/workers/platform/limits/#cpu-time)). |
| Build fails in CI | Node version (e.g. 20), `npm ci` and `npm run build` locally, env vars (Clerk keys) in GitHub secrets. |
| 500 / runtime errors | D1/KV bindings and IDs in `wrangler.jsonc`, and that migrations have been applied to the remote D1 DB. |
| Auth not working | Clerk keys set as Cloudflare secrets or build env; `NEXT_PUBLIC_APP_URL` matches the site URL in Clerk. |
| R2 error 10042 / "enable R2" | Not used; R2 has been removed from this project. |
| Assets 404 | Worker and assets deployed together via `opennextjs-cloudflare deploy`; do not deploy only the worker. |
| **Local: changes not visible** | Run from repo root (`carnatic-xyz`). Use `npm run dev:clean` or delete `.next` and run `npm run dev`; hard refresh (Cmd+Shift+R) or disable browser cache. For full Cloudflare bindings, use `npm run preview` (rebuilds on each run). |

For more on OpenNext and Wrangler:

- [OpenNext Cloudflare](https://opennext.js.org/cloudflare)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
