# Routes

All routes require a session except `/login` and `/auth/*`. `roles` is the UX guard in route `meta`; RLS is the real check. A failed role check renders the 403 page.

| Route | Purpose | Roles | Phase |
| --- | --- | --- | --- |
| `/login` | Email + password. No signup link | public | 1 |
| `/auth/set-password` | Invite / recovery landing | invite token | 1 |
| `/` | Dashboard: next match, last result, form, top performers, latest pagella, availability, latest update | all (viewer reduced) | 1 |
| `/matches` | Archive; filters upcoming / completed, season, competition | all | 1 |
| `/matches/[id]` | Match programme: hero score, timeline, goals, lineup, MVP, ratings (not viewer), media, notes | all | 1 |
| `/team` | Squad as editorial cards | all | 1 |
| `/team/[slug]` | Player profile: overview, matches, ratings (not viewer), media | all | 1 |
| `/stats` | Team + player stats, rankings (tabs) | all | 1 |
| `/ratings` | Pagelle archive, native rendering, filter by player/match | player+ | 1 |
| `/clubhouse` | Spogliatoio home: latest announcements, next-match availability summary | player+ | 1 |
| `/clubhouse/availability` | Answer for next match; staff see counts and who | player+ | 1 |
| `/clubhouse/announcements` | Announcement list | player+ | 1 |
| `/news` | La Gazzetta Rall: newspaper front page (lead, secondary stories, archive) | all | 1 |
| `/news/[slug]` | Article (cover, headline, body, link to the match or the Instagram post) | all | 1 |
| `/hall-of-fame` | Records, gold accents | all | 2 |
| `/media` | Gallery, filters match/player/season/category | all (by `min_role`) | 2 |
| `/clubhouse/memes` | Meme room | all | 2 |
| `/clubhouse/mascot` | Mascot | all | 2 |
| `/admin` | Admin home: quick actions, pending drafts | staff+ | 1 |
| `/admin/players` (+ `/new`, `/[id]`) | Player CRUD, link account | admin (staff edit) | 1 |
| `/admin/matches` (+ `/new`, `/[id]`) | Match CRUD | staff+ | 1 |
| `/admin/matches/[id]/result` | Post-match flow: score → scorers → assists → MVP → ratings → media → publish | staff+ | 1 |
| `/admin/ratings` | Ratings CRUD | staff+ | 1 |
| `/admin/announcements` | Announcements CRUD | staff+ | 1 |
| `/admin/media` | Upload / manage | staff+ | 2 |
| `/admin/news` | Gazzetta articles (draft/publish, lead story); Instagram posts can be hidden | staff+ | 1 |
| `/admin/instagram` | Connect the club's Instagram, sync now, status | admin | 1 |
| `/admin/users` | Invite, assign role, remove | admin | 1 |
| `/403`, `/404`, `/500` | Branded error pages (`error.vue` renders by status) | — | 1 |

## Navigation

Mobile bottom bar (5): **Home · Partite · Squadra · Stats · Spogliatoio**. Gazzetta, Pagelle and Admin sit in the top-bar menu (and the desktop rail's second group); Admin is shown to staff+, the Spogliatoio and Pagelle to players and above. Viewers see Home, Partite, Squadra, Stats (the Spogliatoio tab is hidden for them).
Desktop: left rail with the same five items plus secondary links and the profile menu.

## Server routes

| Route | Method | Purpose | Guard |
| --- | --- | --- | --- |
| `/api/admin/invite` | POST | Invite email with role | admin |
| `/api/admin/users/[id]` | DELETE | Remove user | admin |
| `/api/instagram/sync` | POST | Import new Instagram posts into the Gazzetta | `CRON_SECRET` header/bearer, or admin session |
| `/api/admin/instagram` | GET / DELETE | Connection status (never the token) / disconnect | admin |
| `/api/admin/instagram/connect` | POST | Validate and store the Instagram token (write-only) | admin |

Everything else goes direct to Supabase under RLS.
