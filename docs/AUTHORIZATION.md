# Authorization

Enforcement order of trust: **RLS (database) > server routes > route middleware (UX only)**. The UI hides what you cannot do; the database refuses it anyway.

## Role source

`user_roles.role`, one row per user. Read inside policies through `has_role(...)` (`security definer`, `stable`, `set search_path = ''`, wrapped as `(select has_role(...))` so Postgres caches it per statement). Role is **never** read from the JWT user metadata or the request. Changing roles is admin-only through a server route.

## Permissions matrix

R = read, W = create/update/delete, own = only own row, — = none.

| Feature | Admin | Staff | Player | Viewer |
| --- | --- | --- | --- | --- |
| Home dashboard | R | R | R | R (reduced: no availability/locker-room modules) |
| Players / squad / profiles | R W | R W (all fields except the account link) | R | R (basic: name, number, position, photo) |
| Link player ↔ account | W | — | — | — |
| Matches, results | R W | R W | R | R |
| Lineups (`match_players`) | R W | R W | R | R |
| Goals, assists, MVP | R W | R W | R | R |
| Ratings / pagelle | R W | R W | R | — |
| Availability | R W | R W | R + W own | — |
| Announcements (Spogliatoio) | R W | R W | R | — |
| Basic statistics / rankings | R | R | R | R |
| Hall of Fame | R | R | R | R |
| Media (`min_role = viewer`) | R W | R W | R | R |
| Media (`min_role = player`) | R W | R W | R | — |
| Internal documents | R W | R | R | — |
| Meme room, mascot | R W | R W | R | R |
| Users, roles, invites | R W | — | — | — |
| Admin area (`/admin`) | all | matches, availability, announcements, ratings, media | — | — |

Open decisions for the owner (defaults chosen): viewers do **not** see ratings; staff can edit players but not link accounts or touch roles; a player cannot edit their own player record in MVP (admin does it).

## RLS policies (conceptual)

RLS is enabled on **every** table in `public`; no table is created without it (a migration lint test fails the build otherwise). Default is deny.

| Table | SELECT | INSERT / UPDATE / DELETE |
| --- | --- | --- |
| `profiles` | own row; admin/staff all; player: id + display_name of teammates | own row, non-privileged columns; admin all |
| `user_roles` | own row; admin all | admin only (via server route / RPC) |
| `players`, `seasons`, `competitions`, `opponents` | any signed-in role | admin, staff |
| `matches`, `match_players`, `goals`, `mvp_awards` | any signed-in role, `published` rows only for non-staff | admin, staff |
| `ratings` | admin, staff, player (published); not viewer | admin, staff |
| `availability` | admin, staff all; player: all teammates' answers for the next match (counts) and own row | player: own row only (`player_id` = the player linked to `auth.uid()`) and only while kickoff is in the future; admin, staff all |
| `announcements` | admin, staff, player (published) | admin, staff |
| `media` | by `min_role` | admin, staff |
| `mascot` | any signed-in role | admin |

Rules shared by all policies:

- Anonymous (`anon`) has no grants on any table.
- `with check` mirrors `using` on writes so a user cannot write rows they could not read.
- Drafts (`published = false`) are visible only to staff/admin.
- Views use `security_invoker = true`, so they inherit the caller's RLS.
- RPC functions are `security invoker`; only the helper `has_role` is `security definer`.
- Storage policies on `storage.objects` call the same helper and match on `bucket_id`.

## Server-route rules (`server/api/admin/*`)

1. Resolve the user from the session cookie, not from a body parameter.
2. Query `user_roles` for that user; require `admin`.
3. Only then build the service-role client. Validate input (zod or manual) and never echo the key.
4. An admin cannot demote or delete the last remaining admin.

## Tests (priority one)

pgTAP in `supabase/tests/`: for each role (`anon`, viewer, player, staff, admin) assert allowed and forbidden SELECT/INSERT/UPDATE/DELETE per table, view visibility, the own-row availability rule, the kickoff cut-off, storage access, and that every `public` table has RLS enabled. Vitest covers the route guard metadata; Playwright covers the 403 page.
