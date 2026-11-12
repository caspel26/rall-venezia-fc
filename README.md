<div align="center">

# RALL VENEZIA CLUBHOUSE

**Accesso allo spogliatoio.**

The private digital clubhouse of Rall Venezia FC — matches, squad, stats, pagelle and the locker room, all in one place.

`Nuxt 4` · `Supabase` · `TypeScript` · `Vercel`

*Quello che succede nello spogliatoio resta nello spogliatoio.*

</div>

---

## What is this

The Instagram page is the public face of the club. This app is the world behind it: a football-club website, a private locker room, a statistics platform, a match archive and a pagelle archive, designed mobile first so it feels like a native sports app on a phone.

Everything is **private and invite-only**. There is no signup, no public profile, no public archive. Access is controlled by Supabase Auth and Row Level Security.

| | |
| --- | --- |
| **Home** | Next match, your availability, last result with MVP, form, top performers, latest pagella |
| **Partite** | Full match archive and a match "programme" page: score, goals timeline, lineup, MVP, ratings |
| **Squadra** | Editorial player cards and profiles with derived stats |
| **Stats** | Team record and rankings: scorers, assists, MVPs, average rating |
| **Pagelle** | Ratings archive rendered natively (score, review, attributes) |
| **Spogliatoio** | Availability for the next match and internal announcements |
| **Admin** | Quick post-match flow, players, matches, ratings, announcements, invites |

Roles: `admin`, `staff`, `player`, `viewer` (details in [docs/AUTHORIZATION.md](docs/AUTHORIZATION.md)).

## Stack

- **Nuxt 4** (Vue 3, Composition API, TypeScript strict), plain CSS with design tokens
- **Supabase**: Postgres, Auth (invite-only), Row Level Security, private Storage
- **Vercel** for hosting. No other providers: self-hosted fonts, no analytics

## Quick start

Requirements: Node 22+, Docker.

```bash
npm install
cp .env.example .env            # then fill in the keys printed by `supabase start`
npx supabase start              # local Postgres + Auth + Storage
npx supabase db reset           # apply migrations and seed data
npm run dev                     # http://localhost:3000
```

Local invite emails land in Mailpit at http://127.0.0.1:54324.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `vue-tsc` strict |
| `npm test` | Vitest unit tests |
| `npx supabase test db` | pgTAP: RLS and stats views |
| `npx playwright test` | E2E at 390x844 and 1440x900 |

## Project layout

```
app/          Nuxt app: assets/css (tokens), components, composables, layouts, middleware, pages
server/       Admin-only API routes (invites, roles) using the service-role key
supabase/     config, migrations, seed, pgTAP tests
docs/         product, architecture, database, authorization, routes, design system, deployment
tests/e2e/    Playwright specs
```

## Documentation

[Product](docs/PRODUCT.md) · [Architecture](docs/ARCHITECTURE.md) · [Database](docs/DATABASE.md) · [Authorization](docs/AUTHORIZATION.md) · [Routes](docs/ROUTES.md) · [Design system](docs/DESIGN_SYSTEM.md) · [Deployment](docs/DEPLOYMENT.md) · [MVP](docs/MVP.md) · [Implementation plan](docs/IMPLEMENTATION_PLAN.md) · [Agent workflow](docs/AGENT-WORKFLOW.md)

## Security

Never commit secrets. The Supabase service-role key is server-only. Authorization is enforced by RLS, not by the UI. See [docs/AUTHORIZATION.md](docs/AUTHORIZATION.md).

---

<div align="center"><sub>Rall Venezia FC — competitive, ironic, football-first.</sub></div>
