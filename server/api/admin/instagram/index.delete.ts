import { requireAdmin } from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)
  await admin.from('instagram_connection').delete().eq('id', true)
  return { ok: true }
})
