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

## Checkpoint A — human review (STOP) [AWAITING REVIEW]

- [x] Screenshots: home, dark @1280 + light @1440, slider next to Featured Galleries
- [ ] Decide: is width + gap enough, or run phase 3?

## Phase 3 — OPTIONAL, only after Checkpoint A go-ahead

- [ ] `Card/index.tsx`: title prose `h3` -> `type-h5`; `p-4` -> `p-3`; category `text-sm mb-4` -> `text-xs mb-2`
- [ ] Verify: card title computes to 18px Lora 600, matching the gallery card
- [ ] Verify: `/latest-updates` grid still holds a two-line title + category, no new clamping
- [ ] Verify: `npx playwright test tests/e2e/posts.e2e.spec.ts` passes

## Global (before calling it done)

- [ ] `npx tsc --noEmit` clean
- [ ] `npx eslint <touched files>` clean
- [ ] Both themes checked
- [ ] No migration needed (presentational only — confirm no config/field touched)
- [ ] Do not push without an explicit go-ahead
