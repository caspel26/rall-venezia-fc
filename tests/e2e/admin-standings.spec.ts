import { expect, test } from '@playwright/test'
import { login } from './helpers'

test.describe.configure({ mode: 'serial' })

const ORIGINAL = ['Lazio 21', 'Como 19', 'Venezia 18', 'Napoli 18', 'Parma 16', 'Milan 15', 'Atalanta 13', 'Sassuolo 12', 'Monza 12', 'Cagliari 12',
  'Inter 10', 'Genoa 9', 'Roma 9', 'Udinese 9', 'Bologna 6', 'Juventus 6', 'Lecce 3', 'Fiorentina 0', 'Frosinone 0', 'Torino 0'].join('\n')

async function restore(page: import('@playwright/test').Page) {
  await page.goto('/admin/standings')
  await page.getByText('Incolla la classifica').click()
  await page.getByLabel('Classifica da incollare').fill(ORIGINAL)
  await page.getByRole('button', { name: 'Leggi la lista' }).click()
  await page.getByRole('button', { name: 'Salva la classifica' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Classifica salvata' })).toBeVisible()
}

test('players cannot open the standings editor', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/admin/standings')
  await expect(page.getByRole('heading', { name: 'Accesso negato' })).toBeVisible()
})

test('staff change points by hand and the table reorders everywhere', async ({ page }) => {
  await login(page, 'staff')
  await page.goto('/admin/standings')
  await page.getByLabel('Punti di Venezia').fill('25')
  await page.getByRole('button', { name: 'Salva la classifica' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Classifica salvata' })).toBeVisible()

  await page.goto('/stats?tab=league')
  const us = page.locator('li[aria-current="true"]')
  await expect(us.locator('.pos')).toHaveText('1')
  await expect(us).toContainText('25')
  await page.goto('/')
  await expect(page.getByRole('region', { name: 'Classifica', exact: true }).locator('li').first()).toContainText('Venezia')
  await restore(page)
})

test('a pasted table replaces the list and a tie can be settled by hand', async ({ page }) => {
  await login(page, 'staff')
  await page.goto('/admin/standings')
  await page.getByText('Incolla la classifica').click()
  await page.getByLabel('Classifica da incollare').fill('1 Venezia 30\n2. Lazio - 21\n3) Como, 21\n4 Napoli 5')
  await page.getByRole('button', { name: 'Leggi la lista' }).click()
  await expect(page.getByRole('status')).toContainText('4 squadre')
  // Lazio and Como are level: move Como above Lazio
  await page.getByRole('button', { name: 'Sposta Como su (a pari punti)' }).click()
  await page.getByRole('button', { name: 'Salva la classifica' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Classifica salvata' })).toBeVisible()

  await page.goto('/stats?tab=league')
  const rows = page.getByRole('list', { name: 'Classifica del campionato' }).locator('> li')
  await expect(rows).toHaveCount(4)
  await expect(rows.nth(1)).toContainText('Como')
  await expect(rows.nth(2)).toContainText('Lazio')
  await restore(page)
  await page.goto('/stats?tab=league')
  await expect(page.getByRole('list', { name: 'Classifica del campionato' }).locator('> li')).toHaveCount(20)
})
