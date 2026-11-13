import { requireAdmin } from '../../utils/requireAdmin'
import { isRole } from '../../utils/roles'
import { generatePassword, isUsername, usernameToEmail } from '../../utils/username'

// Create a member with username + password (no email involved). The admin hands the password over; it is returned
// once here and never stored in clear. Optionally links the account to a squad player.
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)
  const body = await readBody<{ username?: unknown; password?: unknown; role?: unknown; displayName?: unknown; playerSlug?: unknown }>(event)

  const username = typeof body?.username === 'string' ? body.username.trim().toLowerCase() : ''
  if (!isUsername(username)) throw createError({ statusCode: 400, statusMessage: 'invalid_username' })
  if (!isRole(body.role)) throw createError({ statusCode: 400, statusMessage: 'invalid_role' })
  const password = typeof body.password === 'string' && body.password ? body.password : generatePassword()
  if (password.length < 8) throw createError({ statusCode: 400, statusMessage: 'weak_password' })
  const displayName = typeof body.displayName === 'string' ? body.displayName.trim().slice(0, 80) : ''

  const { data, error } = await admin.auth.admin.createUser({
    email: usernameToEmail(username),
    password,
    email_confirm: true,
    user_metadata: displayName ? { display_name: displayName } : undefined,
  })
  if (error || !data.user) throw createError({ statusCode: 400, statusMessage: error?.message ?? 'create_failed' })

  const { error: roleError } = await admin.from('user_roles').update({ role: body.role }).eq('user_id', data.user.id)
  if (roleError) throw createError({ statusCode: 500, statusMessage: 'role_failed' })

  if (typeof body.playerSlug === 'string' && body.playerSlug) {
    const { error: linkError } = await admin.from('players').update({ profile_id: data.user.id }).eq('slug', body.playerSlug)
    if (linkError) throw createError({ statusCode: 500, statusMessage: 'link_failed' })
  }
  return { id: data.user.id, username, role: body.role, password }
})
