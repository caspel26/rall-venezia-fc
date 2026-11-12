# Rall Venezia Clubhouse — handoff

Working method: `docs/AGENT-WORKFLOW.md` (read first). Planning docs: `docs/`. Never push without explicit owner approval.

Updated: 12 November 2026.

## State

- Phase: **Stage 1 (Q1) built**: Nuxt 4.6.4 bootstrap, tokens, self-hosted fonts, grain, Playwright smoke (390x844 + 1440x900) passing. Next: Q2 (Supabase schema/RLS, Opus design first). No Cloudflare; deploy = Vercel + Supabase only.
- Docs written: PRODUCT, ARCHITECTURE, DATABASE, AUTHORIZATION, ROUTES, DESIGN_SYSTEM, DEPLOYMENT, MVP, IMPLEMENTATION_PLAN, AGENT-WORKFLOW.
- Migrations used: `20261112000001_schema.sql`, `20261112000002_rls.sql` (+ dev-only `supabase/seed.sql`).

## Owner decisions needed (defaults in brackets; build proceeds on the defaults)

1. Display font: Anton vs Bebas Neue [specimen at Stage 1].
2. Lion logo / emblem artwork and real brand hex values [placeholders until supplied].
3. Viewers see ratings? [no].
4. Custom domain or the free `*.vercel.app` URL [`*.vercel.app` is fine]. No Cloudflare (owner decision, 12 Nov 2026).
5. Supabase plan (backups, image transformations) [free tier + monthly `pg_dump`].
6. Branching: `main` + `development` only, preprod = Vercel preview + second Supabase project [yes].
7. Package manager: npm (pnpm not installed; fewer moving parts).

## Open work (ordered queue)

- ~~Q7 Stage 7 — matches archive + programme page; 10 unit + 52 e2e~~ (done)
- ~~Q6 Stage 6 — squad + player profile (derived stats, tabs); 42 e2e~~ (done)
- ~~Q5 Stage 5 — dashboard (hero, availability, last result, form, top, pagella, announcement); 7 unit + 32 e2e~~ (done)
- ~~Q4 Stage 4 — shell: bottom nav, rail, error pages, skeleton/empty components, route stubs; 24 e2e~~ (done)
- ~~Q3 Stage 3 — auth: login, invite via server route, set-password, role guard, 14 e2e~~ (done; Opus review of auth+RLS queued for end)
- ~~Q2 Stage 2 — schema, RLS, seed, pgTAP (27 tests)~~ (done; local Supabase via `npx supabase start`)
- ~~Q1 Stage 1 — Bootstrap and tokens~~ (done; font choice Anton vs Bebas Neue and lion artwork pending owner)
- Q8 Stage 8 — Ratings and statistics
- Q9 Stage 9 — Availability and Spogliatoio (Opus review)
- Q10 Stage 10 — Admin (Opus review)
- Q11 Stage 11 — Deployment and security hardening

Details per stage: `docs/IMPLEMENTATION_PLAN.md`.

## Test commands

`npm run typecheck`, `npm run build`, `npx supabase test db`, `npx playwright test` (needs `supabase start` + `.env` from `.env.example` with the local keys; own dev server on port 3100; `SHOTS=<dir>` saves screenshots). `lint`, `test` (Vitest) and `supabase test db` arrive with Stage 2.
