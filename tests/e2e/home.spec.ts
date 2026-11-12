import { expect, test } from '@playwright/test'
import { login } from './helpers'

test('home shows the next match, last result, form and availability for a player', async ({ page }) => {
  await login(page, 'player')
  await expect(page.locator('#main').getByText('Prossima partita').first()).toBeVisible()
  await expect(page.locator('#main').getByText('Real Mestre').first()).toBeVisible()
  await expect(page.getByRole('group', { name: /disponibilità/i })).toBeVisible()
  await expect(page.locator('#main').getByText('Ultimo risultato')).toBeVisible()
  await expect(page.getByLabel('4 a 4')).toBeVisible() // seeded last match
  await expect(page.getByRole('list', { name: 'Ultimi risultati' }).getByRole('listitem')).toHaveCount(5)
  await expect(page.locator('#main').getByText('Capocannoniere')).toBeVisible()
})

test('answering availability is one tap, saved, and survives a reload', async ({ page }) => {
  await login(page, 'player')
  const group = () => page.getByRole('group', { name: /disponibilità/i })
  const btn = (name: string) => group().getByRole('button', { name, exact: true })
  // start from a known state whatever an earlier run left behind
  await btn('Forse').click()
  await expect(btn('Forse')).toHaveAttribute('aria-pressed', 'true')

  await btn('Ci sono').click() // the single tap a player needs
  await expect(btn('Ci sono')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('status').filter({ hasText: 'Risposta salvata' })).toBeVisible()
  await page.reload()
  await expect(btn('Ci sono')).toHaveAttribute('aria-pressed', 'true')
  await expect(btn('Forse')).toHaveAttribute('aria-pressed', 'false')
})

test('viewer sees results but no availability, pagelle or announcements', async ({ page }) => {
  await login(page, 'viewer')
  await expect(page.locator('#main').getByText('Ultimo risultato')).toBeVisible()
  await expect(page.getByRole('group', { name: /disponibilità/i })).toHaveCount(0)
  await expect(page.getByText('In evidenza')).toHaveCount(0)
  await expect(page.getByText('Disponibilità', { exact: true })).toHaveCount(0)
})

test('staff sees the availability counts without a selector', async ({ page }) => {
  await login(page, 'staff')
  await expect(page.getByText('Senza risposta')).toBeVisible()
  await expect(page.getByRole('group', { name: /disponibilità/i })).toHaveCount(0)
})
