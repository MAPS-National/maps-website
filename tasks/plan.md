# Plan: size the Archive ("Latest Updates") cards consistently with Featured Galleries

## Problem

The two blocks size their cards on different systems, so on the home page the
Latest Updates cards visibly dwarf the Featured Galleries prints.

|                          | width rule                                                 | measured @1127px viewport | photo        | title            |
| ------------------------ | ---------------------------------------------------------- | ------------------------- | ------------ | ---------------- |
| Archive slide            | `w-[78%] sm:w-[46%] lg:w-[31%]` — % of container, uncapped | 298 x 462                 | 296px square | prose `h3`, 24px |
| Featured Galleries print | `max-w-64` — fixed 256px cap                               | 256 x ~390 (polaroid)     | 240px square | `type-h5`, 18px  |

Two separate defects:

1. **Width divergence grows with the viewport.** The archive slide is a
   percentage, the print is a fixed cap, so at 1440px the archive card is ~400px
   while the print stays 256px.
2. **Internal weight.** Even at equal width the archive card reads heavier:
   24px prose title vs 18px, `p-4` vs `p-2.5`/`p-3`.

Plus: the carousel track gap is `gap-4` (16px) where the Featured Galleries grid
uses 24px (`gap-6` compact / `gap-x-8` polaroid), so the slider also feels tighter.

## Dependency graph

```
Carousel (src/components/Carousel/index.tsx)      <- gap lives here (hardcoded gap-4)
  |-- CollectionArchiveSlider  (slideClassName)   <- width lives here   [Latest Updates]
  |-- Testimonials/Component
  |-- MediaGallery/MediaGalleryClient

Card (src/components/Card/index.tsx)              <- title size + padding live here
  |-- CollectionArchiveSlider                     [home slider]
  |-- CollectionArchive/index.tsx (grid)          [/latest-updates + 9 archive-block uses]
```

Confirmed by grep: `Card` is imported ONLY by the two CollectionArchive files, so
a Card change cannot leak into search results, posts, or any other block. The
`Carousel` gap, by contrast, is shared by three consumers — which is why phase 2
adds a prop instead of editing the shared default.

Phases are independent (no ordering constraint between 1, 2, 3), but they are
sequenced so each can be judged visually on its own before the next lands.

## Phase 1 — Slider width: 3-up to 4-up

**Change:** `CollectionArchiveSlider.tsx`, `slideClassName`
`w-[78%] sm:w-[46%] lg:w-[31%]` -> `w-[78%] sm:w-[46%] lg:w-[23%]`.
Mobile and tablet breakpoints untouched (there the archive card is the only card
on screen, so it isn't competing with a print).

**Acceptance criteria**

- At >=1024px the slide computes to ~245-260px, i.e. within ~5% of the 256px print.
- A fourth card peeks at the right edge of the track (carousel affordance preserved).
- Mobile (375px) and tablet (768px) layouts are pixel-unchanged.
- Prev/next arrows still advance exactly one slide.

**Verification**

1. Home page at 1127px and 1440px: measure `article` width in the slider and
   `figure` width in Featured Galleries, assert the delta is under ~15px.
2. Screenshot the home page at both widths.
3. Click the next arrow, confirm the track advances one slide.

## Phase 2 — Slider gap: 16px to 24px, without touching the other two sliders

**Change:** add an optional `gapClassName` prop to `Carousel` (default `'gap-4'`,
applied via `cn` on the track), and pass `gapClassName="gap-6"` from
`CollectionArchiveSlider`.

Deliberately NOT editing the shared `gap-4` default: Testimonials and
MediaGallery use the same primitive and neither was reported as too tight.

**Acceptance criteria**

- Latest Updates track gap is 24px; Testimonials and MediaGallery remain 16px.
- Slide snapping still lands each card flush at the track's left edge.

**Verification**

1. Home page: read computed `column-gap` on the Latest Updates `ul` -> 24px.
2. Read the same on a Testimonials slider page and the MediaGallery block -> 16px.
3. Screenshot the home slider.

## Checkpoint A — human review

Stop after phase 2. Screenshots of the home page (light + dark, 1127px and
1440px) showing Latest Updates next to Featured Galleries. Decide whether the
width + gap fix is sufficient, or whether phase 3 is wanted. Phase 3 does NOT
proceed without an explicit go-ahead: it changes `/latest-updates` and every
other page carrying an archive block, which is a wider visual change than
anything asked for so far.

## Phase 3 — OPTIONAL, gated on Checkpoint A: unify the card's internals

**Change:** in `Card/index.tsx`, bring the card's type and padding onto the same
ramp as the new gallery cards:

- title: prose `h3` (24px) -> `type-h5` (18px), dropping the `prose` wrapper on the title
- body padding: `p-4` -> `p-3`
- category label: `text-sm mb-4` -> `text-xs mb-2`

**Blast radius:** the archive _grid_ as well as the slider — `/latest-updates`
and the nine pages using an archive block. That is the point (one card system),
but it is a site-wide visual change, hence the gate.

**Acceptance criteria**

- Archive card title renders Lora 600 at 18px, matching the gallery card exactly.
- Card height drops proportionally; no title clamps that did not clamp before.
- `/latest-updates` grid still reads as a grid (cards do not become too short to
  hold a two-line title + category).

**Verification**

1. Home + `/latest-updates`, light and dark, at 1127px: computed font-size on a
   card title is 18px, and matches the gallery card's computed style.
2. Screenshot `/latest-updates` grid before/after.
3. `npx playwright test tests/e2e/posts.e2e.spec.ts` (the archive listing spec).

## Out of scope

- No Payload config, field, or block-schema change -> **no migration needed**
  (unlike the `variant` work, this is presentational only).
- The Featured Galleries block is not touched; it is the reference the archive
  moves toward.
- The home page's polaroid/compact variant choice is content, set in admin.

## Global verification (all phases)

- `npx tsc --noEmit` clean.
- `npx eslint` on every touched file clean.
- Visual check in BOTH themes (the archive card uses themed `bg-card`; the
  gallery print is deliberately always-white, so they must be compared in dark
  mode too).
- Nothing pushed: local verification only, per the usual "test local first" rule.
