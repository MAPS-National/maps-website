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

- [ ] Task 5: `RAILWAY_PROJECT_ID` env (with current default) in `refresh-staging.mjs` + `backup-prod.mjs`; document new vars in `.env.example`, scrub MAPS prose; header comment in `register-backup-task.ps1`
- [ ] Verify: `npm run refresh:staging:check` passes with no env set

### Checkpoint: Phase 4

- [ ] Fresh clone + .env-from-example boots dev with zero MAPS edits

## Phase 5: Sweep + checklist rewrite

- [ ] Task 6: repo-wide grep sweep (`mapsnational|maps national|muslim americans`) — remaining hits only in brand.ts values, env defaults, seed/content, test fixtures, gallery data
- [ ] Verify: lint, `tsc --noEmit`, build, test:int all green
- [ ] Task 7: rewrite `docs/new-site-checklist.md` (fill brand.ts → env vars → asset files + dims → tokens.css → content replacement → Railway); note centralization in audit doc header

### Checkpoint: Phase 5 (FINAL)

- [ ] Checklist swap section = 1 config file + env + assets + tokens
- [ ] Human review before push (standing rule)

## Global (before calling any phase done)

- [ ] `npx tsc --noEmit` clean after each phase
- [ ] `npx eslint` clean on touched files
- [ ] Both themes checked for any visual change
- [ ] Do not push without an explicit go-ahead (per this repo's standing rule)
