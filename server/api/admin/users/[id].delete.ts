import { requireAdmin } from '../../../utils/requireAdmin'

// Remove a member. The last-admin trigger blocks removing the final admin.
export default defineEventHandler(async (event) => {
  const { admin, callerId } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) throw createError({ statusCode: 400, statusMessage: 'invalid_id' })
  if (id === callerId) throw createError({ statusCode: 400, statusMessage: 'cannot_delete_self' })

  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) throw createError({ statusCode: 400, statusMessage: error.message })
  return { ok: true }
})
