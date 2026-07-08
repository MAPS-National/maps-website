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

test('the Members nav link is still shown to anonymous visitors', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  await expect(
    page.locator('#primary-menu').getByRole('link', { name: 'Member Portal' }),
  ).toBeVisible()
})
