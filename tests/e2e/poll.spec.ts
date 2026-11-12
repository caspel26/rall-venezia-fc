import { expect, test } from '@playwright/test'
import { login } from './helpers'

test('a player votes several days at once from Home, and the choice persists', async ({ page }) => {
  await login(page, 'player')
  const days = page.getByRole('group', { name: 'Scegli i giorni in cui ci sei' })
  await expect(days).toBeVisible()
  const day = (i: number) => days.getByRole('button').nth(i)

  // start from a known state whatever an earlier run left behind
  for (const i of [0, 1, 2, 3, 4]) {
    if ((await day(i).getAttribute('aria-pressed')) === 'true') await day(i).click()
  }
  await expect(day(0)).toHaveAttribute('aria-pressed', 'false')

  await day(0).click() // lunedì
  await day(2).click() // mercoledì
  await day(4).click() // venerdì
  await expect(day(0)).toHaveAttribute('aria-pressed', 'true')
  await expect(day(2)).toHaveAttribute('aria-pressed', 'true')
  await expect(day(4)).toHaveAttribute('aria-pressed', 'true')
  await expect(day(1)).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('status').filter({ hasText: 'Giorni scelti' })).toContainText('lunedì')

  await page.reload()
  const again = page.getByRole('group', { name: 'Scegli i giorni in cui ci sei' }).getByRole('button')
  await expect(again.nth(0)).toHaveAttribute('aria-pressed', 'true')
  await expect(again.nth(2)).toHaveAttribute('aria-pressed', 'true')
  await expect(again.nth(4)).toHaveAttribute('aria-pressed', 'true')
  await expect(again.nth(3)).toHaveAttribute('aria-pressed', 'false')
})

test('the most voted day is marked and the page lists who is coming each day', async ({ page }) => {
  await login(page, 'staff')
  await page.goto('/clubhouse/poll')
  const cols = page.getByRole('list', { name: 'Chi viene, giorno per giorno' })
  await expect(cols.locator('> li')).toHaveCount(5)
  // seeded: Wednesday has the most votes (Verrone, Avino, Marigliano, Batti, Ferrara and maybe the player)
  const wed = cols.locator('> li').nth(2)
  await expect(wed).toContainText('Antonio Verrone')
  await expect(wed).toContainText('Salvatore Marigliano')
  await expect(page.getByLabel('Giorno più votato')).toHaveCount(1)
  // staff do not vote (no linked player): the chips are disabled
  await expect(page.getByRole('group', { name: 'Scegli i giorni in cui ci sei' }).getByRole('button').first()).toBeDisabled()
})

test('viewers are kept out of the poll', async ({ page }) => {
  await login(page, 'viewer')
  await page.goto('/clubhouse/poll')
  await expect(page.getByRole('heading', { name: 'Accesso negato' })).toBeVisible()
})

test('the scheduler endpoint is closed to strangers', async ({ request }) => {
  expect((await request.post('/api/polls/ensure')).status()).toBe(401)
  expect((await request.post('/api/polls/ensure', { headers: { 'x-cron-secret': 'wrong' } })).status()).toBe(401)
  // the shared secret is accepted; with no match yesterday nothing is created
  const ok = await request.post('/api/polls/ensure', { headers: { 'x-cron-secret': 'test-cron-secret' } })
  expect(ok.status()).toBe(200)
  expect((await ok.json()).created).toBe(false)
})

test('the poll can be shared to the WhatsApp group with a ready message', async ({ page }) => {
  await login(page, 'staff')
  await page.goto('/clubhouse/poll')
  const wa = page.getByRole('link', { name: 'Condividi su WhatsApp' })
  await expect(wa).toBeVisible()
  const href = await wa.getAttribute('href')
  expect(href).toMatch(/^https:\/\/wa\.me\/\?text=/)
  const msg = decodeURIComponent(href!.replace('https://wa.me/?text=', ''))
  expect(msg).toContain('Sondaggio Rall Venezia')
  expect(msg).toContain('/clubhouse/poll')
  expect(msg).toContain('Si chiude venerdì alle 20:00')
  await expect(wa).toHaveAttribute('target', '_blank')
  await expect(page.getByRole('button', { name: 'Copia messaggio' })).toBeVisible()
})
