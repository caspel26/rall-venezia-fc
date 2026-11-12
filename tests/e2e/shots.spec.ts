import { test } from '@playwright/test'
import { login } from './helpers'

// Visual review helper: `SHOTS=<dir> npx playwright test shots`. Skipped otherwise.
const dir = process.env.SHOTS
const paths = (process.env.SHOT_PATHS ?? '/,/matches').split(',')
const who = (process.env.SHOT_ROLE ?? 'player') as 'admin' | 'staff' | 'player' | 'viewer'

test.skip(!dir, 'set SHOTS to save screenshots')

test('screenshots', async ({ page }, info) => {
  await login(page, who)
  for (const p of paths) {
    await page.goto(p)
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => document.fonts.ready)
    // scroll through the page so scroll-reveals have fired, then back to the top
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) }
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(900)
    await page.screenshot({ path: `${dir}/${info.project.name}${p.replace(/\//g, '_') || '_'}.png`, fullPage: true })
  }
})
