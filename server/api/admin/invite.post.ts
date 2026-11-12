import { requireAdmin } from '../../utils/requireAdmin'
import { isEmail, isRole } from '../../utils/roles'

// Invite a member: email + role (+ optional display name). Signups are disabled in Supabase,
// so this is the only way an account comes into existence.
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)
  const body = await readBody<{ email?: unknown; role?: unknown; displayName?: unknown }>(event)

  if (!isEmail(body?.email)) throw createError({ statusCode: 400, statusMessage: 'invalid_email' })
  if (!isRole(body.role)) throw createError({ statusCode: 400, statusMessage: 'invalid_role' })
  const displayName = typeof body.displayName === 'string' ? body.displayName.trim().slice(0, 80) : ''

  const email = body.email.trim().toLowerCase()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: displayName ? { display_name: displayName } : undefined,
  })
  if (error || !data.user) {
    throw createError({ statusCode: 400, statusMessage: error?.message ?? 'invite_failed' })
  }

  // The signup trigger gave the new user the least-privilege role; raise it to the requested one.
  const { error: roleError } = await admin.from('user_roles').update({ role: body.role }).eq('user_id', data.user.id)
  if (roleError) throw createError({ statusCode: 500, statusMessage: 'role_failed' })

  return { id: data.user.id, email, role: body.role }
})
