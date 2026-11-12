import { expect, test } from '@playwright/test'
import { login } from './helpers'

const M1 = 'd0000000-0000-4000-8000-000000000001'
const M_NEXT = 'd0000000-0000-4000-8000-000000000004'

test('archive: upcoming first, then played; filters narrow the list', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/matches')
  const rows = page.getByRole('list', { name: 'Partite' }).getByRole('link')
  await expect(rows).toHaveCount(10) // 2 upcoming + 8 played
  await expect(rows.first()).toContainText('Real Mestre')
  await expect(rows.nth(1)).toContainText('Burano Boys')
  await expect(rows.nth(2)).toContainText('Monza')
  await page.waitForLoadState('networkidle')

  await page.getByRole('tab', { name: 'Giocate' }).click()
  await expect(rows).toHaveCount(8)
  await page.getByRole('tab', { name: 'In programma' }).click()
  await expect(rows).toHaveCount(2)
  await page.getByLabel('Stagione').selectOption({ label: '2026/27' })
  await expect(rows).toHaveCount(2)
})

test('match programme: score, goals timeline, lineup and MVP', async ({ page }) => {
  await login(page, 'player')
  await page.goto(`/matches/${M1}`)
  await expect(page.getByLabel('7 a 1')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Gol' })).toBeVisible()
  await expect(page.locator('.timeline li')).toHaveCount(7)
  await expect(page.locator('.timeline li').first()).toContainText("5'")
  await expect(page.locator('.hero').getByText('MVP')).toBeVisible()
  await expect(page.getByText('Titolari')).toBeVisible()
  await expect(page.locator('.lineup li')).toHaveCount(7)
})

test('viewer can read the match programme', async ({ page }) => {
  await login(page, 'viewer')
  await page.goto(`/matches/${M1}`)
  await expect(page.getByLabel('7 a 1')).toBeVisible()
})

test('upcoming match offers the availability answer to a player', async ({ page }) => {
  await login(page, 'player')
  await page.goto(`/matches/${M_NEXT}`)
  await expect(page.getByRole('group', { name: /disponibilità/i })).toBeVisible()
  await expect(page.getByLabel(/\d+ a \d+/)).toHaveCount(0)
})

test('unknown match is a 404', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/matches/d0000000-0000-4000-8000-0000000000ff')
  await expect(page.getByRole('heading', { name: 'Fuori gioco' })).toBeVisible()
  await page.goto('/matches/not-a-uuid')
  await expect(page.getByRole('heading', { name: 'Fuori gioco' })).toBeVisible()
})
