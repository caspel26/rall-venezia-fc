import { expect, test } from '@playwright/test'
import { login } from './helpers'

const TOKEN = 'IGMOCKTOKEN_valid_0123456789abcdef' // accepted by tests/e2e/mock-instagram.mjs

test.describe.configure({ mode: 'serial' })

test('only admins see the Instagram admin page', async ({ page }) => {
  await login(page, 'staff')
  await page.goto('/admin/instagram')
  await expect(page.getByRole('heading', { name: 'Accesso negato' })).toBeVisible()
})

test('sync endpoint refuses anonymous callers and wrong secrets', async ({ request }) => {
  expect((await request.post('/api/instagram/sync')).status()).toBe(401)
  expect((await request.post('/api/instagram/sync', { headers: { 'x-cron-secret': 'wrong' } })).status()).toBe(401)
})

test('connect, import posts as Gazzetta articles, no duplicates, hide one', async ({ page, request }) => {
  await request.post('http://127.0.0.1:3199/__reset') // fresh post ids for this run (phone and desktop share the mock)
  await login(page, 'admin')
  await page.goto('/admin/instagram')

  await page.getByLabel('Token di accesso').fill('IGMOCKTOKEN_rejected_000000000000')
  await page.getByRole('button', { name: 'Collega' }).click()
  await expect(page.getByRole('status')).toContainText('rifiutato')

  await page.getByLabel('Token di accesso').fill(TOKEN)
  await page.getByRole('button', { name: 'Collega' }).click()
  await expect(page.getByRole('status')).toContainText('@rallvenezia_mock')
  // the token is write-only: it is nowhere in the page
  expect(await page.content()).not.toContain(TOKEN)

  await page.getByRole('button', { name: 'Sincronizza ora' }).click()
  await expect(page.getByRole('status')).toContainText('2 nuovi post')
  await page.getByRole('button', { name: 'Sincronizza ora' }).click()
  await expect(page.getByRole('status')).toContainText('Nessun nuovo post')

  // the scheduler path (shared secret) also works and finds nothing new
  const cron = await request.post('/api/instagram/sync', { headers: { 'x-cron-secret': 'test-cron-secret' } })
  expect(cron.status()).toBe(200)
  expect((await cron.json()).imported).toBe(0)

  // articles: headline from the caption, cover from the first image, link back to the post
  await page.goto('/news')
  const lead = page.getByRole('heading', { name: 'Domani si torna in campo' })
  await expect(lead).toBeVisible() // newest post leads the front page
  const heading = page.getByRole('heading', { name: 'Tre punti pesantissimi!' })
  await expect(heading).toBeVisible()
  await heading.getByRole('link').click()
  await expect(page.getByText('Vittoria 10-5 contro il Monza.')).toBeVisible()
  await expect(page.getByText('#rallvenezia')).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Vedi il post su Instagram/ })).toHaveAttribute('href', 'https://www.instagram.com/p/MOCK1/')
  await expect(page.locator('.cover img')).toBeVisible()

  // hide both so the seed Gazzetta is back to normal; they stay hidden after the next sync
  await page.goto('/admin/news')
  for (const t of ['Tre punti pesantissimi!', 'Domani si torna in campo']) {
    // earlier runs leave hidden rows with the same headline: act on the visible one
    const visible = page.locator('.row', { hasText: t }).filter({ has: page.getByRole('button', { name: 'Nascondi' }) })
    await visible.getByRole('button', { name: 'Nascondi' }).click()
    await expect(visible).toHaveCount(0)
  }
  await page.goto('/admin/instagram')
  await page.getByRole('button', { name: 'Sincronizza ora' }).click()
  await expect(page.getByRole('status')).toContainText('Nessun nuovo post')
  await page.goto('/news')
  await expect(page.getByRole('heading', { name: 'Tre punti pesantissimi!' })).toHaveCount(0)

  // leave no connection behind
  await page.goto('/admin/instagram')
  await page.getByRole('button', { name: 'Scollega' }).click()
  await page.getByRole('button', { name: 'Conferma' }).click()
  await expect(page.getByText('Non collegato')).toBeVisible()
})
