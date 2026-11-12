# Rall Venezia Clubhouse

Private Nuxt + Supabase clubhouse for Rall Venezia FC (amateur futsal). Deployed on Vercel + Supabase only (no Cloudflare, simplest stack); invite-only; RLS-enforced roles (admin, staff, player, viewer).

Start every session by reading `docs/AGENT-WORKFLOW.md`, then `handoff.md`. Product/architecture docs are in `docs/`. The design system borrows its structure and motion from the Shiori project (`~/Documents/shiori/docs/UI-GUIDELINES.md`) — consult it, do not copy its code (Go/HTMX there, Nuxt here).

Hard rules: never push or change external services without approval; RLS on every table; service-role key server-only; stats derived not stored; never invent data; UI copy Italian, code/docs English; tokens only (no one-off colours/sizes); reduced motion respected; verify mobile (390x844) and desktop (1440x900) for every UI change.
