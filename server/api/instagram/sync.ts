import { timingSafeEqual } from 'node:crypto'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { syncInstagram } from '../../utils/instagramSync'

function secretMatches(given: string | undefined, expected: string | undefined) {
  if (!given || !expected) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

// Called by the scheduler (GitHub Actions every ~15 min, Vercel Cron daily) with the shared secret,
// or by an admin from the app ("Sincronizza ora"). Anything else is refused.
export default defineEventHandler(async (event) => {
  const secret = process.env.CRON_SECRET
  const bearer = getHeader(event, 'authorization')?.replace(/^Bearer\s+/i, '')
  const cronOk = secretMatches(getHeader(event, 'x-cron-secret'), secret) || secretMatches(bearer, secret)

  const admin = serverSupabaseServiceRole(event)
  if (!cronOk) {
    const claims = await serverSupabaseUser(event).catch(() => null)
    if (!claims?.sub) throw createError({ statusCode: 401, statusMessage: 'unauthenticated' })
    const { data } = await admin.from('user_roles').select('role').eq('user_id', claims.sub).maybeSingle()
    if (data?.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  }

  try {
    return await syncInstagram(admin)
  } catch (e) {
    const message = (e as Error).message
    throw createError({ statusCode: message === 'not_connected' ? 409 : 502, statusMessage: message === 'not_connected' ? 'not_connected' : 'instagram_error', message })
  }
})
