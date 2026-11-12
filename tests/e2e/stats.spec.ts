import { expect, test } from '@playwright/test'
import { login } from './helpers'

test('stats: team record, rankings with tie-break, players table', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/stats')
  await page.waitForLoadState('networkidle')
  // seeded record: 8 played (5W 1D 2L), goals 62-37
  const t = (label: string) => page.locator('.panel', { hasText: label }).first()
  await expect(t('Giocate')).toContainText('8')
  await expect(t('Gol fatti')).toContainText('62')
  await expect(t('Gol subiti')).toContainText('37')
  await expect(t('Differenza reti')).toContainText('+25')

  await page.getByRole('tab', { name: 'Classifiche' }).click()
  const scorers = page.locator('.panel', { has: page.getByRole('heading', { name: 'Marcatori' }) })
  await expect(scorers.locator('li').first()).toContainText('Antonio Verrone')
  await expect(scorers.locator('li').first()).toContainText('31')
  await expect(scorers.locator('li').nth(1)).toContainText('Daniele Nappo')
  await expect(scorers.locator('li').nth(1)).toContainText('16')
  // the other five are level on 3 goals and 8 games: they share third place
  await expect(scorers.locator('li').nth(2).locator('.pos')).toHaveText('3')
  await expect(scorers.locator('li').nth(4).locator('.pos')).toHaveText('3')
  await expect(page.getByRole('heading', { name: 'Voto medio' })).toBeVisible()

  await page.getByRole('tab', { name: 'Giocatori' }).click()
  await expect(page.locator('tbody tr').first()).toContainText('Antonio Verrone')
})

test('viewers get no rating columns or ranking', async ({ page }) => {
  await login(page, 'viewer')
  await page.goto('/stats')
  await page.waitForLoadState('networkidle')
  await page.getByRole('tab', { name: 'Classifiche' }).click()
  await expect(page.getByRole('heading', { name: 'Voto medio' })).toHaveCount(0)
  await page.getByRole('tab', { name: 'Giocatori' }).click()
  await expect(page.getByRole('columnheader', { name: 'Voto' })).toHaveCount(0)
})

test('ratings archive renders pagelle natively and filters by player', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/ratings')
  const cards = page.locator('ul[aria-label="Pagelle"] > li')
  await expect(cards).toHaveCount(5) // the unpublished draft is not shown
  await expect(page.getByText('Solido in difesa e affidabile')).toBeVisible()
  await expect(page.getByText('POSIZIONAMENTO', { exact: true })).toBeVisible()
  await page.waitForLoadState('networkidle')
  await page.getByLabel('Giocatore').selectOption({ label: 'Daniele Nappo' })
  await expect(cards).toHaveCount(2)
})

test('viewer is refused the ratings archive', async ({ page }) => {
  await login(page, 'viewer')
  await page.goto('/ratings')
  await expect(page.getByRole('heading', { name: 'Accesso negato' })).toBeVisible()
})

test('the squad numbers add up: goals per player sum to the team goals, everyone has assists', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/stats')
  await page.waitForLoadState('networkidle')
  await page.getByRole('tab', { name: 'Giocatori' }).click()
  const rows = page.locator('tbody tr')
  await expect(rows).toHaveCount(7)
  let goals = 0
  for (const r of await rows.all()) {
    const cells = await r.locator('td').allInnerTexts()
    goals += Number(cells[2])
    expect(Number(cells[3])).toBeGreaterThanOrEqual(5) // assists: "tanti"
  }
  expect(goals).toBe(62)
})
