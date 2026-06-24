# Phase 6 — page review punch-list

Living punch-list from the page-by-page review of the assembled Phase 6 pages
(epic [#66]). Captured during a guided preview walkthrough; updated per page.

**Status:** `[ ]` open · `[x]` done · `[~]` in progress
**Type:** AFK (mechanical) · HITL (needs a decision)

When the walkthrough finishes, the feature-level clusters here get converted to
proper issues (header nav, carousel primitive, card pattern); the small tweaks
are applied in a batch against the seed/blocks.

---

## Open decisions

- [ ] **D1 — Card pattern scope.** Make "full-bleed image + whole-card clickable + no button + keep border" the **site-wide default** for comparable CardGrids (programs/members/resources pages), or per-section only? _(leaning site-wide)_
- [ ] **D2 — Header menu treatment.** Hamburger overlay at **all** breakpoints, or desktop nav bar + hamburger on mobile only? _(user leans hamburger)_

## Cross-cutting / component work (emerges from items below)

- [ ] **C1 — Autoplay carousel primitive.** One shared auto-playing carousel reused by the Testimonials slider (H4) and the Latest Updates slider (H1). Build once.
- [ ] **C2 — Testimonials block: add `slider` variant + autoplay** (today only `grid` / `single`).
- [ ] **C3 — ArchiveBlock: slider treatment** for the Latest Updates feed on home (H1).
- [ ] **C4 — CardGrid: "linked image card" pattern** — full-bleed image, whole card clickable (`enableCardLink` + `cardLink`), no button, keep border (H2/H3; scope per D1).

---

## Global (header / footer / site-wide)

- [ ] **G1 — Header nav menu** _(HITL: D2 + IA)_. Today the header is just logo + "Home" + "Search". Build a real menu (hamburger overlay per D2), keeping the current hero design. Folds in the login/logout control ([#115]). Proposed IA:
  - About Us → Mission · FAQ · Partners · Board & Leadership · Advisory Council · State Committees
  - Programs → Career Support · Community Building · Legal Advocacy · Policy Initiatives · Public Sector Engagement
  - Resources → Federal Employment · Jumuah Services · Fellowships (Young) · Fellowships (Mid-Career→Senior)
  - Members → Portal + member pages (gated → login)
  - Press · Events · Contact · Donate / Join (buttons)

---

## Home (`/`)

- [ ] **H1 — Latest Updates** → slider/carousel showing **12 items** (currently a static 3-card grid). _(AFK seed + C3)_
- [ ] **H2 — MAPS Programs cards** → full-bleed image per card, **whole card clickable** → program page, **remove "Learn More" buttons**, keep border. Source images: `4_1.webp` (Career Support), `5_1.webp` (Community Building), `policy.webp` (Policy & Advocacy). _(AFK seed + C4; needs image re-host)_
- [ ] **H3 — MAPS Membership cards** → same treatment as H2; cards link → `/join`. Membership card images TBD from source home. _(AFK seed + C4)_
- [ ] **H4 — Both Testimonials blocks** (Programs + Membership) → **slider with autoplay** (currently static grids). _(C1 + C2)_
- [ ] **H5 — "MAPS National in the community" slider** → move to the **bottom** of the page, right before the footer (currently directly under the hero). _(AFK seed reorder)_
- [x] **Outseta `[domain]` init error** — fixed: single script sets `window.o_options` then injects the SDK (was a `beforeInteractive` race in the route-group layout). _(done, uncommitted in working tree)_

---

[#66]: https://github.com/saz33m1/payload-poc/issues/66
[#115]: https://github.com/saz33m1/payload-poc/issues/115
