import { test, expect } from '@playwright/test'

// Dependency-free accessibility smoke: language set, a single h1, and every image
// carries an alt attribute. (#130) Deeper axe-core coverage can layer on later.
const PAGES = ['/', '/programs', '/latest-updates/maps-academy-climbing-the-federal-ladder']

for (const path of PAGES) {
  test(`a11y smoke: ${path}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('html')).toHaveAttribute('lang', /.+/)
    await expect(page.locator('h1')).toHaveCount(1)
    const missingAlt = await page.locator('img:not([alt])').count()
    expect(missingAlt, 'images missing an alt attribute').toBe(0)
  })
}
