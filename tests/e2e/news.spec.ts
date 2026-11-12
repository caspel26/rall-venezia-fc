import { expect, test } from '@playwright/test'
import { login } from './helpers'

test('front page: masthead, lead story and secondary stories', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/news')
  await expect(page.getByRole('link', { name: /La Gazzetta Rall, prima pagina/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Monza travolto: al Palazzetto finisce 10-5' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Murano, pareggio pazzo/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Al Lido finisce 4-3/ })).toBeVisible()
})

test('article page: headline, byline, body and match link', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/news/monza-travolto-10-5')
  await expect(page.locator('h1')).toHaveText('Monza travolto: al Palazzetto finisce 10-5')
  await expect(page.getByText('di Staff Dev')).toBeVisible()
  await expect(page.locator('.body p')).toHaveCount(3)
  await page.getByRole('link', { name: /vai alla partita/ }).click()
  await expect(page).toHaveURL(/\/matches\/d0000000-0000-4000-8000-000000000001$/)
})

test('viewers can read the Gazzetta; unknown article is a 404', async ({ page }) => {
  await login(page, 'viewer')
  await page.goto('/news')
  await expect(page.getByRole('heading', { name: 'Monza travolto: al Palazzetto finisce 10-5' })).toBeVisible()
  await page.goto('/news/non-esiste')
  await expect(page.getByRole('heading', { name: 'Fuori gioco' })).toBeVisible()
})

test('home widget shows the latest headline and links to the Gazzetta', async ({ page }) => {
  await login(page, 'player')
  await expect(page.getByRole('link', { name: 'Verso il Real Mestre: ritrovo alle 19:30' })).toBeVisible()
  await page.getByRole('link', { name: 'Prima pagina →' }).click()
  await expect(page).toHaveURL(/\/news$/)
})
