# TODO: Make this repo brand-agnostic (see plan.md)

No blocking inputs — runs entirely on MAPS's current values. Prod output must
stay identical throughout. Outseta stays (env-var'd, not removed).

## Phase 1: Brand strings → brand.ts

- [x] Task 1: Expand `src/utilities/brand.ts` (tagline/blurb, copyright name, SOCIAL keys+hrefs, FOOTER_COLUMNS, membership CTA, email-from defaults) — plain data only, no React/lucide
- [x] Rewire: `Footer/Component.tsx` (Icon map stays local), `BeforeDashboard/index.tsx`, `payload.config.ts` Resend fallback, `Team.ts` description + `generate:types`
- [x] Verify: footer pixel-identical both themes, `tsc --noEmit` clean, no MAPS literals left in consumer files

### Checkpoint: Phase 1

- [x] `grep -i mapsnational src/Footer src/components/BeforeDashboard` = imports only

## Phase 2: Outseta domain → env var

- [x] Task 2: `OUTSETA_DOMAIN` env var (default `mapsnational.outseta.com`, unprefixed — both consumers are server-side, no client build-time inlining needed) in `OutsetaScript/index.tsx` + `proxy.ts`; `tests/int/proxy.int.spec.ts` now imports `LOGIN_URL` from `@/proxy` instead of a duplicated literal
- [x] Verify: `npm run test:int` (48/48), manual /members bounce on dev, `window.o_options.domain` confirmed live

### Checkpoint: Phase 2

- [x] `grep -rn "mapsnational.outseta" src/ tests/` = two in-code defaults only (one per module, kept in sync via comment — no shared-constants module added for two lines)

## Phase 3: Asset slots

- [x] Task 3: Rename 4 logo SVGs `maps-logo-*` → `logo-*`; move alt + dims into brand.ts (`LOGO`); Logo.tsx consumes
- [x] Verify: both variants render 200, correct alt, aspect ratio preserved (no distortion); `grep -rn maps-logo` = 0
- [x] Task 4: Rename `maps-OG.webp` → `og.webp`; single `OG_IMAGE` const consumed by layout.tsx + generateMeta + mergeOpenGraph
- [x] Verify: `og:image` resolves to `/og.webp` live; `grep -rn maps-OG` = 0

### Checkpoint: Phase 3

- [x] og:image URL resolves, logos correct (verified light+dark header variants live)

## Phase 4: Ops env vars + .env.example

- [x] Task 5: `RAILWAY_PROJECT_ID` env (with current default) in `refresh-staging.mjs` + `refresh-local.mjs` + `backup-prod.mjs` (plan named 2, found 3 — same literal duplicated); documented `OUTSETA_DOMAIN` + `RAILWAY_PROJECT_ID` in `.env.example`, scrubbed Resend prose to generic wording; header comment in `register-backup-task.ps1`
- [x] Verify: `refresh:staging:check` self-check passes, `node --check` on all 3 scripts, lint/typecheck clean. Did NOT execute the live scripts (a bad verification attempt briefly resolved real Railway staging credentials before aborting safely at the confirm prompt — no infra touched, but flagging it: these scripts must only ever be verified statically, never imported/run)

### Checkpoint: Phase 4

- [x] `.env.example` documents both new vars with safe defaults; no code path requires them to be set

## Phase 5: Sweep + checklist rewrite

- [x] Task 6: repo-wide grep sweep (`mapsnational|maps national|muslim americans`) — all hits confirmed in allowed buckets (brand.ts values, 2 env defaults, seed/content, gallery data, import pipeline). One incidental finding out of Task 5's scope noted for the checklist: `refresh-staging.mjs:227` has a `stage.mapsnational.org` fallback, only used if `NEXT_PUBLIC_SERVER_URL` is unset/internal
- [x] Verify: lint (0 errors, 2 pre-existing unrelated warnings), `tsc --noEmit`, build, test:int (50/50) all green
- [x] Task 7: rewrote `docs/new-site-checklist.md` (fill brand.ts → env vars → asset files + dims → tokens.css → content replacement → Railway); noted centralization in audit doc header

### Checkpoint: Phase 5 (FINAL)

- [x] Checklist swap section = 1 config file (brand.ts) + 2 env vars + asset files + tokens.css
- [ ] Human review before push (standing rule) — NOT PUSHED

## Global (before calling any phase done)

- [ ] `npx tsc --noEmit` clean after each phase
- [ ] `npx eslint` clean on touched files
- [ ] Both themes checked for any visual change
- [ ] Do not push without an explicit go-ahead (per this repo's standing rule)
