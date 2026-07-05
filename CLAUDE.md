# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project layout

The Next.js + Payload application lives at the **repository root** — `package.json`, `src/`, and `.env` are here. Run all commands from the root.

- `migration/` — Webflow/Relume export and brand source assets (the design system was migrated from here). **Gitignored**; not part of the build. Live logos are copied into `public/`.
- `.claude/launch.json` — used by the Claude Preview tool to start the dev server (`npm run dev`) on port 3000. Port 3000 is required (CORS / `NEXT_PUBLIC_SERVER_URL`).
- `.claude/skills/payload/` — Payload skill reference; start at `SKILL.md` for Payload-specific guidance.

## Package manager & commands

`engines` asks for pnpm, but this repo is installed with **npm** (`package-lock.json`). Run the scripts below with `npm run`. Note that the `test`, `dev:prod`, and `reinstall` scripts hardcode `pnpm`/POSIX `rm -rf` and won't work as-is under npm/Windows — invoke the underlying scripts directly instead. A POSIX shell (git-bash / the Bash tool) is available for shell syntax.

- `npm run dev` — dev server (Next + Payload) on :3000. Prefer the Claude Preview tool over running this manually.
- `npm run build` — production build (also runs `next-sitemap`).
- `npm run lint` / `npm run lint:fix` — ESLint.
- `npm run generate:types` — regenerate `src/payload-types.ts` from the Payload config. Run after any collection/field/global change.
- `npm run generate:importmap` — regenerate `src/app/(payload)/admin/importMap.js`.
- `npm run test:int` — Vitest integration tests. Single file: `npx vitest run --config ./vitest.config.mts tests/int/api.int.spec.ts`; by name: add `-t "test name"`.
- `npm run test:e2e` — Playwright e2e. Single file: `npx playwright test --config=playwright.config.ts tests/e2e/frontend.e2e.spec.ts`.
- `npm run payload -- <cmd>` — Payload CLI (e.g. `migrate:create`, `migrate`).

## Database

Requires a local PostgreSQL instance; connection via `DATABASE_URL` in `.env`. The Postgres adapter runs with `push: true` in development (schema auto-syncs, no migrations needed); use migrations (`payload migrate:create` / `migrate`) for production. Seed the DB from the admin panel's "seed database" button (destructive — drops and repopulates).

**Seeding after an admin re-seed.** The admin "seed database" button is destructive and only creates home + contact. After running it, follow up with `npm run seed:pages` to restore the full assembled-page set (about-us roster and any future registered pages). `seed:pages` is idempotent — safe to re-run. To add a new page to the set, push a `PageSlice` factory into `scripts/seed-pages.ts`. `seed:about` is now an alias for `seed:pages`.

**Content collections come from the import CLI, not the seed.** Team, Testimonials, AcademyVideos (with their categories), and Posts are populated by `npm run import -- <name>` (names: `team`, `testimonials-career`, `testimonials-programs`, `academy-videos`, `updates`), which reads the gitignored `migration/webflow_cms_data` CSVs and re-hosts photos into the bucket. Names are registered in `src/import/registry.ts`, and `dependsOn` auto-resolves (importing `team` pulls `team-categories` first). `seed:pages` only assembles the Pages; its team/video blocks resolve those collections **by category at seed time**, so it must run **after** the import. Run it before and the Team and AcademyVideos blocks come out empty (they render nothing, no error). Full fresh-DB order: **migrate → `npm run import` (team, testimonials-career, testimonials-programs, academy-videos, updates) → `import:prose` → `import:slider` → `seed:pages`**. `import:prose` (prose/partner/hero images) and `import:slider` (home slider) must both run **before** `seed:pages`, or seed creates dangling stub Media for the images they own (row, no object) and a later import skips them by filename.

