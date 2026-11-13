import { serverSupabaseServiceRole } from '#supabase/server'

// Keep-alive: one trivial query so the free Supabase project never counts as idle (it pauses after a week of
// inactivity). Public on purpose and returns nothing but ok.
export default defineEventHandler(async (event) => {
  const { error } = await serverSupabaseServiceRole(event).from('seasons').select('id', { head: true, count: 'exact' }).limit(1)
  if (error) throw createError({ statusCode: 503, statusMessage: 'db_unreachable' })
  return { ok: true }
})
