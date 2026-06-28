import { test, expect } from '@playwright/test'

// Search route backed by the search plugin collection. (#127)
test('search page renders with a query input', async ({ page }) => {
  await page.goto('/search')
  await expect(page.getByRole('heading', { name: 'Search', level: 1 })).toBeVisible()
  await expect(page.locator('input').first()).toBeVisible()
})

test('a no-match query shows the empty state', async ({ page }) => {
  await page.goto('/search?q=zzqxqzznomatch')
  await expect(page.getByText('No results found.')).toBeVisible()
})
