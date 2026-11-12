import { expect, test } from '@playwright/test'
import { login } from './helpers'

test('hub shows next match availability and announcements', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/clubhouse')
  await expect(page.locator('h1')).toHaveText('Spogliatoio')
  await expect(page.getByText('Rall Venezia vs Real Mestre')).toBeVisible()
  await expect(page.getByRole('group', { name: /disponibilità/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Ritrovo prima della partita' })).toBeVisible()
})

test('availability board groups the squad by answer, with "senza risposta" derived', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/clubhouse/availability')
  const group = (label: string) => page.getByRole('region', { name: label, exact: true })
  await expect(group('Ci sono')).toContainText('Salvatore Marigliano')
  await expect(group('Non ci sono')).toContainText('Raffaele Miranda')
  await expect(group('Senza risposta')).toContainText('Francesco Ferrara')
  // players do not see response timestamps, staff do
  await expect(page.locator('.at')).toHaveCount(0)
})

test('staff see the response time next to each answer', async ({ page }) => {
  await login(page, 'staff')
  await page.goto('/clubhouse/availability')
  await expect(page.locator('.at').first()).toBeVisible()
})

test('announcements list; viewers are refused the locker room', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/clubhouse/announcements')
  await expect(page.getByRole('list', { name: 'Annunci' }).getByRole('listitem')).toHaveCount(2)
  await page.context().clearCookies()
  await login(page, 'viewer')
  for (const path of ['/clubhouse', '/clubhouse/availability', '/clubhouse/announcements']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: 'Accesso negato' })).toBeVisible()
  }
})
