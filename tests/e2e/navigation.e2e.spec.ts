import { test, expect } from '@playwright/test'

import { openNavMenu } from '../helpers/e2e'

// Header is a single full-screen overlay menu at every breakpoint. (#124)
test('nav overlay opens with hub links and closes', async ({ page }) => {
  await page.goto('/')
  await openNavMenu(page)
  const menu = page.locator('#primary-menu')

  // Group labels double as links to the section hub (the single front door).
  await expect(menu.getByRole('link', { name: 'About Us', exact: true })).toHaveAttribute(
    'href',
    '/about-us',
  )
  await expect(menu.getByRole('link', { name: 'Programs', exact: true })).toHaveAttribute(
    'href',
    '/programs',
  )
  await expect(menu.getByRole('link', { name: 'Member Portal' })).toHaveAttribute(
    'href',
    '/members/portal',
  )

  await page.getByRole('button', { name: 'Close menu' }).click()
  await expect(menu).toBeHidden()
})

test('hub link in the overlay navigates', async ({ page }) => {
  await page.goto('/')
  await openNavMenu(page)
  await page.locator('#primary-menu').getByRole('link', { name: 'Programs', exact: true }).click()
  await expect(page).toHaveURL(/\/programs$/)
})

test('the header search affordance routes to /search', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Search' }).click()
  await expect(page).toHaveURL(/\/search/)
})
