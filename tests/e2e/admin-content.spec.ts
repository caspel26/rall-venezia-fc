import { expect, test } from '@playwright/test'
import { login } from './helpers'

test.describe.configure({ mode: 'serial' })

test('staff adds a player, sees the number rules enforced, and removes them', async ({ page }) => {
  const first = `Prova${Date.now().toString(36)}`
  await login(page, 'staff')
  await page.goto('/admin/players/new')
  await page.getByLabel('Nome', { exact: true }).fill(first)
  await page.getByLabel('Cognome').fill('Tester')
  await page.getByLabel('Numero di maglia').fill('8') // taken by Antonio Verrone
  await page.getByRole('button', { name: 'Aggiungi giocatore' }).click()
  await expect(page.getByRole('alert')).toContainText('già di un altro giocatore')

  await page.getByLabel('Numero di maglia').fill('') // numbers are never invented: none is fine
  await page.getByLabel('Ruolo').selectOption('pivot')
  await page.getByRole('button', { name: 'Aggiungi giocatore' }).click()
  await expect(page).toHaveURL(/\/admin\/players$/)
  await expect(page.getByText(`${first} Tester`)).toBeVisible()

  await page.goto('/team')
  await expect(page.getByRole('link', { name: new RegExp(`${first} Tester`) })).toBeVisible()

  await page.goto('/admin/players')
  await page.locator('.row', { hasText: first }).getByRole('link', { name: 'Modifica' }).click()
  await page.getByRole('button', { name: 'Elimina', exact: true }).click()
  await page.getByRole('button', { name: 'Conferma eliminazione' }).click()
  await expect(page).toHaveURL(/\/admin\/players$/)
  await expect(page.getByText(`${first} Tester`)).toHaveCount(0)
})

test('only admins link accounts to players', async ({ page }) => {
  await login(page, 'staff')
  await page.goto('/admin/players')
  await page.locator('.row', { hasText: 'Antonio Verrone' }).getByRole('link', { name: 'Modifica' }).click()
  await expect(page.getByLabel('Account collegato')).toHaveCount(0)
  await page.context().clearCookies()
  await login(page, 'admin')
  await page.goto('/admin/players')
  await page.locator('.row', { hasText: 'Antonio Verrone' }).getByRole('link', { name: 'Modifica' }).click()
  await expect(page.getByLabel('Account collegato')).toBeVisible()
})

test('announcements: publish, edit and delete', async ({ page }) => {
  const title = `Avviso ${Date.now()}`
  await login(page, 'staff')
  await page.goto('/admin/announcements')
  await page.getByLabel('Titolo').fill(title)
  await page.getByLabel('Testo').fill('Domani allenamento alle 21.')
  await page.getByRole('button', { name: 'Pubblica' }).click()
  const row = page.locator('.row', { hasText: title })
  await expect(row).toBeVisible()
  await page.goto('/clubhouse/announcements')
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
  await page.goto('/admin/announcements')
  await page.locator('.row', { hasText: title }).getByRole('button', { name: 'Elimina' }).click()
  await page.locator('.row', { hasText: title }).getByRole('button', { name: 'Conferma' }).click()
  await expect(page.locator('.row', { hasText: title })).toHaveCount(0)
})

test('Gazzetta: write an article, read it, delete it; drafts stay hidden from players', async ({ page, browser }) => {
  const title = `Notizia ${Date.now()}`
  await login(page, 'staff')
  await page.goto('/admin/news')
  await page.getByLabel('Occhiello').fill('ULTIM’ORA')
  await page.getByLabel('Titolo').fill(title)
  await page.getByLabel('Testo').fill('Primo paragrafo.\n\nSecondo paragrafo.')
  await page.getByLabel(/Pubblicato/).uncheck() // draft
  await page.getByRole('button', { name: 'Pubblica' }).click()
  await expect(page.locator('.row', { hasText: title })).toContainText('Bozza')

  const ctx = await browser.newContext({ baseURL: test.info().project.use.baseURL })
  const p2 = await ctx.newPage()
  await login(p2, 'player')
  await p2.goto('/news')
  await expect(p2.getByText(title)).toHaveCount(0)
  await ctx.close()

  await page.locator('.row', { hasText: title }).getByRole('button', { name: 'Modifica' }).click()
  await page.getByLabel(/Pubblicato/).check()
  await page.getByRole('button', { name: 'Salva' }).click()
  await page.goto('/news')
  await expect(page.getByRole('heading', { name: title })).toBeVisible()

  await page.goto('/admin/news')
  await page.locator('.row', { hasText: title }).getByRole('button', { name: 'Elimina' }).click()
  await page.locator('.row', { hasText: title }).getByRole('button', { name: 'Conferma' }).click()
  await expect(page.locator('.row', { hasText: title })).toHaveCount(0)
})

