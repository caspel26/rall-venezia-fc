import { expect, type Page } from '@playwright/test'

export const DEV_PASSWORD = 'rall-dev-password'

export async function login(page: Page, who: 'admin' | 'staff' | 'player' | 'viewer') {
  await page.goto('/login')
  await page.getByLabel('Email').fill(`${who}@example.invalid`)
  await page.getByLabel('Password').fill(DEV_PASSWORD)
  await page.getByRole('button', { name: 'Entra' }).click()
  await expect(page).toHaveURL(/\/$/)
}
