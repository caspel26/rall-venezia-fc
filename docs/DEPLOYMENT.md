# Deployment

> **Verify before configuring.** Vercel and Supabase change their plans and UI. Before Stage 11 (and before relying on any capability marked *verify*), re-read the current official docs and record the date checked here. Nothing below has been verified against live docs yet.

## Environments

| Env | App | Database | Notes |
| --- | --- | --- | --- |
| local | `nuxt dev` | Supabase CLI (`supabase start`, Docker) | seed applied, signups disabled |
| preprod | Vercel preview/branch deploy | second Supabase project (sanitized data) | never the production DB or keys |
| production | Vercel production | production Supabase project | free `*.vercel.app` URL (custom domain optional) |

## 1. Supabase project

1. Create the project (EU region, close to the players).
2. Auth settings: **disable signups**, disable unused providers, set Site URL and redirect URLs to the production and preprod domains, set the invite email template (Italian), enforce a minimum password length.
3. Apply migrations: `supabase link --project-ref <ref>` then `supabase db push`. Never edit the production schema by hand; every change is a migration.
4. Create storage buckets as private (migration, not dashboard).
5. Create the accounts: `node --env-file=.env scripts/create-members.mjs` against the project (username + password, `<username>@rall.invalid` internally; only `g.casillo` is admin, everyone else `player`). Passwords go to `private-assets/credentials.txt` (gitignored). After that the admin adds accounts and resets passwords from `/admin/users`; there is no email flow.

## 2. Environment variables

See `.env.example`. Names only are committed.

| Variable | Where | Exposure |
| --- | --- | --- |
| `SUPABASE_URL` | all | public |
| `SUPABASE_KEY` (anon/publishable) | all | public (RLS protects) |
| `SUPABASE_SECRET_KEY` | Vercel server env only | **secret**, server routes only |
| `NUXT_PUBLIC_SITE_URL` | all | public |
| `CRON_SECRET` | Vercel server env + GitHub secret | **secret**: authenticates the Instagram sync scheduler (see [INSTAGRAM.md](INSTAGRAM.md)) |
| `INSTAGRAM_API_BASE` | never in production | dev/test only: points the sync at a mock |

The service-role key is never prefixed `NUXT_PUBLIC_`/`VITE_` and never set in preview environments that untrusted people can open.

## 3. Vercel

1. Import the repo; framework preset Nuxt; Node LTS.
2. Set env vars per environment.
3. Production branch = `main`. Preview deployments get the preprod Supabase project.

## 4. Domain (optional)

The default `<project>.vercel.app` URL is enough. For a custom domain add it in Vercel and create the DNS record Vercel shows (CNAME/A) at your registrar; then add the URL to Supabase Auth redirect URLs. No proxy or extra service.

Adding a member = create the account from `/admin/users` (username + password). That is the only access control step.

## 5. Production checklist

- Signups disabled; RLS enabled on every table (pgTAP passes); buckets private.
- No service key in the client bundle (`grep -r SERVICE_ROLE .output/public` is empty).
- Security headers set (CSP, `X-Frame-Options`/frame-ancestors, `Referrer-Policy`, `X-Robots-Tag: noindex`).
- Anonymous API probe: with only the anon key, every table returns nothing/denied.
- Backups verified (below). First admin exists.

## Backups

Use provider-native tools; no custom engine.
- Supabase automated backups (retention depends on plan; *verify*; point-in-time recovery is a paid add-on). Free-tier projects may have no usable backup, so the baseline is a scheduled **`pg_dump`** (`supabase db dump` or `pg_dump` with the connection string) run by the owner monthly and after the season ends, stored encrypted outside the repo. Storage objects are not in the database dump; export the buckets (`supabase storage` / S3 API) at the same cadence. Photos can also be re-derived from the originals the owner keeps.
- **Dumps contain personal data**: never commit, attach to issues or paste in chat (`local-dumps/` is gitignored as a guard). Restore drill: restore into a disposable local Supabase and run the app against it once per season.

## Observability

Vercel function/deployment logs and Supabase logs (auth, postgres, storage). No third-party monitoring or analytics in MVP. If analytics are ever added, use a privacy-respecting, cookieless tool.

## Keep-alive (external cron)

The free Supabase project pauses after about a week without activity. `GET /api/health` (public, returns `{"ok":true}`, runs one trivial query) exists for that. Point an external scheduler at `https://rall-venezia-fc.vercel.app/api/health` (for example cron-job.org or UptimeRobot, every 6-12 hours or more often). Nothing in the repo schedules it: it lives in that service.
