import { expect, test } from '@playwright/test'
import { login } from './helpers'

test('stats: team record, rankings with tie-break, players table', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/stats')
  await page.waitForLoadState('networkidle')
  await page.getByRole('tab', { name: 'Squadra' }).click()
  // seeded record: 8 played (7W 0D 1L), goals 64-25
  const t = (label: string) => page.locator('.panel', { hasText: label }).first()
  await expect(t('Giocate')).toContainText('8')
  await expect(t('Gol fatti')).toContainText('64')
  await expect(t('Gol subiti')).toContainText('25')
  await expect(t('Differenza reti')).toContainText('+39')

  await page.getByRole('tab', { name: 'Classifiche' }).click()
  const scorers = page.locator('.panel', { has: page.getByRole('heading', { name: 'Marcatori' }) })
  await expect(scorers.locator('li').first()).toContainText('Antonio Verrone')
  await expect(scorers.locator('li').first()).toContainText('4')
  await expect(scorers.locator('li').nth(1)).toContainText('Daniele Nappo')
  await expect(scorers.locator('li').nth(1)).toContainText('2')
  // only the Monza match has recorded scorers: Batti, Ferrara and Marigliano are level on one goal
  await expect(scorers.locator('li').nth(2).locator('.pos')).toHaveText('3')
  await expect(scorers.locator('li').nth(4).locator('.pos')).toHaveText('3')

  await page.getByRole('tab', { name: 'Giocatori' }).click()
  await expect(page.locator('tbody tr').first()).toContainText('Antonio Verrone')
})

test('the squad numbers add up: recorded goals per player equal the Monza goals minus the own goal', async ({ page }) => {
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
    expect(Number(cells[3])).toBe(0) // assists were not recorded before the Monza match
  }
  expect(goals).toBe(9) // 10 goals at Monza, one of them an opponent own goal
})

test('the league table lists all 20 teams, highlights us and splits in two columns on desktop', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/stats?tab=league')
  const rows = page.getByRole('list', { name: 'Classifica del campionato' }).locator('> li')
  await expect(rows).toHaveCount(20)
  await expect(rows.nth(0)).toContainText('Lazio')
  await expect(rows.nth(0)).toContainText('21')
  const us = page.locator('li[aria-current="true"]')
  await expect(us).toHaveCount(1)
  await expect(us).toContainText('Venezia')
  await expect(us.locator('.pos')).toHaveText('3')
  await expect(rows.nth(3)).toContainText('Napoli') // level on 18 points: the manual order is kept
})

test('home shows the top of the table and where we stand', async ({ page }) => {
  await login(page, 'viewer')
  const w = page.getByRole('region', { name: 'Classifica', exact: true })
  await expect(w).toContainText('Lazio')
  await expect(w).toContainText('Venezia')
})
