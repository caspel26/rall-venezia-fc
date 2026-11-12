# MVP

Goal: the squad can log in on their phones, see the next match, answer availability in two taps, and after each match staff record the result, scorers, assists, MVP and pagelle in under a minute. Everything derived (stats, form, rankings) just works.

## In (Phase 1)

- Invite-only auth, four roles, RLS everywhere, branded login, 403/404/500.
- App shell: mobile bottom nav, desktop rail, skeletons, empty states.
- Home: next match, availability strip, last result with MVP, form, top performers, latest pagella, latest announcement.
- Squad + player profiles (overview, matches, ratings; derived stats).
- Matches archive (upcoming/completed, season, competition) + match programme page (score hero, goals timeline, lineup, MVP, ratings, notes).
- Ratings archive (native rendering).
- Availability (player answer, staff counts).
- Basic statistics: team record, player stats, rankings.
- Announcements (Spogliatoio).
- Admin: players, matches, post-match flow, ratings, announcements, users/invites.
- Seed data; docs; deployment behind Cloudflare Access.

## Out (explicitly)

Media archive uploads/gallery, Hall of Fame, advanced stats, season comparison, meme room, mascot, PWA, notifications, polls, chat, lineup suggestions, tactical board, AI/Instagram automation. The schema already includes `media` and `mascot` so none of this needs a rewrite.

## Definition of MVP done

1. A non-allow-listed visitor cannot reach the site; a viewer cannot read ratings or availability (pgTAP).
2. A player answers availability in ≤ 2 taps at 390x844.
3. A staff user completes the post-match flow in ≤ 60 seconds on seeded data.
4. Lighthouse mobile performance ≥ 90 on Home and Match detail; no horizontal scroll 320–1440.
5. All checks in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) stage 11 pass.
