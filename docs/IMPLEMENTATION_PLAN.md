# Implementation plan

Follows [AGENT-WORKFLOW.md](AGENT-WORKFLOW.md): each stage is queued in `handoff.md`; non-trivial stages get an Opus design doc first; Sonnet builds; every stage is verified by the driver (not only by the building agent) and UI stages get Playwright screenshots at 390x844 and 1440x900. Scoped local commits, nothing pushed without approval.

Standard verify set (`npm`):
`typecheck` (vue-tsc, strict) · `lint` · `test` (Vitest) · `supabase test db` · `build` · `test:e2e` (Playwright).

## Stage 1 — Bootstrap and tokens
- **Goal:** Nuxt 4 + TS strict app that renders a styled placeholder with fonts, tokens, grain, reduced-motion handling.
- **Files:** `package.json`, `nuxt.config.ts`, `tsconfig`, `app/app.vue`, `app/assets/css/{tokens,base,components}.css`, `.env.example`, `.gitignore`, `CLAUDE.md`.
- **DB:** none.
- **Tests:** build; Playwright smoke; contrast script for token pairs.
- **Done:** page renders on 390 and 1440 with display + UI fonts self-hosted; no console errors; owner picks display font from the specimen and supplies lion artwork.

## Stage 2 — Supabase schema, RLS, seed
- **Goal:** all MVP tables, helpers, views, RPCs, storage buckets, policies, seed.
- **Files:** `supabase/config.toml`, `supabase/migrations/*`, `supabase/seed/seed.sql`, `supabase/tests/*`, generated `app/types/database.ts`.
- **DB:** everything in [DATABASE.md](DATABASE.md). **Opus designs and reviews this stage** (security).
- **Tests:** pgTAP per role per table; RLS-enabled lint; view math on seeded fixtures (W/D/L, goals, averages).
- **Done:** `supabase db reset` clean; pgTAP green; types generated.

## Stage 3 — Authentication
- **Goal:** login, session, set-password, invite via server route, route guards, 403.
- **Files:** `app/pages/login.vue`, `app/pages/auth/set-password.vue`, `app/middleware/auth.global.ts`, `app/composables/useAuth.ts`, `server/api/admin/*`, `server/utils/{requireAdmin,adminClient}.ts`.
- **DB:** profile/role trigger.
- **Tests:** Vitest for guard logic; Playwright login/logout/redirect; negative tests (player calling admin routes → 403); service key absent from bundle. **Opus review.**
- **Done:** invite → set password → logged in works locally; no signup UI exists.

## Stage 4 — Shell and navigation
- **Goal:** layouts, bottom nav, desktop rail, error pages, `EmptyState`, skeletons, page transitions.
- **Files:** `app/layouts/*`, `app/components/{MobileBottomNav,DesktopNavigation,EmptyState,SkeletonBlock,PageHero,SectionHeader,ClubLogo}.vue`, `app/error.vue`.
- **Tests:** Playwright nav on both sizes, keyboard, role-based nav items. **Visual review + taste critique.**
- **Done:** all MVP routes resolve to titled stubs; 403/404/500 branded.

## Stage 5 — Dashboard
- **Goal:** Home per the hierarchy in the design system.
- **Files:** `app/pages/index.vue`, `app/components/{MatchCard,ScoreBoard,FormStrip,StatCard,AnnouncementCard,RatingCard}.vue`, `app/composables/useDashboard.ts`.
- **DB:** uses views only.
- **Tests:** Vitest for form/streak helpers; Playwright with seeded data and with empty DB (empty states). Visual review.
- **Done:** Home feels alive on 390 and 1440; one query batch; LCP image sized and prioritised.

## Stage 6 — Players
- **Goal:** squad page and player profile.
- **Files:** `app/pages/team/{index,[slug]}.vue`, `PlayerCard.vue`, `MVPBadge.vue`, `usePlayers.ts`.
- **Tests:** stats shown equal view output; missing photo/number fallbacks; viewer sees basic fields only.
- **Done:** null shirt numbers render gracefully; profile tabs work.

## Stage 7 — Matches
- **Goal:** archive with filters and the match programme page.
- **Files:** `app/pages/matches/{index,[id]}.vue`, `OpponentBadge.vue`, `ResultPill.vue`, `Segmented.vue`, timeline component.
- **Tests:** filters, drafts hidden from players, score reveal respects reduced motion. Visual review.

## Stage 8 — Ratings and statistics
- **Goal:** pagelle archive and stats/rankings pages.
- **Files:** `app/pages/{ratings,stats}`, `RankingRow.vue`, `useStats.ts`.
- **Tests:** rankings tie-break rules (documented: goals desc, then fewer appearances, then name) unit-tested; viewer blocked from ratings.

## Stage 9 — Availability and Spogliatoio
- **Goal:** two-tap availability, staff summary, announcements list.
- **Files:** `app/pages/clubhouse/*`, `AvailabilitySelector.vue`, `AvailabilitySummary.vue`.
- **Tests:** player can write only own row and only before kickoff (pgTAP + Playwright); optimistic update rolls back on failure; Playwright counts taps = 2. **Opus review of the policy.**

## Stage 10 — Admin
- **Goal:** CRUD + post-match flow + invites UI.
- **Files:** `app/pages/admin/**`, `app/components/admin/*`, `supabase` RPC `record_match_result`.
- **Tests:** RPC rejects inconsistent scores; last-admin protection; Playwright timed post-match flow (≤ 60s on seed). **Opus review.**

## Stage 11 — Deployment and security hardening
- **Goal:** production live on Vercel + Supabase.
- **Files:** `nuxt.config.ts` security headers/CSP, docs updates.
- **Tests:** full checklist in [DEPLOYMENT.md](DEPLOYMENT.md#5-production-checklist); non-member probe; Lighthouse; backup + restore drill.
- **Done:** MVP definition of done met; owner signs off; `handoff.md` records deployed commit and migration.

Phase 2 stages (media, Hall of Fame, advanced stats, meme room, mascot, PWA) are queued in `handoff.md` after MVP.
