import { test, expect } from '@playwright/test'

// Server-side members gate (src/proxy.ts). On localhost an unauthenticated request
// to a gated /members/* path bounces to home; the portal landing stays public. (#128)
test('members portal landing is public', async ({ page }) => {
  const res = await page.goto('/members/portal')
  expect(res?.status()).toBeLessThan(400)
})

test('a gated members route redirects an anonymous visitor to home', async ({ page }) => {
  await page.goto('/members/community-building')
  await expect(page).toHaveURL('http://localhost:3000/')
})

// The members door is the header Login control (Outseta), shown to anonymous
// visitors. The dedicated Members nav section was retired when the IA was
// simplified to About Us / Programs / Press, so the entry point is the Login
// button rather than a "Member Portal" nav link. (#128, updated)
test('anonymous visitors see the header Login control', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Login' }).first()).toBeVisible()
})

// A /members link inside post body renders BOTH a placeholder (anonymous) and the
// real link (members), toggled at runtime by Outseta's data-o-* body attributes.
// Outseta's script is not loaded here, so both are in the DOM — assert the converter
// emitted the right pair. The seed (#250) gives this post an inline /members link.
// ponytail: can't truly assert "anonymous hides link / member shows it" in e2e —
// that toggle is Outseta's runtime CSS, un-testable without its script + a member
// session. Verified separately for the nav via the same mechanism.
test('a members link in post body renders a placeholder and the real member link', async ({
  page,
}) => {
  await page.goto('/latest-updates/maps-academy-climbing-the-federal-ladder')

  // Placeholders: one per gated link (the /members portal + the Luma link), each
  // shown to anonymous visitors and NOT an a[href^="/members"] (or Outseta would
  // hide it too).
  const placeholders = page.locator('.payload-richtext [data-o-anonymous="true"]')
  await expect(placeholders).toHaveCount(2)
  await expect(placeholders.first()).toContainText('Members-only link. Log in to view.')
  await expect(placeholders.locator('a[href^="/members" i]')).toHaveCount(0)

  // Real link: shown to members, inside the authenticated wrapper.
  const realLink = page.locator(
    '.payload-richtext [data-o-authenticated="true"] a[href="/members/portal"]',
  )
  await expect(realLink).toHaveText('event link')

  // A Luma event link is gated the same way (member-only RSVP), even though Outseta
  // doesn't hide it — the data-o-* wrappers do the gating.
  const lumaLink = page.locator(
    '.payload-richtext [data-o-authenticated="true"] a[href*="luma.com" i]',
  )
  await expect(lumaLink).toHaveText('Luma')
})
