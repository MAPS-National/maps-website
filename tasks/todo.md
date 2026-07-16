# TODO: Archive card sizing (see plan.md)

## Phase 1 — slider width 3-up -> 4-up [DONE]

- [x] `CollectionArchiveSlider.tsx`: `lg:w-[31%]` -> `lg:w-[23%]` (leave mobile/tablet)
- [x] **Plan amended:** a percentage alone failed the criterion — 23% is 276px at 1280
      but 302px at 1440, vs the print's fixed 256px. Added `lg:max-w-64` to cap the
      slide at exactly the print's width, so the two blocks match at EVERY width.
- [x] Verify: slide width = 256px = print at both 1280 and 1440 (delta 0, not just <15)
- [x] Verify: 4 slides visible + a 5th peeking; next arrow advances 280px = 1 slide + gap
- [x] Verify: mobile/tablet untouched (only `lg:` classes changed)

## Phase 2 — slider gap 16px -> 24px, scoped [DONE]

- [x] `Carousel/index.tsx`: add optional `gapClassName` prop, default `'gap-4'`, applied with `cn`
- [x] `CollectionArchiveSlider.tsx`: pass `gapClassName="gap-6"`
- [x] Verify: Latest Updates track `column-gap` = 24px
- [x] Verify: Testimonials (both tracks) + MediaSlider still 16px (untouched)

## Checkpoint A — human review [APPROVED — phase 3 go-ahead given]

- [x] Screenshots: home, dark @1280 + light @1440, slider next to Featured Galleries
- [x] Decided: run phase 3

## Phase 3 — card internals [DONE]

- [x] `Card/index.tsx`: title prose `h3` -> `type-h5`; `p-4` -> `p-3`; category `text-sm mb-4` -> `text-xs mb-2`
- [x] Verify: card title computes to 18px / 600 / Lora, identical to the gallery card
- [x] Verify: `/latest-updates` grid holds a two-line title + category, 0 of 80 titles
      clamped; home slider card height 420 -> 377px
- [~] `tests/e2e/posts.e2e.spec.ts` NOT run locally: Playwright's global-setup hits the
  known tsx + Node-24 `next/cache` resolution bug on this machine, and it spawns its
  own node so the `npx node@22` workaround does not reach it. Read the spec instead —
  it asserts an `a[href*="/latest-updates/"]` is visible and an `h1` renders; the
  change keeps the Link inside the h3 and only swaps classes, so both still hold.
  CI runs the suite on Node 22.

## Global (before calling it done)

- [x] `npx tsc --noEmit` clean
- [x] `npx eslint <touched files>` clean
- [ ] Both themes checked
- [ ] No migration needed (presentational only — confirm no config/field touched)
- [ ] Do not push without an explicit go-ahead
