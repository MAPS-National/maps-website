import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test.describe('Admin Panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }, testInfo) => {
    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto('http://localhost:3000/admin')
    await expect(page).toHaveURL('http://localhost:3000/admin')
    const dashboardArtifact = page.locator('span[title="Dashboard"]').first()
    await expect(dashboardArtifact).toBeVisible()
  })

  test('can navigate to list view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users')
    await expect(page).toHaveURL('http://localhost:3000/admin/collections/users')
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to edit view', async () => {
    await page.goto('http://localhost:3000/admin/collections/pages/create')
    await expect(page).toHaveURL(/\/admin\/collections\/pages\/[a-zA-Z0-9-_]+/)
    const editViewArtifact = page.locator('input[name="title"]')
    await expect(editViewArtifact).toBeVisible()
  })

  // Full CRUD: build a Page from a block, publish it, and confirm the public
  // route renders it. `layout` is required, so a successful publish (200) proves
  // the page carries at least one block. (#129)
  let createdSlug = ''

  test('can create a page with a block and publish it', async () => {
    await page.goto('http://localhost:3000/admin/collections/pages/create')
    await expect(page.locator('#field-title')).toBeVisible()

    // Title drives the auto-generated slug.
    await page.fill('#field-title', `E2E CRUD ${Date.now()}`)

    // The layout blocks field lives under the "Content" tab. Add one block (Call
    // to Action has no required fields) from the blocks drawer.
    await page.locator('.tabs-field__tab-button', { hasText: 'Content' }).click()
    await page.getByRole('button', { name: 'Add Layout' }).click()
    await page.locator('.blocks-drawer__block', { hasText: 'Call to Action' }).click()

    // Publish (drafts are enabled, so the action reads "Publish changes"). Wait
    // for the save request itself rather than the transient toast.
    const [resp] = await Promise.all([
      page.waitForResponse(
        (r) => /\/api\/pages/.test(r.url()) && r.request().method() === 'PATCH',
        { timeout: 20000 },
      ),
      page.getByRole('button', { name: 'Publish changes' }).click(),
    ])
    expect(resp.status()).toBe(200)

    createdSlug = await page.locator('#field-slug').inputValue()
    expect(createdSlug).toBeTruthy()
  })

  test('the published page renders on the front-end', async () => {
    expect(createdSlug).toBeTruthy()
    const res = await page.goto(`http://localhost:3000/${createdSlug}`)
    expect(res?.status()).toBeLessThan(400)
    await expect(page.locator('article')).toBeVisible()
  })
})
