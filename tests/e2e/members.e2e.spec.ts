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
