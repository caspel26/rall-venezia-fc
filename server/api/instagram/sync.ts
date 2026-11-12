import { authorizeCronOrRole } from '../../utils/cronAuth'
import { syncInstagram } from '../../utils/instagramSync'

// Called by the scheduler (GitHub Actions every ~15 min, Vercel Cron daily) with the shared secret,
// or by an admin from the app ("Sincronizza ora"). Anything else is refused.
export default defineEventHandler(async (event) => {
  const { admin } = await authorizeCronOrRole(event, ['admin'])
  try {
    return await syncInstagram(admin)
  } catch (e) {
    const message = (e as Error).message
    throw createError({ statusCode: message === 'not_connected' ? 409 : 502, statusMessage: message === 'not_connected' ? 'not_connected' : 'instagram_error', message })
  }
})
