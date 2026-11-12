import { expect, test } from '@playwright/test'
import { login } from './helpers'

const isPhone = () => test.info().project.name === 'phone'

test('player sees the five-item navigation and can move between sections', async ({ page }) => {
  await login(page, 'player')
  const nav = isPhone() ? page.locator('.bottom-nav') : page.locator('.rail').getByRole('navigation', { name: 'Navigazione principale' })
  for (const label of ['Home', 'Partite', 'Squadra', 'Stats', 'Spogliatoio']) {
    await expect(nav.getByRole('link', { name: label })).toBeVisible()
  }
  await nav.getByRole('link', { name: 'Partite' }).click()
  await expect(page).toHaveURL(/\/matches$/)
  await expect(page.locator('h1')).toHaveText('Partite')
  await expect(nav.getByRole('link', { name: 'Partite' })).toHaveAttribute('aria-current', 'page')
  // exactly one navigation is visible at a time
  await expect(page.locator(isPhone() ? '.rail' : '.bottom-nav')).toBeHidden()
})

test('viewer has no Spogliatoio and is refused on team routes', async ({ page }) => {
  await login(page, 'viewer')
  const nav = isPhone() ? page.locator('.bottom-nav') : page.locator('.rail')
  await expect(nav.getByRole('link', { name: 'Spogliatoio' })).toHaveCount(0)
  await page.goto('/clubhouse')
  await expect(page.getByRole('heading', { name: 'Accesso negato' })).toBeVisible()
  await expect(page.getByText('Questa zona dello spogliatoio non è per te.')).toBeVisible()
})

test('admin area: staff yes, player no', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'Accesso negato' })).toBeVisible()
  await page.getByRole('button', { name: 'Torna alla home' }).click()
  await page.context().clearCookies()
  await login(page, 'staff')
  await page.goto('/admin')
  await expect(page.locator('h1')).toHaveText('Admin')
})

test('unknown routes show the branded 404', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/non-esiste')
  await expect(page.getByRole('heading', { name: 'Fuori gioco' })).toBeVisible()
})

test('no horizontal scroll on the shell', async ({ page }) => {
  await login(page, 'player')
  for (const path of ['/', '/matches', '/team', '/stats', '/clubhouse']) {
    await page.goto(path)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow, path).toBeLessThanOrEqual(0)
  }
})
