import { expect, test } from '@playwright/test'
import { login } from './helpers'

test('squad lists editorial cards, shirt numbers first, unknown numbers last', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/team')
  const cards = page.getByRole('list', { name: 'Giocatori' }).getByRole('link')
  await expect(cards).toHaveCount(7)
  await expect(cards.first()).toContainText('Daniele Nappo')
  await expect(cards.first()).toContainText('#1')
  await expect(cards.first()).toContainText('Portiere · Capitano')
  await expect(cards.nth(1)).toContainText('Antonio Verrone')
  // the three players without a known number are not given an invented one
  await expect(cards.nth(6)).not.toContainText('#')
})

test('player profile shows derived stats, matches and ratings', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/team/salvatore-marigliano')
  await expect(page.locator('h1')).toHaveText('Salvatore Marigliano')
  await page.waitForLoadState('networkidle') // wait for hydration before clicking tabs
  const stats = page.getByRole('region', { name: 'Statistiche in carriera' })
  await expect(stats.locator('.stat', { hasText: 'Presenze' })).toContainText('3')
  await expect(stats.locator('.stat', { hasText: 'Gol' }).first()).toContainText('7')
  await expect(stats.locator('.stat', { hasText: 'Voto medio' })).toContainText('9,0')

  await page.getByRole('tab', { name: 'Partite' }).click()
  await expect(page.getByText('Murano United')).toBeVisible()
  await page.getByRole('tab', { name: 'Pagelle' }).click()
  await expect(page.getByText('Quattro gol')).toBeVisible()
})

test('tabs are keyboard operable', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/team/daniele-nappo')
  await expect(page.locator('h1')).toHaveText('Daniele Nappo')
  await page.waitForLoadState('networkidle')
  await page.getByRole('tab', { name: 'Panoramica' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'Partite' })).toHaveAttribute('aria-selected', 'true')
})

test('viewers do not get ratings; unknown players are a 404', async ({ page }) => {
  await login(page, 'viewer')
  await page.goto('/team/salvatore-marigliano')
  await expect(page.locator('h1')).toHaveText('Salvatore Marigliano')
  await expect(page.getByRole('tab', { name: 'Pagelle' })).toHaveCount(0)
  await expect(page.getByText('Voto medio')).toHaveCount(0)
  await page.goto('/team/nessuno-qui')
  await expect(page.getByRole('heading', { name: 'Fuori gioco' })).toBeVisible()
})

test('null number player has a profile without a shirt number', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/team/sergio-batti')
  await expect(page.locator('h1')).toHaveText('Sergio Batti')
  await expect(page.locator('.id .num')).toHaveCount(0)
})
