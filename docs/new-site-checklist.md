# New site bootstrap checklist

How to spin a new org's website off this repo. The repo is the template; this is
the strip/swap list. Create the new repo via GitHub "Use this template" (clean
history, no fork coupling), not the Fork button. To cherry-pick generic fixes
later: `git remote add upstream <this-repo>` in the new repo.

## Strip (MAPS-specific, delete or empty)

- `src/migrations/*` — start a fresh baseline: delete all, then
  `npm run payload -- migrate:create initial` once the new schema settles.
  Includes `restore-assets/` (MAPS post content) and the nav-seed migration.
- `scripts/seed-pages.ts` — the `PageSlice` factories are MAPS pages. Keep the
  file's shape (idempotent registry + `payload.destroy()` flush), replace slices.
- `src/Header/seedNav.ts` — MAPS IA. Replace with the new site's nav.
- `src/seed/prose/*.json` — MAPS page copy.
- `src/import/` + `scripts/import-prose.ts`, `scripts/import-slider.ts`,
  `scripts/rehost-images.ts` — the Webflow CSV import pipeline. With 3–4 pages,
  skip imports entirely: seed via `seed-pages.ts` or build in admin.
- `scripts/backup-prod.mjs`, `scripts/register-backup-task.ps1` — MAPS Railway
  refs; re-point or drop.
- `docs/migration/` — MAPS Webflow migration docs.
- `public/` brand assets (logos, gallery, favicons, og image).
- Collections the new site doesn't need (e.g. `Team`, `Testimonials`,
  `AcademyVideos`) and their blocks — delete from `src/collections/`,
  `src/blocks/index.ts`, `src/blocks/blockComponents.ts`, then
  `npm run generate:types`.

## Swap (find-and-replace surface)

Full sweep: `docs/brand-audit-2026-07-16.md` has the complete file:line list
(~150 items, 6-lens agent audit). Below is the shape of it — the parts easy
to miss because they're not obviously "content."

- `src/utilities/brand.ts` — `SITE_NAME` / `SITE_DESCRIPTION` (feeds SEO plugin,
  generateMeta, OG defaults).
- `src/app/(frontend)/tokens.css` — brand primitives: the navy/maroon hex ramp
  (`--brand-primary-base`, `--brand-secondary-base`) and the font stack
  (`--font-body`/`--font-heading`), not just component code. Then re-map the
  shadcn slots in `globals.css` if hue roles change. Keep text pairs WCAG AAA
  (`/design-system` page verifies both themes).
- **`src/Footer/Component.tsx`** — the most coupled UI file in the repo, not
  CMS-managed:
  - `SOCIAL` const: 5 hardcoded social URLs (Facebook/Instagram/Twitter/
    LinkedIn/YouTube).
  - `COLUMNS` const: the entire footer nav IA, hardcoded, not read from the
    footer global.
  - Mission blurb + `© {year} MAPS` copyright line.
  - "Become a member" CTA hardcoded to `/join`.
  - `<PortalLogin />` (own file, `src/Footer/PortalLogin.tsx`) wires in Outseta
    member login — delete with the Outseta integration if dropped.
- `src/components/Logo/Logo.tsx` — alt text, the four SVG paths in `public/`,
  **and** the hardcoded intrinsic `width`/`height` per variant (`dims` const).
  Get the new logo's aspect ratio into that const or it renders distorted.
- OG/favicon image, referenced in **three** places, not one:
  `src/app/(frontend)/layout.tsx`, `src/utilities/generateMeta.ts`,
  `src/utilities/mergeOpenGraph.ts` — all point at `/maps-OG.webp`.
  `public/favicon.ico` / `favicon.svg` are the MAPS logomark too.
- Outseta domain — hardcoded in TWO places, keep them in sync:
  - `src/components/OutsetaScript/index.tsx` (`o_options.domain`)
  - `src/proxy.ts` (`OUTSETA_DOMAIN`, drives the /members JWT gate + JWKS)
  If the new org has no members area, Outseta is **architectural, not
  cosmetic** — it's wired into 7 files: both above, plus `src/proxy.ts`'s
  cookie check, `src/Footer/PortalLogin.tsx`, `src/Header/DesktopNav.tsx` +
  `NavMenu.tsx` (login/logout buttons), `src/blocks/MemberPortalHero/`, and
  `src/types/outseta.d.ts`. Delete all of them together, plus the members
  e2e/int specs.
- `src/payload.config.ts` — Resend adapter's `defaultFromAddress` /
  `defaultFromName` fallback (`no-reply@mapsnational.org` / `'MAPS National'`).
