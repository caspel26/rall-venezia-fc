import type { Database } from '~/types/database'
import type { AvailabilityStatus } from '~/types/domain'
import { countAvailability, formOf } from '~/utils/results'

/** Everything the dashboard needs, fetched in one round under RLS. */
export function useHomeData() {
  const client = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  return useAsyncData('home', async () => {
    const now = new Date().toISOString()
    const [next, recent, players, careers, rating, announcement, me] = await Promise.all([
      client.from('matches').select('*, opponent:opponents(*), competition:competitions(name)')
        .eq('status', 'scheduled').gte('kickoff_at', now).order('kickoff_at').limit(1).maybeSingle(),
      client.from('matches').select('*, opponent:opponents(*), mvp_awards(player:players(*))')
        .eq('status', 'completed').order('kickoff_at', { ascending: false }).limit(5),
      client.from('players').select('*').eq('is_active', true),
      client.from('player_career_stats').select('*'),
      client.from('ratings').select('*, player:players(*), match:matches(kickoff_at, opponent:opponents(name))')
        .eq('published', true).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
      client.from('announcements').select('*').not('published_at', 'is', null).lte('published_at', now)
        .order('published_at', { ascending: false }).limit(1).maybeSingle(),
      client.from('players').select('id').eq('profile_id', user.value?.sub ?? '').maybeSingle(),
    ])

    const answers = next.data
      ? (await client.from('availability').select('player_id, status').eq('match_id', next.data.id)).data ?? []
      : []

    const squad = players.data ?? []
    const stats = careers.data ?? []
    const byPlayer = new Map(squad.map((p) => [p.id, p]))
    const top = (key: 'goals' | 'assists' | 'mvps') => {
      const row = [...stats].filter((s) => (s[key] ?? 0) > 0).sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0))[0]
      return row?.player_id && byPlayer.has(row.player_id) ? { player: byPlayer.get(row.player_id)!, value: row[key] ?? 0 } : null
    }

    const completed = recent.data ?? []
    return {
      next: next.data,
      last: completed[0] ?? null,
      form: formOf([...completed].reverse()),
      top: { goals: top('goals'), assists: top('assists'), mvps: top('mvps') },
      rating: rating.data,
      announcement: announcement.data,
      myPlayerId: me.data?.id ?? null,
      myAnswer: (answers.find((a) => a.player_id === me.data?.id)?.status ?? null) as AvailabilityStatus | null,
      availability: countAvailability(answers.map((a) => a.status), squad.length),
    }
  }, { lazy: true })
}
