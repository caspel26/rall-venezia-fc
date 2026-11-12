export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: false },
  css: [
    '@fontsource/geist/latin-400.css',
    '@fontsource/geist/latin-600.css',
    '@fontsource/geist/latin-700.css',
    '@fontsource/anton/latin-400.css',
    '@fontsource/bebas-neue/latin-400.css',
    '~/assets/css/tokens.css',
    '~/assets/css/base.css',
    '~/assets/css/components.css',
  ],
  app: {
    head: {
      htmlAttrs: { lang: 'it' },
      title: 'Rall Venezia Clubhouse',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'robots', content: 'noindex, nofollow' },
        { name: 'theme-color', content: '#0a0a0a' },
      ],
    },
  },
  routeRules: { '/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } } },
  typescript: { strict: true },
})
