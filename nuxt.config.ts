const isDev = process.env.NODE_ENV !== 'production'

export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: false },
  // Everything is behind a login, so there is nothing for a server render to show. SPA mode keeps the
  // session in the browser only; server code is limited to the admin API routes in server/.
  ssr: false,
  modules: ['@nuxtjs/supabase'],
  supabase: {
    // Anonymous visitors are sent to /login; roles are enforced by RLS, not here.
    redirect: true,
    redirectOptions: { login: '/login', callback: '/login', exclude: ['/login', '/auth/*'], saveRedirectToCookie: true },
    types: '~/types/database.ts',
    cookieOptions: { maxAge: 60 * 60 * 24 * 60, sameSite: 'lax', secure: !isDev },
  },
  css: [
    '@fontsource/geist/latin-400.css',
    '@fontsource/geist/latin-600.css',
    '@fontsource/geist/latin-700.css',
    '@fontsource/anton/latin-400.css',
    '@fontsource/source-serif-4/latin-400.css',
    '@fontsource/source-serif-4/latin-400-italic.css',
    '@fontsource/source-serif-4/latin-600.css',
    '@fontsource/bebas-neue/latin-400.css',
    '~/assets/css/tokens.css',
    '~/assets/css/base.css',
    '~/assets/css/components.css',
  ],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
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
