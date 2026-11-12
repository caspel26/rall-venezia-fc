import { defineConfig } from '@playwright/test'

const port = 3100
const phone = { browserName: 'chromium' as const, viewport: { width: 390, height: 844 }, hasTouch: true }
const desktop = { browserName: 'chromium' as const, viewport: { width: 1440, height: 900 } }

export default defineConfig({
  testDir: 'tests/e2e',
  reporter: 'list',
  workers: 2, // keeps memory in check next to Docker and the dev server
  use: { baseURL: `http://127.0.0.1:${port}` },
  webServer: {
    command: `npx nuxt dev --port ${port} --host 127.0.0.1`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    // read-only specs: safe to run in parallel against the seed data
    { name: 'phone', use: phone, testIgnore: /admin-.*\.spec\.ts/ },
    { name: 'desktop', use: desktop, testIgnore: /admin-.*\.spec\.ts/ },
    // specs that change data run afterwards, one at a time, and clean up after themselves
    { name: 'admin-phone', use: phone, testMatch: /admin-.*\.spec\.ts/, dependencies: ['phone', 'desktop'], fullyParallel: false },
    { name: 'admin-desktop', use: desktop, testMatch: /admin-.*\.spec\.ts/, dependencies: ['admin-phone'], fullyParallel: false },
  ],
})
