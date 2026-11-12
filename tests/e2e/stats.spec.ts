import { expect, test } from '@playwright/test'
import { login } from './helpers'

test('stats: team record, rankings with tie-break, players table', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/stats')
  await page.waitForLoadState('networkidle')
  // seeded record: 3 played, 1W 1D 1L, goals 17-13
  const t = (label: string) => page.locator('.panel', { hasText: label }).first()
  await expect(t('Giocate')).toContainText('3')
  await expect(t('Gol fatti')).toContainText('17')
  await expect(t('Gol subiti')).toContainText('13')
  await expect(t('Differenza reti')).toContainText('+4')

  await page.getByRole('tab', { name: 'Classifiche' }).click()
  const scorers = page.locator('.panel', { has: page.getByRole('heading', { name: 'Marcatori' }) })
  await expect(scorers.locator('li').first()).toContainText('Salvatore Marigliano')
  await expect(scorers.locator('li').first()).toContainText('7')
  await expect(scorers.locator('li').nth(1)).toContainText('Alfonso Avino')
  await expect(page.getByRole('heading', { name: 'Voto medio' })).toBeVisible()

  await page.getByRole('tab', { name: 'Giocatori' }).click()
  await expect(page.locator('tbody tr').first()).toContainText('Salvatore Marigliano')
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
