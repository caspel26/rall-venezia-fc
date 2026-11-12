import type { H3Event } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

/**
 * Guard for admin-only server routes. The caller's id comes from the verified session and the
 * role is read from the database; nothing the browser sends is trusted. Returns the service-role
 * client only after the caller is confirmed as admin.
 */
export async function requireAdmin(event: H3Event) {
  const claims = await serverSupabaseUser(event).catch(() => null)
  if (!claims?.sub) {
    throw createError({ statusCode: 401, statusMessage: 'unauthenticated' })
  }
  const admin = serverSupabaseServiceRole(event)
  const { data, error } = await admin.from('user_roles').select('role').eq('user_id', claims.sub).maybeSingle()
  if (error || data?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  }
  return { admin, callerId: claims.sub }
}
