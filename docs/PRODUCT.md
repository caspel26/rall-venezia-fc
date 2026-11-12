# Product — Rall Venezia Clubhouse

## Vision

A private digital clubhouse for Rall Venezia FC, an amateur futsal/football team. The Instagram page is the public face; this app is the world behind it. A player opens it on their phone and thinks "this is our club", not "this is an amateur team website".

It is a club site, a locker room, a stats platform, a match archive and a pagelle archive in one app. Visually premium and editorial; in copy ironic and football-first (Italian, matching the Instagram voice).

Not a generic admin dashboard, not a SaaS template, not a public site. Nothing is public. No signup.

## Users and roles

| Role | Who | Core need |
| --- | --- | --- |
| `admin` | Platform owner(s) | Everything, including inviting users and assigning roles |
| `staff` | Coach, assistant, team manager | Run matches, lineups, availability, announcements |
| `player` | Squad members | See the club, answer availability in two taps, read their pagelle |
| `viewer` | Invited friends/family (optional) | Matches, results, media, basic stats; no locker room, no ratings |

The full matrix is in [AUTHORIZATION.md](AUTHORIZATION.md).

## Core flows

1. **Invite** — admin enters an email and role → Supabase sends an invite → the person sets a password → admin links the account to a player (if they are one).
2. **Availability** — a player opens Home, sees the next match, taps Available / Maybe / Unavailable. Two taps, timestamp stored, changeable until kickoff.
3. **Post-match** (admin/staff, under a minute): open match → final score → scorers + assists → MVP → ratings → media → publish.
4. **Matchday** — Home leads with the next match and the player's own availability state.
5. **Browse the archive** — matches, a match "programme" page, player profiles with derived stats, rankings, Hall of Fame.

## Feature map

| Area | MVP (Phase 1) | Phase 2 | Phase 3 (not built, not blocked) |
| --- | --- | --- | --- |
| Auth, invite, roles | yes | | |
| Home dashboard | yes | | |
| Squad + player profile | yes | media tab, season history | achievements |
| Matches + detail, result, goals, assists, MVP | yes | match media | lineup management, tactical board |
| Ratings (pagelle) | yes | | AI summaries |
| Availability | yes | | reminders, notifications, lineup suggestions |
| Basic statistics + rankings | yes | advanced stats, season comparison | |
| Announcements (Spogliatoio) | yes | | polls |
| Admin CRUD | yes | | |
| Media archive | | yes | automated Instagram graphics |
| Hall of Fame | | yes | |
| Meme room, Mascot | | yes | |
| PWA | | yes | native app |

## Brand voice

Competitive, ironic, confident, football-first, slightly chaotic, visually professional. UI language is Italian only (no i18n library). Examples: "Tre punti portati a casa.", "Nuova quest completata.", "Lo spogliatoio." No corporate motivational copy. Empty/error states carry club personality (see [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)).

## Principles

1. **Privacy first.** Invite-only Supabase auth with RLS as the single, real enforcement layer (no perimeter proxy: this is a hobby site, kept simple to deploy).
2. **Mobile first.** Almost-native feel on a phone; desktop is a recomposition, not a stretched phone.
3. **Relational truth.** Stats are derived from records, never maintained as counters.
4. **Simple admin.** Quick workflows, no enterprise CMS.
5. **Never invent data.** Unknown shirt numbers are `null`. No sensitive personal details.

## Non-goals

Public pages, social features, chat, payments, complex analytics, real-time anything in MVP.
