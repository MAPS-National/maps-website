# Phase 6 — page review punch-list

Living punch-list from the page-by-page review of the assembled Phase 6 pages
(epic [#66]). Captured during a guided preview walkthrough; updated per page.

**Status:** `[ ]` open · `[x]` done · `[~]` in progress
**Type:** AFK (mechanical) · HITL (needs a decision)

### Progress log (AFK batch — done)

Committed on `feat/phase6` (not pushed):

- **`6b3b618`** — render fixes: **PR1** Card 1:1 image · **PR2** Card no description · **NY1** FeatureSplit 16:9 · **AV1** Academy YouTube thumbnails · **AV2** strip category prefix · **CS4** hide legacy-id testimonial authors (render guard) · **C1** shared autoplay Carousel + MediaGallery autoplay.
- **`fad2812`** — **C4** CardGrid full-bleed linked image cards (render-only; existing `enableCardLink`/`cardLink`, no schema change).
- **`8654270`** — seed wave: **C8** accordions collapsed · **B1** State Committee Presidents group · **B2/AC2/SC1** recovered About-Us intro copy · **CS3** career headline · **LA2** short CTA · **H1** Latest Updates 12 · **H2** program cards full-bleed linked images · **H3** membership cards link to /join · **H5** community slider to bottom · **MCB1/MCB2** Signal cards clickable / state cards keep buttons · **EV1** new /latest-updates page.
- **`8e13fc9`** — **C2** Testimonials slider variant · **C3** ArchiveBlock slider · **NY2** NY gallery slider · home Latest Updates + both testimonials now sliders (**H4**) · **CS2** career testimonials slider. Regenerated payload-types.
- **`ac67d33`** — Outseta: single-script SDK init fix; members gate restored (server-side). TEMP review bypasses removed.
- **`1f415e9`** — **P1** backfill ~28 partner logos from the live CDN → LogoStrip now shows 31 · **DN1** PayPal/Zelle logos (PayPal rasterized from SVG) + per-method QR codes wired into the donate comparison table. `rehost-images` gained remote-CDN support + dedupes by the stored `.webp` name.

Also **CS1/LA1** (program support-card full-bleed) are satisfied by the C4 render change. **D1** resolved (site-wide).

### Decided (walkthrough 2) — DONE

Built + preview-verified, committed on `feat/phase6` (not pushed):

- **`00265f0`** — **M1** MediaGallery `density: compact` (four-up square photo wall, tight gaps) · **JU1** MapLocationCards now a client Maps-JS-API map with one marker per geocoded location + an InfoWindow showing that location's card on click (lat/lng fields added; degrades to cards-only with no key). Regenerated payload-types.
- **`3bb29fe`** — seed data: **M1** mission gallery set to compact · **JU1** coordinates for all 9 Jumuah locations · **JU2** slug → `/resources/jumuah-services` + redirect + stale old-slug page removed on reseed · **C6** exact per-group team order from the live site · **C7** removed the generic testimonials block from community-building / legal-advocacy / policy-initiatives / public-sector-engagement · `revalidateRedirects` honors `disableRevalidate`.
- **`b671cf1`** — **C5** sticky scroll-spy TOC (`PageTOC`) for long content pages: self-gates at 3+ section headings, reserves a left rail at xl+, hidden below xl.
- **`690cc26`** — **G1/D2** header hamburger overlay at all breakpoints with the full IA + Donate/Join CTAs + Outseta login/logout ([#115]); header no longer reads the CMS nav global.
- **C6/b** — Team `inactive` flag (sidebar toggle) + null-safe block query; **Hasan Shanawani** hidden so the board matches the source (12 / 3 at-large). Reversible, no delete.

**Notes / deviations to confirm:**

- **C7 changed approach (live data contradicted the plan).** Gather found **none** of the 5 live program pages show testimonials — so a `program` tag field would tag nothing. Faithful port = remove the generic block from the 4 non-career program pages (matches your original "remove" instinct); career-support keeps its `career` set per your instruction. No tag field added. _Revert any block to restore it if you'd rather curate per-program._
- **C6 resolved (walkthrough 3):** (a) the Presidents-tab float (**Fatima Abdelsalam** + **Hon. Samia Naseem** above Basem Hassan — a single `order` field can't hold two independent ranks) is **accepted as-is**: cosmetic, exact everywhere else. (b) **Hasan Shanawani** (in the import's board, not on the live board) is **hidden via a new `inactive` flag** on Team — board now matches the source (12 / 3 at-large). The flag is a reversible per-member sidebar toggle (record preserved, not deleted); the block query is null-safe so existing members are unaffected. Seed sets it via `TEAM_INACTIVE`.
- **M1 done** — the 2 supplied community photos (Georgetown Law panel + MAPS at the U.S. DOJ) are in the grid (now 9). Converted to optimized webp (the DOJ one from HEIC via a transient decoder), committed under `public/import/prose/`. `seed-pages` `mediaId` is now self-healing — it creates a Media doc from the tracked source if absent, so a fresh DB reproduces the gallery without `import:prose`. Layout refined: compact density now honors the `columns` field (mission set to `3` → clean 3×3) and tiles are **4:3** (was square) so the landscape group photos aren't center-cropped/zoomed.
- **JU1 / JU2 dev caveat:** map markers + InfoWindows verified live; the old-slug redirect needs a fresh `getCachedRedirects` (a `next build` or a `.next` clear) — production builds regenerate it automatically.
- **Punch-list reconciled (walkthrough 4):** every item is now `[x]`. The two items previously deferred to standalone issues are built — **CO1** (contact form, #98) and **JN1** (`/join` Outseta plan modal). Checkboxes lower in this doc were flipped to match the committed reality recorded in the progress log above.

### Closed

- **CS4** — keep imported testimonials as quote-only (source has no names). Render guard already in place. **Done.**

### Still HITL / not yet decided

- (none — all walked through)

When the walkthrough finishes, the feature-level clusters here get converted to
proper issues (header nav, carousel primitive, card pattern); the small tweaks
are applied in a batch against the seed/blocks.

---

## Open decisions

- [x] **D1 — Card pattern scope. RESOLVED → site-wide.** Full-bleed image cards are the **default for all comparable CardGrids** (programs/members/resources). Confirmed on PSE. See [C4].
- [x] **D2 — Header menu treatment.** → hamburger overlay at all breakpoints (done, `690cc26`). Hamburger overlay at **all** breakpoints, or desktop nav bar + hamburger on mobile only? _(user leans hamburger)_

## Cross-cutting / component work (emerges from items below)

- [x] **C1 — Autoplay carousel primitive.** One shared auto-playing carousel reused by the Testimonials slider (H4) and the Latest Updates slider (H1). Build once.
- [x] **C2 — Testimonials block: add `slider` variant + autoplay** (today only `grid` / `single`).
- [x] **C3 — ArchiveBlock: slider treatment** for the Latest Updates feed on home (H1).
- [x] **C4 — CardGrid: "linked image card" pattern** — full-bleed image, whole card clickable (`enableCardLink` + `cardLink`), no button, keep border. **Scope: site-wide** (D1 resolved) — apply to every comparable CardGrid (home H2/H3, all program support-area grids [CS1]/[LA1], members, resources). The **clickable-surface + no-button** behavior can also apply to **imageless** cards where called out (e.g. [MCB1]) — but it's **opt-in per section**, not automatic (some imageless cards keep their buttons, see [MCB2]).
- [x] **C8 — Accordions collapsed by default** _(global)_. Every accordion/FAQ block site-wide starts collapsed, not expanded. Generalizes [CB2]. _(AFK — accordion `defaultOpen` off everywhere)_
- [x] **C7 — Targeted testimonials per page** _(done, `3bb29fe` — live shows none, so removed from the 4 non-career program pages)_ _(HITL: the per-page mapping)_. Instead of removing the Testimonials block from program pages (supersedes [CB1]/[LA3]), each program page should show testimonials **relevant to that program**. The Programs testimonials CSV is a flat 13-item bucket with **no program field**, so targeting can't be auto-derived. Need a curation mechanism — a `program`/tag field on Testimonials (or a relationship pick on the block) — and the per-page selection sourced from what each **live** program page displays. Career-support keeps its `career` set. _(mechanism AFK; the mapping is HITL — read from live site)_
- [x] **C6 — Team member ordering must follow source role hierarchy** _(done, `3bb29fe`)_ _(all team pages)_. Members are currently in import/CSV order, not the source's deliberate ordering (President → Vice President → … then the rest). Order is **not alphabetical** — it's role-rank. Need an explicit per-member order field (or a role-rank sort) so each Team block renders in the source's order. Generalizes [AC1]. _(AFK — add order field to Team + set from source order)_
- [x] **C5 — Sticky left TOC for content pages** _(done, `b671cf1`)_ _(HITL: scope + which pages)_. Sticky, left-rail table of contents that scroll-spies the page's section headings (mission, faq, and other long prose/Content pages). _Note: the Team page does **not** currently have a TOC (it has a filter/tab bar) — this is net-new, no existing component to reuse._ Needs: anchor IDs auto-derived from headings (Content/prose blocks), a sticky `aside` + scroll-spy highlight, collapses/hides on mobile. Decide which page set gets it.

---

## Global (header / footer / site-wide)

- [x] **G1 — Header nav menu** _(done, `690cc26`)_ _(HITL: D2 + IA)_. Today the header is just logo + "Home" + "Search". Build a real menu (hamburger overlay per D2), keeping the current hero design. Folds in the login/logout control ([#115]). Proposed IA:
  - About Us → Mission · FAQ · Partners · Board & Leadership · Advisory Council · State Committees
  - Programs → Career Support · Community Building · Legal Advocacy · Policy Initiatives · Public Sector Engagement
  - Resources → Federal Employment · Jumuah Services · Fellowships (Young) · Fellowships (Mid-Career→Senior)
  - Members → Portal + member pages (gated → login)
  - Press · Events · Contact · Donate / Join (buttons)

- [x] **G2 — Header icons (and logo) invisible over the dark hero in light mode** _(done, uncommitted)_ → the search + hamburger controls used the dead `text-content` token (no `--color-content` defined), so they inherited the **site** `--foreground` and ignored the header's per-page `data-theme` — on the HighImpact hero in light mode that's dark-on-dark. Also `PageClient` force-set the header theme to `light`, fighting `HighImpactHero`'s `dark`. Fix: icons use `text-foreground` (follows the header `data-theme`), and `PageClient` removed so heros drive the header theme as designed (also fixes the logo variant on the hero). _(AFK)_

- [x] **G3 — Consistent breadcrumbs on all interior pages, with verified links** _(done, uncommitted)_ → breadcrumbs are now **derived render-side** in `[...slug]/page.tsx` from the page's slug + title (Home → section as plain text → current page), overriding the drifted per-page seed data. This eliminates the **4 broken** section-index links (`/members`, `/programs`, `/resources` have no landing page → section crumb is now plain text), fills the **5 missing** pages (about-us trio, donate, join), normalizes the Home-rooted style across all pages, and fixes content bugs surfaced in the audit (final crumb said "Private Sector Engagement" → now "Public…"; em-dash labels → commas). No reseed — derives from DB title/slug. _Follow-up: the now-dead `hero.breadcrumbs` seed arrays + em-dash page **titles** can be cleaned in a reseed (separate)._ _(AFK)_

- [x] **G4 — Surface a prominent Login/Logout control in the header top bar** _(done, uncommitted)_ → moved the single Outseta `o-login-link` / `o-logout-link` pair out of the overlay menu into the always-visible header top bar, immediately **before** the search icon (ids kept unique so the no-code binder still wires the click; `data-o-anonymous` / `data-o-authenticated` show exactly one by auth state). Styled `text-foreground uppercase tracking-wide` to track the per-page header theme. _(AFK — NavMenu)_

- [x] **G5 — Footer does not match the live site** _(done, uncommitted)_ → rebuilt `src/Footer/Component.tsx` to mirror the live footer: brand logo + intro copy, **3 columns** (Programs & Services / About / Follow us), **5 social** links (new tab), and copyright. Structure is **hardcoded** (footer no longer reads the `footer` CMS global — matches the header-nav precedent), brand tokens only. Newsletter is an **inert placeholder** (input + Subscribe), not wired to any provider per request (Mailchimp dropped). Theme selector kept, tucked into the bottom credit row. _(port)_

- [x] **G6 — Home "Latest Updates" slider has no "View all updates" CTA** _(done, uncommitted)_ → added a `cta` block directly after the home Latest Updates slider with a "View all updates" → `/latest-updates` outline button (reused the existing CallToAction block, seed-only — no schema change, avoids cross-branch drift). Reseeded. _(AFK — seed)_

- [x] **G7 — Add a "Latest Updates" link to the header nav + footer** _(done, uncommitted)_ → added "Latest Updates" → `/latest-updates` to the header overlay flat row (`Press · Events · Latest Updates · Contact`, `src/Header/NavMenu.tsx`) and to the footer's "Programs & Services" column (`src/Footer/Component.tsx`, after Events). _(AFK)_

- [x] **G8 — Events not a primary header-nav item** → **Done.** Promoted Events to its own primary nav column with sub-items: Upcoming Events (`/events/upcoming`), MAPS Events (`/events/maps`), Partner Events (`/events/partner`), All Events (`/events`). The three child pages are seeded (`eventsSlice`) as Archive blocks each filtered to one EVENT-type Post category; LowImpact headers give clean `Home / Events / <title>` breadcrumbs (added `events` to `SECTION_LABELS`). Removed Events from the flat row; nav grid bumped to `xl:grid-cols-5` so all five groups sit on one row.

- [x] **G9 — Members nav column renders empty for logged-out visitors** → **Done (show links to all).** Root cause: Outseta's nocode module injects `<style id="o-hide-content-groups">a[href^="/members" i]{display:none!important}`, hiding every member nav link from anonymous users and leaving an empty "Members" heading. But the `/members/*` routes are already gated server-side ([src/middleware.ts](../../src/middleware.ts) verifies the Outseta JWT and redirects unauthenticated requests to login), so the client-side hiding is redundant and only breaks the menu. Fix: a nav-scoped override in `globals.css` (`#primary-menu a[href^='/members' i]{display:revert!important}`) whose `1,1,1` specificity outweighs Outseta's `0,1,1`, so all 7 links show to everyone; a logged-out click just hits the gate and redirects to login (no content leaks). Verified: Outseta's hide style is present yet the 7 links compute `display:inline`.

---

## Home (`/`)

- [x] **H1 — Latest Updates** → slider/carousel showing **12 items** (currently a static 3-card grid). _(AFK seed + C3)_
- [x] **H2 — MAPS Programs cards** → full-bleed image per card, **whole card clickable** → program page, **remove "Learn More" buttons**, keep border. Source images: `4_1.webp` (Career Support), `5_1.webp` (Community Building), `policy.webp` (Policy & Advocacy). _(AFK seed + C4; needs image re-host)_
- [x] **H3 — MAPS Membership cards** → same treatment as H2; cards link → `/join`. Membership card images TBD from source home. _(AFK seed + C4)_
- [x] **H4 — Both Testimonials blocks** (Programs + Membership) → **slider with autoplay** (currently static grids). _(C1 + C2)_
- [x] **H5 — "MAPS National in the community" slider** → move to the **bottom** of the page, right before the footer (currently directly under the hero). _(AFK seed reorder)_
- [x] **Outseta `[domain]` init error** — fixed: single script sets `window.o_options` then injects the SDK (was a `beforeInteractive` race in the route-group layout). _(done, uncommitted in working tree)_
- [ ] **H6 — Small gap above the hero background image** → a thin strip of page background shows between the top of the viewport and the top of the HighImpact hero image. Likely the article wrapper's `pt-16` vs the hero's `-mt-[10.4rem]` pull-up not fully meeting under the fixed header (unverified — confirm in browser). _(AFK — hero/article top offset)_

- [x] **H7 — Member login loops back to home on localhost** → reported: signing in just bounces between login and home. Root cause: [src/middleware.ts](../../src/middleware.ts) redirected anonymous `/members/*` to Outseta's **hosted** login, whose post-login redirect is the **prod** domain — on localhost the token cookie lands on the wrong origin and never returns, so the gate loops (and localhost can't be whitelisted as an Outseta callback). Fix: middleware now bounces anonymous `/members/*` to `/` on `localhost`/`127.0.0.1` instead of the hosted page; devs log in via the **embedded** top-bar Login widget, which writes the cookie same-origin. Prod keeps the hosted gate unchanged. Verified: anon `/members/community-building` → `localhost:3000/` (200), `/members/portal` stays public. _(dev-only)_

- [x] **H8 — Header "Login" did nothing (no modal)** → clicking Login in the top bar had no effect. Root cause: the port gave the anchors element `id="o-login-link"`/`"o-logout-link"` expecting Outseta's nocode module to bind them, but Outseta binds **href fragments** (the source used `href=".../auth?widgetMode=login#o-anonymous"`), not element ids — so the `onClick` only `preventDefault`'d. Fix ([src/Header/NavMenu.tsx](../../src/Header/NavMenu.tsx)): wire the clicks to the SDK — `window.Outseta.auth.open({ widgetMode: 'login' })` opens the login **modal in-page** (no hosted redirect → cookie written same-origin, works on localhost), `window.Outseta.logout()` clears the session. Visibility still handled by `data-o-anonymous`/`data-o-authenticated` (verified: shows exactly one by auth state); dropped the dead ids. Verified: clicking Login renders the `o--Widget--popupBg` modal.

- [ ] **H9 — Verify "Sign in with Google" SSO on prod (external config, not code)** → on localhost the Google social login in the Outseta modal fails with `Error 400: origin_mismatch` because the in-page origin `http://localhost:3000` isn't an authorized JavaScript origin on the Google OAuth client Outseta uses. Not an app bug (`OutsetaScript` doesn't configure Google; it's all Outseta-dashboard/Google-Cloud-side). **Local workaround:** test with email/password login. **To resolve:** if MAPS uses a **custom** Google OAuth client (Outseta → Settings → Login → Google shows a Client ID), add `http://localhost:3000` to its Authorized JavaScript origins in Google Cloud Console for local testing; otherwise (Outseta-managed client) just **verify Google SSO end-to-end on the prod/staging domain**, where the origin is already registered. _(HITL — verify on prod; possible Google Cloud Console origin add)_

## About Us

### `/about-us/mission`

- [x] **M1 — "MAPS in the community" gallery** _(done, `00265f0`/`3bb29fe`; +2 photos still held)_ → add **2 more photos** (7 → 9, fills the 3-col grid evenly) and render the tiles **smaller** (tighter cell size — more columns or smaller aspect). _(AFK seed + MediaGallery)_

### `/about-us/board-leadership`

- [x] **B1 — Missing "State Committee Presidents" group** → the page doesn't show this team group (the 4th group whose category routing was unresolved at assembly). Surface it as its own grouped section on the page. _(AFK seed — map the team category onto this page's Team block)_
- [x] **B2 — Full body copy missing** → only the one-line hero intro is present; the page's full descriptive/section copy from the source was not ported. Pull the complete copy from the source. **Likely systemic** — audit the other About-Us / interior pages for the same thinned-out copy. _(AFK — re-extract from source HTML / live site)_

### `/about-us/advisory-council`

- [x] **AC1 — Member order** → reorder the advisory council members to match the live site's order. _(AFK — read order from live page; set Team category/member ordering)_
- [x] **AC2 — Missing text** → only the one-line hero intro; full page copy missing (same as [B2]). _(AFK — re-extract from source)_

### `/about-us/state-committees`

- [x] **SC1 — Missing text** → only the one-line hero intro; full page copy (committee list + descriptions) missing (same as [B2]). _(AFK — re-extract from source)_

### `/about-us/partners`

- [x] **P1 — Backfill the missing partner logos** → only 3 of ~32 are live (export had only aafen/minaret/uscmo). **Pull the rest from the live site's partners page** — scrape the logo `<img>` CDN URLs off `mapsnational.webflow.io`, download → re-host as Media (extend `rehost:images`). _(AFK — was HITL; live site is the source)_

## Donate / Join / Contact

### `/donate`

- [x] **DN1 — Missing payment logos + QR codes** → the donation methods table is missing the **Zelle** and **PayPal** logos and the **per-method QR codes**. **Assets are on the live site: https://mapsnational.webflow.io/donate** — scrape the logo + QR image URLs, download → re-host as Media, bind into the table. (Confirm SVG handling if any are SVG; QRs are likely PNG.) _(AFK — live site is the source)_

### `/contact-us`

- [x] **CO1 — Add a contact form** _(done — Payload form-builder; #98)_ → `/contact-us` now renders a `formBlock` (Full name · Email · Subject · Message → "Send message") above the contact details. The form is **owned + upserted by `seed-pages`** (by title), so a reseed keeps it and a fresh DB recreates it; notifies `info@mapsnational.org`. **Email delivery:** Webflow's baked-in form email is replaced by a Payload email adapter — `@payloadcms/email-resend`, **env-gated** in `payload.config.ts` like the S3 adapter. Submissions always persist to the `form-submissions` collection (admin); when `RESEND_API_KEY` is set (+ sending domain verified in Resend) the notification emails actually send. Sender driven by `EMAIL_FROM_ADDRESS`/`EMAIL_FROM_NAME` (verify a subdomain e.g. `send.mapsnational.org` so the root Workspace MX/SPF is untouched). Without the key, Payload's console fallback logs the attempt (dev default).

### `/join`

- [x] **JN1 — "Apply" CTAs must open the Outseta plan modal** _(done)_ → the tier "Apply" links dropped `newTab`, so the `…/auth?widgetMode=register&planUid=…#o-anonymous` anchors are no longer `target="_blank"`. The loaded nocode module (`monitorDom`) now intercepts the click and opens the **plan-signup modal in place** (verified: click stays on `/join`, Outseta modal renders) — matching the source.

## Press / Events

### `/press`

- [x] **PR1 — ArchiveBlock card images → consistent 1:1, clip** → cards show images at native ratios (3:2, etc.), so heights vary. Enforce a **consistent** card image aspect (target **1:1**) and `object-cover`-clip any non-square source to fit. Applies to **all ArchiveBlock card images** — confirmed on `/press` **and `/events`**; also home Latest Updates. _(AFK — Card image aspect)_
- [x] **PR2 — Remove card subtitle/description text** → the Card renders a description paragraph (post summary) that makes cards too tall. Drop the description from the Card (keep title + category + image). Applies to **all ArchiveBlock cards**. _(AFK — Card component)_

### `/events`

- [x] **EV1 — "View all updates" → 404** → the button links to `/latest-updates`, which has no seeded page (only this link references that slug). Either **create** a Latest Updates archive page at `/latest-updates` (ArchiveBlock of all Posts) or **repoint** the button to an existing listing. Audit other "View all" CTAs for the same dead slug. _(AFK seed)_

## Members

### `/members/portal`

- [x] **MP1 — Portal landing was a "Coming soon" placeholder** → the post-login landing only had a stub content block (the live site's real portal content was behind Outseta auth, so it wasn't in the static export). Rebuilt it as a **member hub**: a CardGrid of whole-card links to the six existing member areas (Professional Development, MAPS Academy Videos, Community Building, Policy & Legal Advocacy, New York State, Points of Contact), with a short "more rolling out" intro. Verified: `/members/portal` renders the hub with all six links, no placeholder. Expand with real member-only content (event registration, profile) when available. _(AFK seed)_

### `/members/community-building`

- [x] **MCB1 — Make the Signal-chat cards fully clickable, remove buttons** → the **"Join Signal Chat Groups"** cards (MAPS Member & Associate Chat, MAPS Social Chat, MAPS Affiliate Chat) have a "Join" button — make the **whole card** the clickable surface (target = the button's href) and **remove the button**. Same whole-card-clickable + no-button intent as [C4], but these are **imageless** text cards. **Scope: only this Signal-chat section.** _(AFK — CardGrid `enableCardLink` for imageless cards)_
- [x] **MCB2 — State cards keep their buttons** → the **"Connect in your state"** cards (Massachusetts, California, …) **keep** their "Join on Signal" buttons; do **not** make them whole-card links. _(explicit: no change)_

### `/members/new-york-state`

- [x] **NY1 — FeatureSplit images → 16:9, clipped** → images render at their native (square/tall) ratio, dwarfing the opposite text column. Constrain each to a **wide 16:9** aspect and `object-cover` clip so the image height balances the adjacent copy. Apply to **all** FeatureSplit rows on this page. _(AFK — FeatureSplit image aspect/`object-cover`)_
- [x] **NY2 — "MAPS New York in the community" gallery → slider** → convert the photo grid to a slider, same treatment as the home community slider ([H5]). Uses the shared carousel primitive ([C1]). _(AFK seed — MediaGallery slider mode)_

### `/members/maps-academy-vids`

- [x] **AV1 — Video tiles missing thumbnails** _(all AcademyVideos blocks site-wide — also on `/members/policy-legal-advocacy`)_ → tiles show only a play button on a tinted placeholder, no poster image. Add thumbnails — auto-derive from the video ID where possible (YouTube `img.youtube.com/vi/{id}/hqdefault.jpg`; Vimeo via oEmbed) or a `thumbnail` Media field on the collection. _(needs block/import work)_
- [x] **AV2 — Strip "MAPS Academy" prefix from filter tabs** → category filter labels read "MAPS Academy: Public Service Executive & Senior Official Pathways" etc. Drop the redundant "MAPS Academy" prefix from the VideoCategory labels. _(AFK — fix category titles in import/seed)_

## Resources

### `/resources/jumuah-prayer-services-washington-dc`

- [x] **JU1 — Drop a pin per location on the map** _(done, `00265f0`/`3bb29fe`)_ → the MapLocationCards map should show each Jumuah location as a **map pin/marker**, not a single generic embed. _Note: the current block uses the Google Maps **Embed API** (one place per iframe) — multi-marker needs the Maps **JavaScript API** (markers from the `locations` array) or a custom-map embed; meaningful change to the block._ _(needs block work)_
- [x] **JU2 — Shorten slug** _(done, `3bb29fe` — `/resources/jumuah-services` + redirect)_ → `jumuah-prayer-services-washington-dc` is long; consider `jumuah-services`. _(AFK — but breaks any existing inbound links/redirects)_

## Programs

### `/programs/career-support`

- [x] **CS1 — Full-bleed card images** → the three support-area cards have padded, inset images (`p-6` + `aspect-video` inside the border). Make the image **full-bleed** to the card edges (image flush to top/sides, copy padded below). Same full-bleed treatment as [C4]/[H2]. _(AFK — CardGrid full-bleed image variant)_
- [x] **CS2 — Testimonials → slider** → the career testimonials render as a static grid; make them an autoplay slider ([C1]+[C2]).
- [x] **CS3 — Section headline specific to the program** → "What our community says" is generic. Make the testimonials headline (and eyebrow) specific to **training / career support**. _(AFK — per-block heading field)_
- [x] **CS4 — Author names show numeric IDs** → testimonial authors render as `10` / `11` (the legacy numeric slug/ID), not real names. The author name/title field didn't import. **Likely systemic across all Testimonials.** _(AFK — fix testimonials import mapping / backfill author)_

### `/programs/community-building`

- [x] **CB1 — ~~Remove testimonials section~~ → superseded by [C7]** (use targeted testimonials, don't remove). _(AFK seed)_
- [x] **CB2 — ~~Accordions collapsed by default~~ → generalized to [C8]** (global). _(AFK)_

### `/programs/legal-advocacy`

- [x] **LA1 — Full-bleed card images** → same as [CS1] (padded inset images → full-bleed). Confirms the full-bleed CardGrid treatment ([C4]) applies to **all** program CardGrids — apply globally. _(AFK)_
- [x] **LA2 — Shorten button copy** → "Join MAPS and Login to the Portal to Request Support" is too long. Shorten the CTA label. _(AFK seed)_
- [x] **LA3 — ~~Remove testimonials section~~ → superseded by [C7]** (use targeted testimonials). _(AFK seed)_

---

[#66]: https://github.com/saz33m1/payload-poc/issues/66
[#115]: https://github.com/saz33m1/payload-poc/issues/115
