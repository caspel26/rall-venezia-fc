import { requireAdmin } from '../../../utils/requireAdmin'
import { inspectToken, refreshToken } from '../../../utils/instagramSync'

// Store a long-lived Instagram token after checking it works. The token is write-only from the app.
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)
  const body = await readBody<{ token?: unknown }>(event)
  const token = typeof body?.token === 'string' ? body.token.trim() : ''
  if (token.length < 20 || token.length > 1000 || /\s/.test(token)) throw createError({ statusCode: 400, statusMessage: 'invalid_token' })

  let account
  try {
    account = await inspectToken(token)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'token_rejected' })
  }

  // Best effort: a refresh gives a fresh 60-day window and tells us the expiry. It is refused for tokens
  // younger than 24h, in which case we keep the pasted token and assume the standard 60 days.
  let expiresAt = new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString()
  let stored = token
  try {
    const r = await refreshToken(token)
    stored = r.access_token
    expiresAt = new Date(Date.now() + r.expires_in * 1000).toISOString()
  } catch { /* keep the pasted token */ }

  const { error } = await admin.from('instagram_connection').upsert({
    id: true, access_token: stored, username: account.username, token_refreshed_at: new Date().toISOString(),
    expires_at: expiresAt, last_error: null, updated_at: new Date().toISOString(),
  })
  if (error) throw createError({ statusCode: 500, statusMessage: 'store_failed' })
  return { username: account.username, expires_at: expiresAt }
})
