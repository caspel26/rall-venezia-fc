import type { Database } from '~/types/database'

export function useMatches() {
  const client = useSupabaseClient<Database>()
  return useAsyncData('matches', async () => {
    const [matches, seasons, competitions] = await Promise.all([
      client.from('matches').select('*, opponent:opponents(name, short_name), competition:competitions(name)').order('kickoff_at', { ascending: false }),
      client.from('seasons').select('id, name').order('starts_on', { ascending: false }),
      client.from('competitions').select('id, name').order('name'),
    ])
    return { matches: matches.data ?? [], seasons: seasons.data ?? [], competitions: competitions.data ?? [] }
  }, { lazy: true })
}

export type MatchListItem = NonNullable<ReturnType<typeof useMatches>['data']['value']>['matches'][number]

export interface MatchFilters {
  state: 'all' | 'upcoming' | 'completed'
  season: string
  competition: string
}

/** Upcoming matches come soonest-first, played matches latest-first. Pure so it is unit-tested. */
export function filterMatches<T extends { status: string; kickoff_at: string; season_id: string; competition_id: string | null }>(
  list: T[], f: MatchFilters,
): T[] {
  const upcoming = (m: T) => m.status === 'scheduled' || m.status === 'live' || m.status === 'postponed'
  const out = list.filter((m) =>
    (f.state === 'all' || (f.state === 'upcoming' ? upcoming(m) : m.status === 'completed'))
    && (!f.season || m.season_id === f.season)
    && (!f.competition || m.competition_id === f.competition))
  const ups = out.filter(upcoming).sort((a, b) => a.kickoff_at.localeCompare(b.kickoff_at))
  const rest = out.filter((m) => !upcoming(m)).sort((a, b) => b.kickoff_at.localeCompare(a.kickoff_at))
  return [...ups, ...rest]
}
