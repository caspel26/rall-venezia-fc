# Deployment

> **Verify before configuring.** Vercel, Supabase and Cloudflare change their plans and UI. Before Stage 11 (and before relying on any capability marked *verify*), re-read the current official docs and record the date checked here. Nothing below has been verified against live docs yet.

## Environments

| Env | App | Database | Notes |
| --- | --- | --- | --- |
| local | `nuxt dev` | Supabase CLI (`supabase start`, Docker) | seed applied, signups disabled |
| preprod | Vercel preview/branch deploy | second Supabase project (sanitized data) | never the production DB or keys |
| production | Vercel production | production Supabase project | behind Cloudflare Access |

## 1. Supabase project

1. Create the project (EU region, close to the players).
2. Auth settings: **disable signups**, disable unused providers, set Site URL and redirect URLs to the production and preprod domains, set the invite email template (Italian), enforce a minimum password length.
3. Apply migrations: `supabase link --project-ref <ref>` then `supabase db push`. Never edit the production schema by hand; every change is a migration.
4. Create storage buckets as private (migration, not dashboard).
5. Create the first admin: run once, locally against the project, `select` the invited user's id and insert `user_roles(role='admin')` via the SQL editor. After that, all invites go through the app.

## 2. Environment variables

See `.env.example`. Names only are committed.

| Variable | Where | Exposure |
| --- | --- | --- |
| `SUPABASE_URL` | all | public |
| `SUPABASE_KEY` (anon/publishable) | all | public (RLS protects) |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel server env only | **secret**, server routes only |
| `NUXT_PUBLIC_SITE_URL` | all | public |

The service-role key is never prefixed `NUXT_PUBLIC_`/`VITE_` and never set in preview environments that untrusted people can open.

## 3. Vercel

1. Import the repo; framework preset Nuxt; Node LTS.
2. Set env vars per environment.
3. Production branch = `main`. Preview deployments get the preprod Supabase project.
4. Prevent bypassing Cloudflare Access: protect the `*.vercel.app` deployment URLs (Vercel deployment protection) and/or have the app reject requests lacking the Cloudflare-validated header (`Cf-Access-Jwt-Assertion`, verified against the Access JWKS in a server middleware). *verify which is available on the plan.*

## 4. Domain, DNS, Cloudflare Access

1. Add the domain to Cloudflare; create the DNS record for the app subdomain (e.g. `clubhouse.<domain>`) pointing to Vercel, **proxied (orange cloud)** so Access applies. *verify the current Vercel guidance on running behind the Cloudflare proxy (SSL mode must be Full (strict)).*
2. Zero Trust → Access → Applications → self-hosted application for the hostname; policy `Allow` for an email list (a group of member emails); login method one-time PIN; session duration long (e.g. 30 days) to avoid double-login friction.
3. Adding a member means: add the email to the Access group **and** invite in the app. Document this in the admin guide.
4. Test: an unlisted email cannot reach `/login`; direct `*.vercel.app` is blocked.

## 5. Production checklist

- Signups disabled; RLS enabled on every table (pgTAP passes); buckets private.
- No service key in the client bundle (`grep -r SERVICE_ROLE .output/public` is empty).
- Security headers set (CSP, `X-Frame-Options`/frame-ancestors, `Referrer-Policy`, `X-Robots-Tag: noindex`).
- Access policy tested with a non-member.
- Backups verified (below). First admin exists.

## Backups

Use provider-native tools; no custom engine.
- Supabase automated backups (retention depends on plan; *verify*; point-in-time recovery is a paid add-on). Free-tier projects may have no usable backup, so the baseline is a scheduled **`pg_dump`** (`supabase db dump` or `pg_dump` with the connection string) run by the owner monthly and after the season ends, stored encrypted outside the repo. Storage objects are not in the database dump; export the buckets (`supabase storage` / S3 API) at the same cadence. Photos can also be re-derived from the originals the owner keeps.
- **Dumps contain personal data**: never commit, attach to issues or paste in chat (`local-dumps/` is gitignored as a guard). Restore drill: restore into a disposable local Supabase and run the app against it once per season.

## Observability

Vercel function/deployment logs and Supabase logs (auth, postgres, storage). No third-party monitoring or analytics in MVP. If analytics are ever added, use a privacy-respecting, cookieless tool.
