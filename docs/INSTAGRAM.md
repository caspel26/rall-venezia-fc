# Instagram → Gazzetta

Every new post on the club's Instagram becomes a published article in the Gazzetta: the **first image is the cover** (for a video, its thumbnail), the **first sentence of the caption is the headline**, the rest is the body. Trailing hashtag lines are dropped and the article links back to the original post. An admin can hide any imported article from `/admin/news`.

## How it works

```
GitHub Actions (every ~15 min)  ──POST /api/instagram/sync──▶  Nuxt server route
Vercel Cron (daily, backup)     ──GET/POST with CRON_SECRET──▶  1. refresh the token if < 10 days left
Admin "Sincronizza ora" button  ──(admin session)───────────▶  2. GET graph.instagram.com/me/media
                                                               3. import unseen posts (cover → private storage)
```

- **Not push, but near real time.** Instagram does not notify apps of a new feed post, so the site polls: about every 15 minutes through the GitHub Actions workflow in `.github/workflows/instagram-sync.yml` (free), plus a daily Vercel Cron from `vercel.json` as a safety net.
- The access token is stored only in the `instagram_connection` table (RLS on, no policies: only the server can read it) and is never sent to the browser.
- Imported articles are keyed by the Instagram post id, so a post is imported once. Hiding sets the article to draft and keeps the row, so it is not re-imported.
- Cover images are copied into the private `graphics` bucket (only from Instagram/Facebook CDNs; this is checked in `server/utils/instagramCaption.ts`).

## One-time setup

> Meta changes this flow regularly. Check the current [Instagram API with Instagram Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/business-login) documentation before you start.

1. The club account must be a **Professional (Business or Creator) account**. Switch it in the Instagram app (Settings → Account type) if it is personal.
2. Create an app at developers.facebook.com, add the **Instagram** product → *API setup with Instagram login*.
3. Add the club account as an Instagram tester / use it as the app's account, and **generate a long-lived access token** for it (permission `instagram_business_basic`). While the app stays in development mode and you only use your own account, no app review is needed.
4. Open `/admin/instagram` in the clubhouse, paste the token, press *Collega*, then *Sincronizza ora*.
5. Scheduling: in the GitHub repository add the secrets `SITE_URL` (the deployed site) and `CRON_SECRET` (any long random string); set the same `CRON_SECRET` in the Vercel project's environment variables.

## Token lifetime

Long-lived tokens last **60 days** and are refreshed with a call that must happen at least 24 hours after issue and before expiry. The sync does this itself when fewer than 10 days remain, so a working schedule keeps the connection alive indefinitely. If the sync is paused for more than 60 days the token dies and a new one must be pasted (the admin page shows the last error).

## Limits

Stories are not included. Carousels use their first image. Reels/videos use the thumbnail. Captions are plain text. The most recent 12 posts are checked each run, so a gap of more than 12 posts between syncs would skip the oldest.

## Testing without Instagram

`tests/e2e/mock-instagram.mjs` is a tiny stand-in for the API; the Playwright config starts it and points the app at it with `INSTAGRAM_API_BASE`. `tests/e2e/admin-instagram.spec.ts` covers connecting, importing, de-duplication, hiding and the scheduler secret.
