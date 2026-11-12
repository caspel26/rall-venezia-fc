import { expect, test } from '@playwright/test'
import { login } from './helpers'

test('Gazzetta: headline, filters, lead story and cards', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/news')
  await expect(page.locator('h1')).toHaveText('Notizie')
  await expect(page.getByRole('group', { name: 'Filtra per categoria' }).getByRole('button')).toHaveCount(4)
  await expect(page.getByRole('heading', { name: 'Rall Venezia 10-5 Monza: Nappo uomo partita' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Torino: Ferrara MVP|Rall Venezia 10-2 Torino/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Genoa: Batti decisivo/ })).toBeVisible()
})

test('article page: headline, byline, body and match link', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/news/monza-10-5-quest-completata')
  await expect(page.locator('h1')).toHaveText('Rall Venezia 10-5 Monza: Nappo uomo partita')
  await expect(page.getByText('di Staff Dev')).toBeVisible()
  await expect(page.locator('article.art .col .body p')).toHaveCount(3)
  await page.getByRole('link', { name: /vai alla partita/i }).click()
  await expect(page).toHaveURL(/\/matches\/d0000000-0000-4000-8000-00000000000a$/)
})

test('viewers can read the Gazzetta; unknown article is a 404', async ({ page }) => {
  await login(page, 'viewer')
  await page.goto('/news')
  await expect(page.getByRole('heading', { name: 'Rall Venezia 10-5 Monza: Nappo uomo partita' })).toBeVisible()
  await page.goto('/news/non-esiste')
  await expect(page.getByRole('heading', { name: 'Fuori gioco' })).toBeVisible()
})

test('home widget shows the latest headline and links to the Gazzetta', async ({ page }) => {
  await login(page, 'player')
  await expect(page.getByRole('link', { name: /Monza: Nappo uomo partita/ }).first()).toBeVisible()
  await page.getByRole('link', { name: /Tutte le notizie/ }).click()
  await expect(page).toHaveURL(/\/news$/)
})