- `src/components/BeforeDashboard/index.tsx` — admin dashboard welcome text
  names MAPS and its content types.
- `src/collections/Team.ts` — admin field description example
  (`"President, MAPS Texas"`); regenerate `payload-types.ts` after.
- Every `src/blocks/*/gallery.ts` and `src/heros/gallery.ts` (~20 files) plus
  `src/blocks/gallery-helpers.ts` — the `/design-system/blocks` showroom's
  sample data is **real** MAPS copy, event photography, and partner logos, not
  placeholders. Systemic, not a one-off; budget real time here if the showroom
  matters to the new org, otherwise it's cosmetic-only (internal, noindexed).
- `redirects.ts` — the three `legacyPosts*` rules 301 MAPS's old Webflow
  `/posts` URLs; a new org has no such legacy site, delete them.
- Ops scripts hardcode a Railway **project ID**, not just paths — the logic
  is reusable, only the constant needs swapping:
  - `scripts/refresh-staging.mjs` (`PROJECT_ID` const)
  - `scripts/backup-prod.mjs` (`PROJECT_ID` const)
  - `scripts/register-backup-task.ps1` — task name + local checkout/backup
    paths (also embeds the maintainer's Windows username).
- `package.json` `name`, `docker-compose.yml` — **two** hardcoded org-name
  strings, not one: minio's `container_name: maps-website-images` (line 14)
  and the pinned media volume `name: maps-website-media` (line 43; see
  CLAUDE.md "Volume name is pinned"). Missing the first leaves `docker ps`
  showing MAPS branding on the new org's machine.
- Domains: `NEXT_PUBLIC_SERVER_URL`, `next-sitemap.config.cjs`, CLAUDE.md refs
  (prod + staging custom domains, appear in both ADRs too).
- `.env.example` prose (Resend subdomain note, MAPS refs).
- CLAUDE.md — keep the generic sections (architecture, blocks, theming, CI,
  deployment shape); rewrite the MAPS-specific ones (imports, content refresh
  narrative, launch history, domain names).
- e2e/int tests assert against seeded MAPS content (post slugs like
  `maps-academy-climbing-the-federal-ladder`, page routes like `/programs`,
  the Outseta login URL duplicated in `tests/int/proxy.int.spec.ts`). These
  update alongside whatever replaces `seed-pages.ts` — expect swapped fixture
  values, not a rewrite of test structure.

## Keep as-is (org-agnostic)

- CI (`.github/workflows/ci.yml`): lint/build/int, migration guard, e2e,
  branch flow guard. Branch model (feature → `staging` → `master`) and
  merge-commits-only both carry over; re-apply the repo settings
  (Settings → Pull Requests → only "Allow merge commits"; default branch
  `master`, create `staging` from it).
- Block registries, `/design-system` + `/design-system/blocks` showroom,
  heros, `RenderBlocks`/`RenderHero`.
- `scripts/refresh-local.mjs` / `refresh-lock.mjs`, `ensure-admin.ts`,
  `ensure-docker.ps1` — resolve targets from Railway env names / `.env`,
  nothing MAPS-coupled. (`refresh-staging.mjs` is 99% this too — see its
  `PROJECT_ID` swap above.)
- Husky hooks, tests scaffolding, MinIO docker-compose (bucket name is generic).

## New Railway project (per environment: production + staging fork)

Same shape as MAPS: web service + Postgres + Storage Bucket, `railway.json`
carries builder/preDeploy/healthcheck. Connect the repo on the web service:
staging env tracks `staging`, production tracks `master`, "Wait for CI" on.

Required vars per env: `DATABASE_URL`, `PAYLOAD_SECRET`, `CRON_SECRET`,
`PREVIEW_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `S3_BUCKET` / `S3_ENDPOINT` /
`S3_REGION` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`,
`S3_FORCE_PATH_STYLE=false`. Staging only: `STAGING_GATE_USER` /
`STAGING_GATE_PASSWORD` (Basic-auth gate + noindex, inert when unset).
Optional: `RESEND_API_KEY` + `EMAIL_FROM_*`, reCAPTCHA keys (see `.env.example`).

## First-run order (fresh repo, fresh DB)

1. `.env` from `.env.example` (local Postgres + MinIO vars), `npm install`.
2. `npm run dev` (push:true syncs schema), `npm run ensure:admin`.
3. Author the new `seed-pages.ts` slices + `seedNav.ts`, run `seed:pages` +
   `seed:header`.
4. When schema settles: `npm run payload -- migrate:create initial`, commit.
5. Railway envs up, push `staging`, verify, promote to `master`.
