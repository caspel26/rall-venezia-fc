import { expect, test } from '@playwright/test'
import { login } from './helpers'

test('content reveals on scroll: below-the-fold sections start hidden and fade in', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/stats')
  await page.waitForLoadState('networkidle')
  await page.getByRole('tab', { name: 'Classifiche' }).click()
  const last = page.locator('.panel', { has: page.getByRole('heading', { name: 'Presenze' }) })
  await expect(last).toHaveClass(/reveal/)
  await last.scrollIntoViewIfNeeded()
  await expect(last).toHaveClass(/is-visible/)
  await expect.poll(() => last.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
})

test('skeletons dissolve into the content (no skeleton left once loaded)', async ({ page }) => {
  await login(page, 'player')
  await page.goto('/team')
  await expect(page.getByRole('list', { name: 'Giocatori' })).toBeVisible()
  await expect(page.locator('.skeleton')).toHaveCount(0)
})

test('the scroll meter follows the page and the header blurs once scrolled (phone)', async ({ page }) => {
  test.skip(!test.info().project.name.endsWith('phone'), 'mobile header only')
  await login(page, 'player')
  await page.goto('/team')
  await expect(page.getByRole('list', { name: 'Giocatori' })).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect(page.locator('header.top')).toHaveClass(/hdr-scrolled/)
  await expect.poll(() => page.locator('.scroll-meter').evaluate((el) => (el as HTMLElement).style.transform)).toContain('scaleX(1)')
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('everything is simply there: no hidden reveals, no animations', async ({ page }) => {
    await login(page, 'player')
    await page.goto('/stats')
    await page.waitForLoadState('networkidle')
    await page.getByRole('tab', { name: 'Classifiche' }).click()
    await expect(page.locator('.reveal')).toHaveCount(0)
    const opacity = await page.locator('.panel', { has: page.getByRole('heading', { name: 'Presenze' }) }).evaluate((el) => getComputedStyle(el).opacity)
    expect(opacity).toBe('1')
    expect(await page.locator('.scroll-meter').evaluate((el) => getComputedStyle(el).display)).toBe('none')
  })
})
