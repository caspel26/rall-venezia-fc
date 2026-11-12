import type { Database } from '~/types/database'

/** Reference lists used by the match form (seasons, competitions, opponents). */
export function useMatchOptions() {
  const client = useSupabaseClient<Database>()
  const result = useAsyncData('match-options', async () => {
    const [seasons, competitions, opponents] = await Promise.all([
      client.from('seasons').select('id, name, is_current').order('starts_on', { ascending: false }),
      client.from('competitions').select('id, name').order('name'),
      client.from('opponents').select('id, name').order('name'),
    ])
    return { seasons: seasons.data ?? [], competitions: competitions.data ?? [], opponents: opponents.data ?? [] }
  }, { lazy: true })
  return result
}