test('users: invite, change role, remove; the last admin cannot be demoted', async ({ page }) => {
  const email = `nuovo-${Date.now()}@example.invalid`
  await login(page, 'admin')
  await page.goto('/admin/users')
  await page.getByLabel('Email').fill(email)
  await page.locator('#irole').selectOption('viewer')
  await page.getByRole('button', { name: 'Invia invito' }).click()
  await expect(page.getByRole('status')).toContainText('Invito inviato')

  const row = page.locator('.u', { hasText: email })
  await row.getByLabel(`Ruolo di ${email}`).selectOption('staff')
  await expect(page.getByRole('status')).toContainText('Ruolo aggiornato')

  await page.locator('.u', { hasText: 'admin@example.invalid' }).getByLabel('Ruolo di admin@example.invalid').selectOption('staff')
  await expect(page.getByRole('status')).toContainText('almeno un admin')

  await row.getByRole('button', { name: 'Rimuovi' }).click()
  await row.getByRole('button', { name: 'Conferma' }).click()
  await expect(page.getByRole('status')).toContainText('Utente rimosso')
})

test('staff do not get the Utenti tab and cannot open it', async ({ page }) => {
  await login(page, 'staff')
  await page.goto('/admin/matches')
  await expect(page.getByRole('navigation', { name: 'Sezioni admin' }).getByRole('link', { name: 'Utenti' })).toHaveCount(0)
  await page.goto('/admin/users')
  await expect(page.getByRole('heading', { name: 'Accesso negato' })).toBeVisible()
})

test('Gazzetta: a hand-written article can carry a photo from the admin', async ({ page }) => {
  const title = `Con foto ${Date.now()}`
  await login(page, 'staff')
  await page.goto('/admin/news')
  // a real image, drawn by the browser
  const png = Buffer.from(await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 40
    const x = c.getContext('2d')!; x.fillStyle = '#fd7f10'; x.fillRect(0, 0, 64, 40); x.fillStyle = '#19522b'; x.fillRect(0, 20, 64, 20)
    return c.toDataURL('image/png').split(',')[1]!
  }), 'base64')
  await page.getByLabel('Titolo').fill(title)
  await page.getByLabel('Testo').fill('Un articolo con la sua foto.')
  await page.getByLabel('Foto di copertina').setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: png })
  await expect(page.getByRole('img', { name: 'Anteprima della copertina' })).toBeVisible()
  await page.getByRole('button', { name: 'Pubblica' }).click()
  await expect(page.locator('.row', { hasText: title })).toBeVisible()

  await page.goto('/news')
  const card = page.getByRole('link', { name: new RegExp(title) })
  await expect(card.locator('.cover img').first()).toBeVisible()
  expect(await card.locator('.cover img').first().getAttribute('src')).toContain('/graphics/news/')

  await page.goto('/admin/news')
  await page.locator('.row', { hasText: title }).getByRole('button', { name: 'Elimina' }).click()
  await page.locator('.row', { hasText: title }).getByRole('button', { name: 'Conferma' }).click()
  await expect(page.locator('.row', { hasText: title })).toHaveCount(0)
})

test('Gazzetta: a ChatGPT "scheda sito" fills the form and links the match', async ({ page }) => {
  await login(page, 'staff')
  await page.goto('/admin/news')
  await page.getByText('Incolla la scheda da ChatGPT').click()
  await page.getByLabel('Scheda sito').fill(['SCHEDA SITO', 'CATEGORIA: partita', 'OCCHIELLO: GIORNATA 9', 'TITOLO: Il Rall batte il Monza', 'SOMMARIO: Dieci gol.', 'PARTITA: Monza', 'TESTO:', 'Primo paragrafo.', '', 'Secondo paragrafo.'].join('\n'))
  await page.getByRole('button', { name: 'Compila il modulo' }).click()
  await expect(page.getByLabel('Titolo')).toHaveValue('Il Rall batte il Monza')
  await expect(page.getByLabel('Occhiello')).toHaveValue('GIORNATA 9')
  await expect(page.getByLabel('Testo', { exact: true })).toHaveValue('Primo paragrafo.\n\nSecondo paragrafo.')
  await expect(page.getByLabel('Partita collegata')).not.toHaveValue('')
})
