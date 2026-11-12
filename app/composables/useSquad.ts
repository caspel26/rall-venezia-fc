import type { Database } from '~/types/database'

/** Active squad ordered by shirt number (unknown numbers last), with career stats attached. */
export function useSquad() {
  const client = useSupabaseClient<Database>()
  return useAsyncData('squad', async () => {
    const [players, stats] = await Promise.all([
      client.from('players').select('*').eq('is_active', true),
      client.from('player_career_stats').select('*'),
    ])
    const byId = new Map((stats.data ?? []).map((s) => [s.player_id, s]))
    return (players.data ?? [])
      .map((p) => ({ ...p, stats: byId.get(p.id) ?? null }))
      .sort((a, b) => (a.shirt_number ?? 999) - (b.shirt_number ?? 999) || a.last_name.localeCompare(b.last_name, 'it'))
  }, { lazy: true })
}
