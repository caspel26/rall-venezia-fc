import type { Database } from '~/types/database'
import type { AvailabilityStatus } from '~/types/domain'
import { countAvailability } from '~/utils/results'

// Small shared queries behind the home widgets. Same key => Nuxt shares one request between widgets.

export function useNextMatch() {
  const client = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  return useAsyncData('next-match', async () => {
    const { data: next } = await client.from('matches')
      .select('*, opponent:opponents(*), competition:competitions(name)')
      .eq('status', 'scheduled').gte('kickoff_at', new Date().toISOString()).order('kickoff_at').limit(1).maybeSingle()
    if (!next) return null
    const [answers, squad, me] = await Promise.all([
      client.from('availability').select('player_id, status').eq('match_id', next.id),
      client.from('players').select('id', { count: 'exact', head: true }).eq('is_active', true),
      client.from('players').select('id').eq('profile_id', user.value?.sub ?? '').maybeSingle(),
    ])
    const rows = answers.data ?? []
    return {
      match: next,
      myPlayerId: me.data?.id ?? null,
      myAnswer: (rows.find((a) => a.player_id === me.data?.id)?.status ?? null) as AvailabilityStatus | null,
      counts: countAvailability(rows.map((a) => a.status), squad.count ?? 0),
    }
  }, { lazy: true })
}

export function useRecentMatches() {
  const client = useSupabaseClient<Database>()
  return useAsyncData('recent-matches', async () => {
    const { data } = await client.from('matches')
      .select('*, opponent:opponents(*), mvp_awards(player:players(*))')
      .eq('status', 'completed').order('kickoff_at', { ascending: false }).limit(5)
    return data ?? []
  }, { lazy: true })
}

export function useLatestRating() {
  const client = useSupabaseClient<Database>()
  return useAsyncData('latest-rating', async () => {
    const { data } = await client.from('ratings')
      .select('*, player:players(*), match:matches(kickoff_at, opponent:opponents(name))')
      .eq('published', true).order('updated_at', { ascending: false }).limit(1).maybeSingle()
    return data
  }, { lazy: true })
}

export function useLatestAnnouncement() {
  const client = useSupabaseClient<Database>()
  return useAsyncData('latest-announcement', async () => {
    const now = new Date().toISOString()
    const { data } = await client.from('announcements').select('*').not('published_at', 'is', null)
      .lte('published_at', now).order('published_at', { ascending: false }).limit(1).maybeSingle()
    return data
  }, { lazy: true })
}

export function useTeamRecord() {
  const client = useSupabaseClient<Database>()
  return useAsyncData('team-record', async () => {
    const { data: season } = await client.from('seasons').select('id, name').eq('is_current', true).maybeSingle()
    if (!season) return null
    const { data } = await client.from('team_season_stats').select('*').eq('season_id', season.id).maybeSingle()
    return data ? { season: season.name, ...data } : null
  }, { lazy: true })
}

/** Top-N players by a career stat, from the shared squad query. */
export function useRanking(key: 'goals' | 'assists' | 'mvps', n = 5) {
  const { data, status } = useSquad()
  const rows = computed(() => (data.value ?? [])
    .filter((p) => (p.stats?.[key] ?? 0) > 0)
    .sort((a, b) => (b.stats![key] ?? 0) - (a.stats![key] ?? 0) || a.last_name.localeCompare(b.last_name, 'it'))
    .slice(0, n)
    .map((p) => ({ player: p, value: p.stats![key] ?? 0 })))
  return { rows, status }
}
