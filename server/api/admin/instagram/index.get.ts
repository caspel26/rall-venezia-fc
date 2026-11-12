import { requireAdmin } from '../../../utils/requireAdmin'

// Connection status for the admin page. The token itself is never returned.
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)
  const { data } = await admin.from('instagram_connection')
    .select('username, expires_at, last_synced_at, last_error, token_refreshed_at').maybeSingle()
  return { connected: !!data, ...data }
})
