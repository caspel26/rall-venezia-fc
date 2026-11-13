import { existsSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { login } from './helpers'

test('squad lists editorial cards ordered by shirt number', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/team')
  const cards = page.getByRole('list', { name: 'Giocatori' }).getByRole('link')
  await expect(cards).toHaveCount(8)
  await expect(cards.first()).toContainText('Daniele Nappo')
  await expect(cards.first()).toContainText('Daniele')
  await expect(cards.first()).toContainText('Portiere')
  await expect(cards.nth(1)).toContainText('Sergio Batti')
  await expect(cards.nth(1)).toContainText('Sergio')
  await expect(cards.nth(1)).toContainText('Difensore')
  await expect(cards.nth(3)).toContainText('Antonio Verrone')
  await expect(cards.nth(3)).toContainText('Esterno') // an Esterno, not a midfielder
  await expect(cards.nth(5)).toContainText('Raffaele Miranda')
  await expect(cards.nth(5)).toContainText('Laterale / Jolly')
  await expect(cards.nth(6)).toContainText('Sepe')
  await expect(cards.nth(7)).toContainText('Alfonso')
})

test('player profile shows derived stats and matches', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/team/salvatore-marigliano')
  await expect(page.locator('h1')).toHaveText('Salvatore Marigliano')
  await page.waitForLoadState('networkidle') // wait for hydration before clicking tabs
  const stats = page.getByLabel('Statistiche in carriera')
  await expect(stats.locator('.stat', { hasText: 'Presenze' })).toContainText('8')
  await expect(stats.locator('.stat', { hasText: 'Gol' }).first()).toContainText('3')

  await page.getByRole('tab', { name: 'Partite' }).click()
  await expect(page.locator('#main').getByText('Lazio')).toBeVisible()
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

test('viewers can read profiles; unknown players are a 404', async ({ page }) => {
  await login(page, 'viewer')
  await page.goto('/team/salvatore-marigliano')
  await expect(page.locator('h1')).toHaveText('Salvatore Marigliano')
  await page.goto('/team/nessuno-qui')
  await expect(page.getByRole('heading', { name: 'Fuori gioco' })).toBeVisible()
})

test('player photos come from private storage and render on cards and profiles', async ({ page }) => {
  test.skip(!existsSync('private-assets/players/daniele-nappo/portrait.webp'), 'player photos are not in this checkout (they are private)')
  await login(page, 'player')
  await page.goto('/team')
  const img = page.getByRole('img', { name: 'Daniele Nappo' }).first()
  await expect(img).toBeVisible()
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(300)
  expect(await img.getAttribute('src')).toContain('/storage/v1/object/sign/player-photos/daniele-nappo/portrait.webp')

  await page.goto('/team/francesco-ferrara')
  const hero = page.getByRole('img', { name: 'Francesco Ferrara' })
  await expect(hero).toBeVisible()
  expect(await hero.getAttribute('src')).toContain('francesco-ferrara/portrait.webp')
})

test('the bucket is private: unsigned URLs do not serve photos', async ({ request }) => {
  const res = await request.get('http://127.0.0.1:54321/storage/v1/object/public/player-photos/daniele-nappo/portrait.webp')
  expect(res.status()).toBeGreaterThanOrEqual(400)
})

test('staff appear under the squad: coach with photo, social media manager', async ({ page }) => {
  await login(page, 'viewer')
  await page.goto('/team')
  const staff = page.locator('section.staff')
  await expect(staff.getByRole('heading', { name: 'Staff' })).toBeVisible()
  await expect(staff).toContainText('Pasquale')
  await expect(staff).toContainText('Allenatore / Mister')
  await expect(staff).toContainText('Benito')
  await expect(staff).toContainText('Secondo allenatore')
  await expect(staff).toContainText('Giuseppe')
  await expect(staff).toContainText('Casillo')
  await expect(staff).toContainText('Social media manager')
})
