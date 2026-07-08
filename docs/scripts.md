# Scripts reference

Every script under `scripts/` (plus the `src/import` CLI). Run all from the repo
root. "Idempotent" = safe to re-run; "Destructive" = drops/overwrites data.

Media-creating scripts flush S3 before exit and build a fresh `context` per
file-carrying `payload.create` — see the CLAUDE.md "Media storage" traps before
editing any of them.

## Content pipeline (fresh-DB seed order)

Run in this order into an empty DB: **migrate → import (each name) → `import:prose` → `import:slider` → `seed:pages`.** Getting the order wrong leaves empty Team/AcademyVideos blocks or dangling stub Media (see CLAUDE.md "Seeding").

| Command | Script | What | Notes |
|---|---|---|---|
| `npm run import -- <name>` | `src/import/cli.ts` | Import a content collection from the gitignored `migration/webflow_cms_data` CSVs, re-hosting photos. Names: `team`, `testimonials-career`, `testimonials-programs`, `academy-videos`, `updates` (`dependsOn` auto-resolves categories). | Idempotent (upsert by key). Registry: `src/import/registry.ts`. |
| `npm run import:prose` | `import-prose.ts` | Re-host prose/partner/hero images and write committed artifacts to `src/seed/prose/*.json`. | Idempotent. Must run before `seed:pages`. |
| `npm run import:slider` | `import-slider.ts` | Import the 40 home-hero carousel photos (Webflow "Sliders") as `slider-*` Media. | Idempotent by filename. Before `seed:pages`. |
| `npm run rehost:images` | `rehost-images.ts` | Re-host a fixed list of export/CDN images (incl. partner logos from the live Webflow CDN) as Media. Raster only — SVGs skipped. | Idempotent by stored `.webp` filename. |
| `npm run seed:pages` | `seed-pages.ts` | Assemble every registered Page (home, contact, about-us roster, …). `ensureTrackedMedia` first creates any missing prose images from `public/import/prose`. `seed:about` is an alias. | Idempotent (upsert by slug). Resolves Team/video blocks **by category at seed time**, so it must run last. |

## Environment sync (Railway)

All are Node scripts (not bash: `npm run` on Windows resolves `bash` to WSL where the `railway` shim dies). All need Docker (`postgres:18` + `amazon/aws-cli` in throwaway containers) and a logged-in `railway`. See CLAUDE.md "Deployment" and ADR 0002.

| Command | Script | Direction | What |
|---|---|---|---|
| `npm run refresh:staging [-- --yes]` | `refresh-staging.mjs` | prod → staging | Mirror prod bucket → staging bucket and restore a full `pg_dump` of prod into staging. Direction-locked; prod is read-only. |
| `npm run refresh:local [-- --yes]` | `refresh-local.mjs` | prod → local | Mirror prod bucket → local MinIO bucket and restore a full `pg_dump` of prod into the local dev DB. Prod comes from Railway; the local target from `.env` (`DATABASE_URL` + `S3_*`). Direction-locked to a **loopback** target (refuses prod/staging); prod is read-only. Keeps the `form_submissions` PII scrub. Containers reach host Postgres/MinIO via `host.docker.internal` (Docker Desktop). Destructive to local. |
| `npm run refresh:staging:check` / `refresh:local:check` | `refresh-lock.check.mjs` | — | No-infra self-check of both direction locks and the PII scrubs (same file). |
| `npm run backup:prod [-- --out <dir>]` | `backup-prod.mjs` | prod → local/offsite | Read-only offsite backup of prod: gzipped full `pg_dump` (+ `.sha256`) into `<out>/db/` and an incremental `s3 sync` of the media bucket into `<out>/media/`. Creds pulled live from Railway. Point `--out` at a synced cloud folder. Default out `./backups` (gitignored). Restore drill: `docs/restore-drill.md`. |
| `npm run ensure:admin` | `ensure-admin.ts` | env (via `DATABASE_URL`) | Ensure a Payload admin `User` from `ADMIN_EMAIL`/`ADMIN_PASSWORD`: match by email, create when absent, reset password when present. No S3 writes, so safe against a remote env. Point `DATABASE_URL` at the target. Idempotent. |

## One-off maintenance

Run directly with tsx (no npm script). Each skips work already done.

| Script | What | Safety |
|---|---|---|
| `node --import tsx/esm scripts/publish-one-update.ts <slug>` | Import a single Latest-Updates row and force it published regardless of the Webflow `Draft` flag. | Idempotent (upsert). |
| `node --import tsx/esm scripts/set-focal.ts` | Bias CardGrid card focal points toward the top (heads stay in the object-cover crop). Skips images already moved off-centre. | Idempotent. |
| `npx tsx scripts/trim-logo-padding.ts` | `sharp.trim()` baked-in padding off partner logos so object-contain scales the real artwork consistently. | Idempotent. |
| `node --import tsx/esm scripts/purge-junk-pages.ts` | Drop `E2E CRUD*` test pages and empty autosave-orphan drafts from the shared dev DB. | Idempotent. Dev DB only. |
| `node --import tsx/esm scripts/wipe-media.ts` | **Delete every Media doc + versions.** For a storage-backend switch (disk ↔ S3); re-run the image imports afterward, then re-seed pages. | **Destructive.** |

## Infra

| Script | What |
|---|---|
| `scripts/ensure-docker.ps1` | `predev` hook: best-effort boot Docker Desktop + `docker compose up -d` (MinIO). Always exits 0. |
