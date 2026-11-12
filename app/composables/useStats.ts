import type { Database } from '~/types/database'
import type { Rankable } from '~/utils/ranking'

export interface StatRow extends Rankable {
  slug: string
  number: number | null
  goals: number
  assists: number
  mvps: number
  wins: number
}

/** Season stats (or all-time when `season` is empty) for the whole squad, one query round. */
export function useStats(season: Ref<string>) {
  const client = useSupabaseClient<Database>()
  const result = useAsyncData('stats', async () => {
    const [seasons, players, seasonStats, career, teams] = await Promise.all([
      client.from('seasons').select('id, name, is_current').order('starts_on', { ascending: false }),
      client.from('players').select('id, slug, first_name, last_name, shirt_number'),
      client.from('player_season_stats').select('*'),
      client.from('player_career_stats').select('*'),
      client.from('team_season_stats').select('*'),
    ])
    return {
      seasons: seasons.data ?? [],
      players: players.data ?? [],
      seasonStats: seasonStats.data ?? [],
      career: career.data ?? [],
      teams: teams.data ?? [],
    }
  }, { lazy: true })

  const rows = computed<StatRow[]>(() => {
    const d = result.data.value
    if (!d) return []
    const source = season.value ? d.seasonStats.filter((s) => s.season_id === season.value) : d.career
    const byId = new Map(source.map((s) => [s.player_id, s]))
    return d.players.flatMap((p) => {
      const s = byId.get(p.id)
      if (!s) return []
      return [{
        id: p.id, slug: p.slug, name: `${p.first_name} ${p.last_name}`, number: p.shirt_number,
        appearances: s.appearances ?? 0, goals: s.goals ?? 0, assists: s.assists ?? 0, mvps: s.mvps ?? 0,
        wins: s.wins ?? 0,
      }]
    })
  })
  const team = computed(() => {
    const d = result.data.value
    if (!d) return null
    const t = season.value ? d.teams.filter((x) => x.season_id === season.value) : d.teams
    if (!t.length) return null
    const sum = (k: 'played' | 'wins' | 'draws' | 'losses' | 'goals_for' | 'goals_against') => t.reduce((a, x) => a + (x[k] ?? 0), 0)
    return { played: sum('played'), wins: sum('wins'), draws: sum('draws'), losses: sum('losses'), gf: sum('goals_for'), ga: sum('goals_against') }
  })
  return { ...result, rows, team }
}
