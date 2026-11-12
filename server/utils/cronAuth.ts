import { timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

function secretMatches(given: string | undefined, expected: string | undefined) {
  if (!given || !expected) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * Scheduled endpoints accept the shared CRON_SECRET (header or bearer, as Vercel Cron sends it) or a signed-in
 * user with one of `roles` (read from the database). Returns whether the caller was the scheduler.
 */
export async function authorizeCronOrRole(event: H3Event, roles: string[]) {
  const secret = process.env.CRON_SECRET
  const bearer = getHeader(event, 'authorization')?.replace(/^Bearer\s+/i, '')
  const cron = secretMatches(getHeader(event, 'x-cron-secret'), secret) || secretMatches(bearer, secret)
  const admin = serverSupabaseServiceRole(event)
  if (cron) return { admin, cron: true }

  const claims = await serverSupabaseUser(event).catch(() => null)
  if (!claims?.sub) throw createError({ statusCode: 401, statusMessage: 'unauthenticated' })
  const { data } = await admin.from('user_roles').select('role').eq('user_id', claims.sub).maybeSingle()
  if (!data || !roles.includes(data.role)) throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  return { admin, cron: false }
}
