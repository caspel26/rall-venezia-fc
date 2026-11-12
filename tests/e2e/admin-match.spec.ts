import { expect, test } from '@playwright/test'
import { login } from './helpers'

test.describe.configure({ mode: 'serial' })

test('players cannot open the admin area', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/admin/matches')
  await expect(page.getByRole('heading', { name: 'Accesso negato' })).toBeVisible()
})

test('staff creates a match, closes it in under a minute, then removes it', async ({ page }) => {
  const opponent = `Test FC ${Date.now()}`
  await login(page, 'staff')

  // 1. create
  await page.goto('/admin/matches/new')
  await page.getByLabel('…oppure nuovo avversario').fill(opponent)
  await page.getByLabel('Data e ora del calcio d’inizio').fill('2030-01-15T20:00')
  await page.getByLabel('Luogo').fill('Palazzetto di prova')
  await page.getByRole('button', { name: 'Crea partita' }).click()
  await expect(page).toHaveURL(/\/admin\/matches$/)
  const item = page.locator('.item', { hasText: opponent })
  await expect(item).toBeVisible()

  // 2. post-match flow, timed
  const started = Date.now()
  await item.getByRole('link', { name: 'Inserisci risultato' }).click()
  await expect(page.getByRole('heading', { name: new RegExp(opponent) })).toBeVisible()
  await page.getByLabel('Gol Rall Venezia').fill('5')
  await page.getByLabel(`Gol ${opponent}`).fill('2')
  for (const n of ['Daniele Nappo', 'Antonio Verrone', 'Alfonso Avino', 'Salvatore Marigliano']) {
    await page.getByLabel(`${n} ha giocato`).check()
  }
  await page.getByRole('button', { name: '+ Aggiungi gol' }).click()
  await page.getByLabel('Marcatore gol 1').selectOption({ label: 'Salvatore Marigliano' })
  await page.getByLabel('Assist gol 1').selectOption({ label: 'Antonio Verrone' })
  await page.getByLabel('Minuto gol 1').fill('4')
  await page.getByRole('button', { name: '+ Aggiungi gol' }).click() // repeats the last scorer
  await page.getByLabel('Minuto gol 2').fill('12')
  await page.getByLabel('MVP', { exact: true }).selectOption({ label: 'Salvatore Marigliano' })
  await page.getByRole('button', { name: 'Salva il risultato' }).click()
  await expect(page.getByText('Tre punti portati a casa')).toBeVisible()
  expect(Date.now() - started).toBeLessThan(60_000)

  // 3. the public match page reflects it
  await page.getByRole('link', { name: 'Vedi la partita' }).click()
  await expect(page.getByLabel('5 a 2')).toBeVisible()
  await expect(page.locator('.timeline li')).toHaveCount(2)
  await expect(page.locator('.timeline li').first()).toContainText('assist Antonio Verrone')
  await expect(page.locator('.hero').getByText('Salvatore Marigliano')).toBeVisible()

  // 4. clean up through the UI
  await page.goto('/admin/matches')
  await page.locator('.item', { hasText: opponent }).getByRole('link', { name: 'Modifica partita' }).click()
  await page.getByRole('button', { name: 'Elimina', exact: true }).click()
  await page.getByRole('button', { name: 'Conferma eliminazione' }).click()
  await expect(page).toHaveURL(/\/admin\/matches$/)
  await expect(page.locator('.item', { hasText: opponent })).toHaveCount(0)
})

test('the result form refuses more goals than the score', async ({ page }) => {
  await login(page, 'staff')
  await page.goto('/admin/matches')
  // the seeded upcoming match is only opened, never saved
  await page.locator('.item').filter({ hasText: 'Real Mestre' }).getByRole('link', { name: 'Inserisci risultato' }).click()
  await page.getByLabel('Gol Rall Venezia').fill('1')
  await page.getByLabel('Gol Real Mestre').fill('0')
  await page.getByLabel('Salvatore Marigliano ha giocato').check()
  await page.getByRole('button', { name: '+ Aggiungi gol' }).click()
  await page.getByRole('button', { name: '+ Aggiungi gol' }).click()
  await page.getByLabel('Marcatore gol 1').selectOption({ label: 'Salvatore Marigliano' })
  await page.getByRole('button', { name: 'Salva il risultato' }).click()
  await expect(page.getByRole('alert').filter({ hasText: '2 gol ma il risultato è 1' })).toBeVisible()
})
