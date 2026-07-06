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

Both are Node scripts (not bash: `npm run` on Windows resolves `bash` to WSL where the `railway` shim dies). Both need Docker (`postgres:18` + `amazon/aws-cli` in throwaway containers) and a logged-in `railway`. See CLAUDE.md "Deployment" and ADR 0002.

| Command | Script | Direction | What |
|---|---|---|---|
| `npm run refresh:staging [-- --yes]` | `refresh-staging.mjs` | prod → staging | Mirror prod bucket → staging bucket and restore a full `pg_dump` of prod into staging. Direction-locked; prod is read-only. |
| `npm run push:content -- --to staging\|prod [--yes]` | `push-content.mjs` | local scratch → env | Bulk-copy a locally built + verified content set (scratch DB + MinIO bucket) up. Source locked to localhost; `--to prod` always prompts. Strips the `dev` migration marker after restore (else the target's preDeploy `migrate` hangs). Defaults: `SRC_DATABASE_URL=…/payload_bootstrap`, `SRC_S3_BUCKET=bootstrap-media`. |

## One-off maintenance

Run directly with tsx (no npm script). Each skips work already done.

| Script | What | Safety |
|---|---|---|
| `node --import tsx/esm scripts/publish-one-update.ts <slug>` | Import a single Latest-Updates row and force it published regardless of the Webflow `Draft` flag. | Idempotent (upsert). |
| `node --import tsx/esm scripts/set-focal.ts` | Bias CardGrid card focal points toward the top (heads stay in the object-cover crop). Skips images already moved off-centre. | Idempotent. |
| `npx tsx scripts/trim-logo-padding.ts` | `sharp.trim()` baked-in padding off partner logos so object-contain scales the real artwork consistently. | Idempotent. |
| `node --import tsx/esm scripts/purge-junk-pages.ts` | Drop `E2E CRUD*` test pages and empty autosave-orphan drafts from the shared dev DB. | Idempotent. Dev DB only. |
| `node --import tsx/esm scripts/wipe-media.ts` | **Delete every Media doc + versions.** For a storage-backend switch (disk ↔ S3); re-run the image imports afterward, then re-seed pages. | **Destructive.** |
| `node --import tsx/esm scripts/seed-about-pages.ts` | Legacy standalone seed for the three about-us roster pages. **Superseded** — `seed:pages` now covers these; kept only for reference. | Idempotent, but prefer `seed:pages`. |

## Infra

| Script | What |
|---|---|
| `scripts/ensure-docker.ps1` | `predev` hook: best-effort boot Docker Desktop + `docker compose up -d` (MinIO). Always exits 0. |