**Cross-branch schema drift (dev gotcha).** With `push: true` and one shared dev DB, switching between feature branches that each add fields/blocks accumulates columns/tables in the DB that the current branch's config doesn't define. When a new block introduces a table while an old branch's table is now orphaned, drizzle-kit can't tell create from rename and **prompts interactively** ("Is X created or renamed from another table?", or a data-loss y/N). The headless dev server (Claude Preview) has no TTY to answer, so it **hangs holding the DB** — every DB-backed route (`/`, `/api/*`) stalls for tens of seconds while DB-free routes (the `/design-system/blocks` showroom) stay fast. That symptom = schema-push prompt, not slow rendering. Keep `master` ⊇ the dev DB schema: **merge block PRs promptly** (or build one block per branch and merge before the next) so the schema never diverges. The preview window auto-loads `/`, so a stalled `/` freezes it (and screenshots time out).

## Media storage (local S3 via MinIO)

Media uses `@payloadcms/storage-s3`, exercising the **same S3 code path locally as in prod** (R2/AWS). Local S3 is a MinIO container defined in `docker-compose.yml` (S3 API `:9000`, console `:9001`, creds `minioadmin`/`minioadmin`, bucket `payload-media` made public-read by a one-shot bootstrap container). Activated by the `S3_*` vars in `.env`; without them Payload falls back to local-disk storage and the container is optional.

**`predev` auto-starts it.** `npm run dev` runs `scripts/ensure-docker.ps1` first (best-effort, always exits 0): boots Docker Desktop if down, then `docker compose up -d`. So the stack normally comes up on its own — but if images 404 / blink, check `docker ps` for the MinIO container before debugging anything in app code.

**Volume name is pinned on purpose.** The media volume is declared with an explicit `name: maps-website-media` (not the Compose project-prefix default). Compose derives the project name from the directory name, so **renaming the repo dir would otherwise orphan the volume** — Compose spins up a fresh empty one and the old data (hundreds of MB) is stranded under the old prefix. Symptom: bucket empty / every `/api/media/file/*` 404s. Recover by `docker run --rm -v old_prefix_minio-data:/from -v maps-website-media:/to alpine cp -a /from/. /to/`.

**Dangling Media docs (DB row, no objects).** A Media doc can reference storage objects that don't exist (e.g. a re-upload collision left a `<name>-1.webp` duplicate holding the real files while the original doc's objects were removed). `npm run rehost:images` matches by **filename** and skips any existing doc, so it won't repair this. Fix by re-uploading the tracked source into the **existing doc by id** (`payload.update({ collection:'media', id, file:{...} })`) — this regenerates all size variants into storage and keeps the id, so seeded page references (which point at the media **id**, not filename) stay valid. No reseed needed.

`npm run rehost:images` re-hosts a fixed list of export/CDN images as Media docs (idempotent by stored `.webp` filename); see the script header for the two source lists.

**Media-creating scripts must flush before exit.** A script that creates Media via the local API has to `await payload.destroy()` before `process.exit()`, or in-flight S3 uploads are killed and only the first file reaches the bucket (the remaining docs get no object, and their size variants then 404). `scripts/seed-pages.ts` and `src/import/cli.ts` both do this. A doc left with a main file but no variants renders on pages that use the original size but breaks anywhere a resized variant is requested (e.g. the `-800x600` card size). Reconciling only top-level `filename` against the bucket misses this: check the `sizes.*.filename` too.

## Deployment (Railway)

Prod runs on **Railway** (US East): one project with the web service, managed Postgres, and a Storage Bucket for media, on a single bill. `railway.json` drives it: NIXPACKS builder, `npm run payload -- migrate` as the `preDeployCommand`, healthcheck on `/`. Prod runs the Postgres adapter with `push: false`, so **schema changes need a committed migration** (`npm run payload -- migrate:create`); dev still auto-pushes. Baseline migration: `src/migrations/20260703_032255_initial`.

