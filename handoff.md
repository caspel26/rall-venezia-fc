# Rall Venezia Clubhouse — handoff

Working method: `docs/AGENT-WORKFLOW.md` (read first). Planning docs: `docs/`. Never push without explicit owner approval.

Updated: 12 November 2026.

## State

- Phase: **Stage 1 (Q1) built**: Nuxt 4.6.4 bootstrap, tokens, self-hosted fonts, grain, Playwright smoke (390x844 + 1440x900) passing. Next: Q2 (Supabase schema/RLS, Opus design first). No Cloudflare; deploy = Vercel + Supabase only.
- Docs written: PRODUCT, ARCHITECTURE, DATABASE, AUTHORIZATION, ROUTES, DESIGN_SYSTEM, DEPLOYMENT, MVP, IMPLEMENTATION_PLAN, AGENT-WORKFLOW.
- Migrations used: `20261112000001_schema.sql`, `20261112000002_rls.sql`, `20261112000003_news.sql` (+ dev-only `supabase/seed.sql`).

## Owner decisions needed (defaults in brackets; build proceeds on the defaults)

1. Display font: Anton vs Bebas Neue [specimen at Stage 1].
2. ~~Logo and brand colours~~ received (150px JPG). Still wanted: higher-resolution or vector logo.
3. Viewers see ratings? [no].
4. Custom domain or the free `*.vercel.app` URL [`*.vercel.app` is fine]. No Cloudflare (owner decision, 12 Nov 2026).
5. Supabase plan (backups, image transformations) [free tier + monthly `pg_dump`].
6. Branching: `main` + `development` only, preprod = Vercel preview + second Supabase project [yes].
7. Package manager: npm (pnpm not installed; fewer moving parts).

## Open work (ordered queue)

- ~~Q12 Motion: scroll reveal (`v-reveal`), intro stagger, vanish swaps (skeleton->content, lists), number ticks, scroll meter, blurred header, reduced-motion kill switch (pattern from caspel26.github.io; documented in DESIGN_SYSTEM); also fixed WidgetFrame auto-import (`components.pathPrefix:false`)~~
- ~~Q11a Player pack (PDF from the Codex brief): numbers/positions applied (Batti #4 defender, Miranda #10 jolly, Ferrara #7, Verrone winger), real photos via `scripts/build-player-assets.sh` + `upload-player-assets.mjs` into private storage (portrait/hero/thumb; originals gitignored in `private-assets/`). NOT done: transparent cutouts (needs a background-removal model) and replacing Verrone's blue bib with the white kit (needs generative editing / a new photo)~~
- ~~Q11b Instagram -> Gazzetta sync: server route + token store + admin page + mock-API e2e + GitHub Actions/Vercel cron; needs the owner's Meta app/token (docs/INSTAGRAM.md)~~
- ~~Q11c Seed stats on request: 8 matchdays, Verrone 31 goals, Nappo 16, others 3, 8 assists each~~
- ~~Q10 Stage 10 — admin: matches + post-match flow (timed <60s in e2e), players (photo upload, account link admin-only), users (invite/role/remove, last-admin guard), ratings, announcements, Gazzetta; 96 e2e~~ (done)
- ~~Q10b Branding: real roundel logo (public/brand), palette from the crest (orange #fd7f10, green #19522b), branded README + banner, stripes motif~~ (done; logo source is 150px: ask owner for hi-res/vector)
- ~~Q9 Stage 9 — Spogliatoio hub, availability board (groups + staff timestamps), announcements; 76 e2e~~ (done)
- ~~Q8 Stage 8 — /stats (team record, rankings with documented tie-break, players table, season filter) and /ratings archive; 18 unit + 68 e2e~~ (done)
- ~~Q7c Gazzetta: `news_articles` table + RLS (migration 3), /news front page, /news/[slug], home widget; admin CRUD comes in Stage 10~~ (done)
- Future widgets (owner idea): more home widgets; league standings need opponent results data we do not store (player rankings exist).

- ~~Q7b Home widget system: `app/widgets/registry.ts` + `components/widgets/*` (next match, availability, last result, last 5, record, top performers, scorers ranking, rating, announcement); app switched to SPA mode (`ssr:false`)~~ (done)
- ~~Q7 Stage 7 — matches archive + programme page; 10 unit + 52 e2e~~ (done)
- ~~Q6 Stage 6 — squad + player profile (derived stats, tabs); 42 e2e~~ (done)
- ~~Q5 Stage 5 — dashboard (hero, availability, last result, form, top, pagella, announcement); 7 unit + 32 e2e~~ (done)
- ~~Q4 Stage 4 — shell: bottom nav, rail, error pages, skeleton/empty components, route stubs; 24 e2e~~ (done)
- ~~Q3 Stage 3 — auth: login, invite via server route, set-password, role guard, 14 e2e~~ (done; Opus review of auth+RLS queued for end)
- ~~Q2 Stage 2 — schema, RLS, seed, pgTAP (27 tests)~~ (done; local Supabase via `npx supabase start`)
- ~~Q1 Stage 1 — Bootstrap and tokens~~ (done; font choice Anton vs Bebas Neue and lion artwork pending owner)
- Q11 Stage 11 — Deployment and security hardening

Details per stage: `docs/IMPLEMENTATION_PLAN.md`.

## Test commands

`npm run typecheck`, `npm run build`, `npx supabase test db`, `npx playwright test` (needs `supabase start` + `.env` from `.env.example` with the local keys; own dev server on port 3100; `SHOTS=<dir>` saves screenshots). `lint`, `test` (Vitest) and `supabase test db` arrive with Stage 2.
