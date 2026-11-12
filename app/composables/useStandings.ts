import type { Database } from '~/types/database'

/** The league table for the current season, ranked, with who we are and when it was last changed. */
export function useStandings() {
  const client = useSupabaseClient<Database>()
  return useAsyncData('standings', async () => {
    const { data: season } = await client.from('seasons').select('id, name').eq('is_current', true).maybeSingle()
    if (!season) return null
    const { data } = await client.from('standings').select('*').eq('season_id', season.id)
    const rows = rankStandings(data ?? [])
    const updated = (data ?? []).reduce<string | null>((m, r) => (!m || r.updated_at > m ? r.updated_at : m), null)
    return { season, rows, updated, us: rows.find((r) => r.is_us) ?? null }
  }, { lazy: true })
}