**DB-backed routes are `force-dynamic` (SSR).** Home, the `[...slug]` catch-all, and the post route export `dynamic = 'force-dynamic'`. Managed build containers have no DB, so nothing can prerender (`generateStaticParams` is guarded to return `[]` when the build DB is unreachable) and the pages call `draftMode()`, which throws `DYNAMIC_SERVER_USAGE` under static generation. Upside: content edits go live with no redeploy, since every request re-queries.

**Bucket addressing.** Railway Buckets and AWS S3 are virtual-hosted-style, so prod sets `S3_FORCE_PATH_STYLE=false`; `forcePathStyle` in `src/payload.config.ts` reads that env and defaults to path-style for local MinIO.

**Running a CLI against the prod DB from a laptop** (seeding, migrating, one-off fixes): point `DATABASE_URL` at the Postgres **public** proxy URL plus `?sslmode=no-verify`, set the bucket `S3_*` vars, and use **Node 22** (the migrate CLI crashes on Node 24, a tsx `node:crypto` regression). The internal `*.railway.internal` DB host does not resolve off-platform.

**Staging environment.** A persistent `staging` environment (forked from `production`) mirrors the prod shape: its own web service, Postgres, and media bucket, each with independent credentials (`PAYLOAD_SECRET`, DB, and `S3_*` are all distinct from prod, so staging can never read or write prod data). It runs `NODE_ENV=production` → `push: false`, so a staging deploy rehearses the exact prod migrate path. Reached at `stage.mapsnational.org`. The whole environment is locked behind an HTTP Basic-auth gate plus a site-wide `X-Robots-Tag: noindex` (`src/middleware.ts`, active only when `STAGING_GATE_USER`/`STAGING_GATE_PASSWORD` are set — unset in prod/local, so inert there). Per ADR 0002 staging is the mandatory first stop for every change; content flows the other way (prod → staging via the #161 refresh), never back. Until the `staging`-branch auto-deploy lands (#159), deploy manually from the repo root:

```
railway up --environment staging --service web --ci
```

**Content refresh (prod → staging).** Staging starts empty (a fork copies no data). Populate it with a point-in-time prod snapshot: `npm run refresh:staging` (`scripts/refresh-staging.mjs`, a Node script so it runs the same from cmd / Git Bash / macOS; add `-- --yes` to skip the confirm). It pulls all connection details live from Railway by environment name, then (1) mirrors the prod media bucket into the staging bucket and (2) resets staging's schema and restores a full `pg_dump` of prod. A **full** dump preserves document ids, so page → media references survive; re-seeding would mint new ids and break them (ADR 0002). One-way only: a **direction lock** refuses to run if the target resolves to prod, and prod is read-only throughout. Needs Docker (runs `postgres:18` + `amazon/aws-cli` in throwaway containers, so no local Postgres/aws-cli). After a refresh, log into staging admin with your **prod** credentials (users come over in the dump; sessions stay isolated because staging signs JWTs with its own secret).

## Architecture

This is the Payload Website Template: **one Next.js app serves both the public site and the Payload admin + API**, split by route groups under `src/app/`:

- `(frontend)` — the public website (App Router pages, `globals.css`, `layout.tsx`).
- `(payload)` — the admin UI and REST/GraphQL API, generated by Payload.

**Payload config (`src/payload.config.ts`) is the backbone.** It wires the Postgres adapter, collections (`Pages`, `Posts`, `Media`, `Categories`, `Users`), globals (`Header`, `Footer`), the Lexical editor, and plugins (`src/plugins/index.ts`: SEO, search, redirects, form-builder, nested-docs, plus revalidation/redirect hooks).

**Layout builder.** Pages and Posts are composed of **blocks** (`src/blocks/`) and **heros** (`src/heros/`), rendered by `RenderBlocks` / `RenderHero`. Each block colocates its Payload field schema (`config.ts`) with its React component (`Component.tsx`).

Blocks use a **two-registry split**, and both must be updated to add a block:

- `src/blocks/index.ts` exports `layoutBlocks` (field configs only) — collections consume this for their `layout` field.
- `src/blocks/blockComponents.ts` maps each config's `slug` → React component — `RenderBlocks` reads this map (there is no hand-edited switch).

They are kept separate **on purpose**: `index.ts` must never import React components, or client-only deps (`next/image`, `@payloadcms/ui`) get pulled into the Payload config graph and break `generate:types`. So: a server-rendered block can `import` the config but not the component into config-side code. To add a block — write `config.ts` + `Component.tsx`, register the config in `index.ts` and the component in `blockComponents.ts`, then run `generate:types`. A block that needs client interactivity (state, listeners) keeps a `'use client'` child component the server `Component.tsx` renders (see `MediaGallery`), since the config graph stays server-only.

**Blocks gallery (showroom).** `/design-system/blocks` is an internal, noindexed catalog that renders every block and hero with sample data in both themes, derived from the render registry. Each block colocates a `gallery.ts` (title, category, ordered `variants` of sample props) registered in `src/blocks/gallery.ts`; heros do the same in `src/heros/gallery.ts`. Detail routes (`[slug]/`) toggle variants client-side. Add a `gallery.ts` when you add a block — a registered block with none still appears as a "no example yet" stub.

**Generated files — do not hand-edit:**

- `src/payload-types.ts` — regenerate with `generate:types` after config changes.
- `src/app/(payload)/admin/importMap.js` — auto-regenerates on dev; reformats noisily, so revert spurious diffs.

**Path aliases:** `@/*` → `src/*`, `@payload-config` → `src/payload.config.ts`.

## Section porting (migration → blocks)

Phase 3 of the OSS migration runbook: the repeatable contract for turning the old Webflow/Relume site into native Payload blocks. Source sections live in `migration/_extracted/` (the gitignored Webflow export, Client-First/Relume class naming). The canonical, de-duplicated list of what to build is the **block catalog** (`docs/migration/block-catalog.md`) — **port against the catalog, not page-by-page.**

**Input → output contract.** One catalog block → one native Payload block: a colocated `config.ts` (field schema) + `Component.tsx` (React) matching the existing `src/blocks/*` shape, plus a `gallery.ts` for the showroom. Register it in both `src/blocks/index.ts` and `src/blocks/blockComponents.ts` (see Layout builder), then run `npm run generate:types`. `generate:importmap` only changes when a block adds a custom **admin** component — for plain field/render blocks it reports "No new imports"; revert its spurious CRLF-only diff if it churns. Use real brand assets copied into tracked `public/` (e.g. `public/gallery/`) — `migration/` is gitignored, so anything referenced from it won't survive a clean checkout.

**Classify every needed block (the catalog does this up front):**

1. **Port** — a Relume source section exists → translate its markup/styles into a block, mapping styles to brand tokens.
2. **Existing / variant** — no source, but an existing block or hero variant fits. Heros already cover most page intros (`HighImpact`, `MediumImpact`, `LowImpact`, `PostHero`); an interior-page header / "mini-hero" is almost always a `LowImpact` variant — add a `variant`, don't build new.
3. **Net-new** — no source _and_ nothing existing fits → compose from design-system primitives (`src/components/ui` atoms + tokens). The one place `frontend-design` may help — but guard-rail it to the brand tokens (fixed navy/maroon, `tokens.css`); never its generative font/colour choices. Rare; the true gaps.

**Variant vs. new block.** Cluster sections by _intent_, not markup. The same intent (FAQ, CTA, testimonial) rendered differently across pages is **one block** with the differences as fields or a `variant` select — not several near-identical blocks. Fork a new block only when structure/behavior genuinely differs; spacing/colour differences are tokens/props, not new blocks.

**Tokens, never hardcoded values.** All colour/spacing/type comes from `tokens.css` via the shadcn/Tailwind theme (see Theming & design system). Never inline a Webflow hex/px — map it to the nearest token. Base brand navy `#0d1e6c` / maroon `#8b0a03` are fixed.

**Consistency is advisory + HITL.** When porting, check the section against its catalog entry and the `design:` review skills — `design:design-critique` (usability / hierarchy / consistency), `design:design-system` (token + variant conformance — flags hardcoded values and near-duplicate variants that should be one block), and `design:accessibility-review` (WCAG / the repo's AAA text pairs). Surface drift as a recommendation to conform — never silently port a one-off variation, and never auto-apply a recommendation.

**Does NOT carry over from Webflow** (rebuild natively, don't port): interactions/animations (Webflow IX2), forms (use the Payload form-builder), CMS collection displays (model as Payload collections + query), and embedded scripts.

## Theming & design system

Custom work layered on the template's shadcn/Tailwind-v4 setup.

- **Tokens.** `src/app/(frontend)/tokens.css` holds owned brand primitives (navy/maroon ramps, neutral scale, system colors, radius/spacing scales, fonts), extracted from the Webflow export. It's imported into `globals.css`, which maps those primitives onto shadcn token slots in the light `:root` and `[data-theme='dark']` blocks, plus Tailwind `@theme` / `@theme inline`. All text pairs meet **WCAG AAA**; the base brand navy `#0d1e6c` and maroon `#8b0a03` must not be changed (derive tints instead).
- **Typography scale — one ramp, two mirrors.** A canonical type scale lives in `globals.css` `@layer components` as `.type-*` classes (`type-display`, `type-h2`/`h3`/`h4`, `type-lead`, `type-eyebrow`, `type-quote`, `type-small`) and is **mirrored** by the `typography` (prose) config in `tailwind.config.mjs`. Hardcoded JSX headings use the `.type-*` classes; RichText/prose headings (hero headlines, post bodies) get the matching sizes from the prose config — **change both together or they drift.** Headings are Lora (serif) at a uniform **600** weight, so hierarchy is carried by **size alone** and weight never inverts: a section `.type-h2` (36px) can't out-weigh the `.type-display` hero (56px). Never hand-tune a one-off heading size in a block — apply a `.type-*` for font/size/weight and keep colour/margin as utilities. The live spec is the Typography section of `/design-system`.
- **Theme switching is driven by `data-theme` on `<html>`, not Tailwind's default `dark:` class.** `globals.css` defines a custom `dark` variant keyed on `[data-theme='dark']`. `InitTheme` sets the attribute pre-paint (no flash); `ThemeProvider` persists it.
- **Per-page header theme.** The header overlays page content, so each page declares its header theme on mount via `useHeaderTheme().setHeaderTheme('light'|'dark')` in a `page.client.tsx` (heroes like `HighImpact` set `'dark'`). Pages that set none inherit the global theme. This determines which logo variant the header shows. The brand `Logo` (`src/components/Logo/Logo.tsx`) switches variants via the `dark:` variant; the footer is a fixed dark surface and forces the light (white) logo.
- **Header / hero overlay geometry — single source of truth.** A full-bleed hero (e.g. `HighImpact`) slides up _under_ the overlay header to reach the top of the viewport. Both the header's height and that pull-up derive from two vars in `globals.css` `:root`: `--header-height` (the header is pinned to it via `h-[var(--header-height)]`) and `--page-top-pad` (the slug/post `<article>`'s top padding). The hero's offset is exactly `-mt-[calc(var(--header-height)+var(--page-top-pad))]`. **Never hand-tune a hero's top margin to a fixed `rem`** — change the vars; a hardcoded offset that had to equal header + article-pad is what caused a top-gap to recur twice.
- shadcn config is in `components.json`; UI atoms live in `src/components/ui/`.
- `/design-system` is an internal, noindexed token/theme reference page used to verify the system in both themes.

## Tailwind v4 notes

CSS-first config: `globals.css` uses `@import 'tailwindcss'`, links the JS config via `@config '../../../tailwind.config.mjs'`, and defines theme tokens with `@theme` / `@theme inline`. PostCSS is `@tailwindcss/postcss`. There is no `tailwind.config` `content` array — Tailwind v4 scans automatically.
