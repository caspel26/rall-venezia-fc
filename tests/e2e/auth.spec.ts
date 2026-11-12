import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { DEV_PASSWORD, login } from './helpers'

const MAILPIT = 'http://127.0.0.1:54324'

test('anonymous visitors are sent to the login page and there is no signup', async ({ page }) => {
  await page.goto('/matches')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByText('Accesso allo spogliatoio')).toBeVisible()
  await expect(page.getByRole('link', { name: /registrati|crea account|sign up/i })).toHaveCount(0)
})

test('wrong password shows an inline error', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('player@example.invalid')
  await page.getByLabel('Password').fill('not-the-password')
  await page.getByRole('button', { name: 'Entra' }).click()
  await expect(page.getByRole('alert')).toContainText('Email o password non corretti')
  await expect(page).toHaveURL(/\/login/)
})

test('player logs in, sees their role, logs out', async ({ page }) => {
  await login(page, 'player')
  await expect(page.getByText('Ruolo: player')).toBeVisible()
  await page.getByRole('button', { name: 'Esci' }).click()
  await expect(page).toHaveURL(/\/login/)
})

test('admin routes refuse non-admins', async ({ page }) => {
  await login(page, 'player')
  const res = await page.request.post('/api/admin/invite', { data: { email: 'x@example.invalid', role: 'player' } })
  expect(res.status()).toBe(403)
  const anon = await page.context().browser()!.newContext({ baseURL: test.info().project.use.baseURL })
  const res2 = await anon.request.post('/api/admin/invite', { data: { email: 'x@example.invalid', role: 'player' } })
  expect(res2.status()).toBe(401)
  await anon.close()
})

test('invite flow: admin invites, invitee sets a password, then can be removed', async ({ page, browser }) => {
  test.slow()
  const email = `invitee-${Date.now()}@example.invalid`
  await login(page, 'admin')

  const invite = await page.request.post('/api/admin/invite', { data: { email, role: 'player', displayName: 'Nuovo Arrivato' } })
  expect(invite.status()).toBe(200)
  const { id, role } = await invite.json()
  expect(role).toBe('player')

  // read the invite from local Mailpit
  let link = ''
  await expect.poll(async () => {
    const list = await (await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent('to:' + email)}`)).json()
    const msg = list.messages?.[0]
    if (!msg) return ''
    const full = await (await fetch(`${MAILPIT}/api/v1/message/${msg.ID}`)).json()
    link = (full.HTML as string).match(/href="([^"]*set-password[^"]*)"/)?.[1]?.replace(/&amp;/g, '&') ?? ''
    return link
  }, { timeout: 20_000 }).not.toBe('')

  const ctx = await browser.newContext({ baseURL: test.info().project.use.baseURL })
  const invitee = await ctx.newPage()
  const u = new URL(link)
  await invitee.goto(`/auth/set-password${u.search}`)
  await expect(invitee.getByRole('heading', { name: 'Scegli la password' })).toBeVisible()
  await invitee.getByLabel('Nuova password').fill('short')
  await invitee.getByLabel('Ripeti la password').fill('short')
  await invitee.getByRole('button', { name: 'Entra' }).click()
  await expect(invitee.getByRole('alert')).toContainText('almeno 10')
  await invitee.getByLabel('Nuova password').fill(DEV_PASSWORD + '!')
  await invitee.getByLabel('Ripeti la password').fill(DEV_PASSWORD + '!')
  await invitee.getByRole('button', { name: 'Entra' }).click()
  await expect(invitee).toHaveURL(/\/$/)
  await expect(invitee.getByText('Ruolo: player')).toBeVisible()
  await ctx.close()

  // an used link is dead
  const ctx2 = await browser.newContext({ baseURL: test.info().project.use.baseURL })
  const again = await ctx2.newPage()
  await again.goto(`/auth/set-password${u.search}`)
  await expect(again.getByRole('heading', { name: 'Link scaduto' })).toBeVisible()
  await ctx2.close()

  const del = await page.request.delete(`/api/admin/users/${id}`)
  expect(del.status()).toBe(200)
})

test('the secret key never reaches the client bundle', async ({ page }) => {
  const seen: string[] = []
  page.on('response', async (r) => {
    if (/\.(js|mjs)(\?|$)/.test(r.url()) || r.request().resourceType() === 'document') {
      seen.push(await r.text().catch(() => ''))
    }
  })
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  const all = seen.join('\n')
  // the key's value, not its prefix (supabase-js ships the prefix in a browser warning)
  const secret = readFileSync('.env', 'utf8').match(/^SUPABASE_SECRET_KEY=(.+)$/m)?.[1]
  expect(secret).toBeTruthy()
  expect(all).not.toContain(secret!)
})
