import { expect, test } from '@playwright/test'

test('home renders without console errors or horizontal scroll', async ({ page }, info) => {
  const errors: string[] = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('Rall Venezia Clubhouse')
  await page.evaluate(() => document.fonts.ready)

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)

  const displayFont = await page.locator('.score').evaluate((el) => getComputedStyle(el).fontFamily)
  expect(displayFont).toContain('Anton')
  expect(await page.evaluate(() => document.fonts.check("16px 'Anton'"))).toBe(true)

  await page.screenshot({ path: process.env.SHOTS ? `${process.env.SHOTS}/home-${info.project.name}.png` : undefined, fullPage: true })
  expect(errors).toEqual([])
})
