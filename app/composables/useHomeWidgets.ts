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
      answers: rows.map((a) => ({ playerId: a.player_id, status: a.status as AvailabilityStatus })),
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

/** Top-N players by a career stat, with the same tie-break and shared positions as the Stats page. */
export function useRanking(key: 'goals' | 'assists' | 'mvps', n = 5) {
  const { data, status } = useSquad()
  const rows = computed(() => {
    const people = (data.value ?? []).map((p) => ({
      id: p.id, name: `${p.first_name} ${p.last_name}`, appearances: p.stats?.appearances ?? 0, player: p, value: p.stats?.[key] ?? 0,
    }))
    return rankBy(people, (r) => r.value, n).map((r) => ({ position: r.position, player: r.row.player, value: r.value }))
  })
  return { rows, status }
}

/** Goals of one match with scorer ids, for the result card. */
export function useMatchScorers(matchId: MaybeRefOrGetter<string | undefined>) {
  const client = useSupabaseClient<Database>()
  return useAsyncData(() => `scorers-${toValue(matchId) ?? 'none'}`, async () => {
    const id = toValue(matchId)
    if (!id) return []
    const { data } = await client.from('goals').select('scorer_id, is_own_goal').eq('match_id', id)
    const tally = new Map<string, number>()
    for (const g of data ?? []) if (g.scorer_id) tally.set(g.scorer_id, (tally.get(g.scorer_id) ?? 0) + 1)
    return [...tally].map(([playerId, n]) => ({ playerId, n })).sort((a, b) => b.n - a.n)
  }, { lazy: true, watch: [() => toValue(matchId)] })
}
