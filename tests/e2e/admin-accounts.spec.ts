import { expect, test } from '@playwright/test'
import { login, logout } from './helpers'

test('the admin creates a username + password account, who can sign in and not edit; a reset changes the password', async ({ page, browser }) => {
  test.slow()
  const username = `prova.${test.info().project.name}.${Date.now() % 100000}`
  await login(page, 'admin')
  const created = await page.request.post('/api/admin/create-user', { data: { username, password: 'prova-1234', role: 'player', displayName: 'Prova Utente' } })
  expect(created.status()).toBe(200)
  const { id } = await created.json()
  expect((await page.request.post('/api/admin/create-user', { data: { username: 'BAD NAME', role: 'player' } })).status()).toBe(400)

  const ctx = await browser.newContext({ baseURL: test.info().project.use.baseURL })
  const other = await ctx.newPage()
  await other.goto('/login')
  await other.getByLabel('Username').fill(username)
  await other.getByLabel('Password').fill('prova-1234')
  await other.getByRole('button', { name: 'Entra' }).click()
  await expect(other).toHaveURL(/\/$/)
  expect((await other.request.post('/api/admin/create-user', { data: { username: 'x.y.z', role: 'player' } })).status()).toBe(403)
  await ctx.close()

  const reset = await page.request.post(`/api/admin/users/${id}/password`, { data: {} })
  expect(reset.status()).toBe(200)
  expect((await reset.json()).password).toHaveLength(12)

  expect((await page.request.delete(`/api/admin/users/${id}`)).status()).toBe(200)
  await page.goto('/admin/users')
  await expect(page.getByRole('heading', { name: 'Nuovo account con username e password' })).toBeVisible()
  await logout(page)
})
