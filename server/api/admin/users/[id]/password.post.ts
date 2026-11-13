import { requireAdmin } from '../../../../utils/requireAdmin'
import { generatePassword } from '../../../../utils/username'

// Reset a member's password (there is no email to send a link to). Returns the new password once.
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) throw createError({ statusCode: 400, statusMessage: 'invalid_id' })
  const body = await readBody<{ password?: unknown }>(event).catch(() => ({} as { password?: unknown }))
  const password = typeof body?.password === 'string' && body.password ? body.password : generatePassword()
  if (password.length < 8) throw createError({ statusCode: 400, statusMessage: 'weak_password' })
  const { error } = await admin.auth.admin.updateUserById(id, { password })
  if (error) throw createError({ statusCode: 400, statusMessage: error.message })
  return { password }
})
