import type { AvailabilityStatus } from '~/types/domain'
import type { Database } from '~/types/database'

export function useMatchDetail(id: MaybeRef<string>) {
  const client = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  return useAsyncData(`match-${toValue(id)}`, async () => {
    const { data: match, error } = await client.from('matches')
      .select(`*, opponent:opponents(*), competition:competitions(name), season:seasons(name),
        goals(*), match_players(is_starter, minutes, player:players(*)),
        mvp_awards(player:players(*))`)
      .eq('id', toValue(id)).maybeSingle()
    if (error || !match) throw createError({ statusCode: 404, statusMessage: 'Partita non trovata' })

    const me = await client.from('players').select('id').eq('profile_id', user.value?.sub ?? '').maybeSingle()
    const answers = match.status === 'scheduled'
      ? (await client.from('availability').select('player_id, status').eq('match_id', match.id)).data ?? []
      : []

    const players = new Map(match.match_players.map((mp) => [mp.player!.id, mp.player!]))
    const goals = [...match.goals].sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999))
    const tally = new Map<string, number>()
    for (const g of goals) if (g.scorer_id) tally.set(g.scorer_id, (tally.get(g.scorer_id) ?? 0) + 1)
    const best = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]

    return {
      match,
      goals,
      players,
      starters: match.match_players.filter((m) => m.is_starter).map((m) => m.player!),
      bench: match.match_players.filter((m) => !m.is_starter).map((m) => m.player!),
      mvps: match.mvp_awards.map((a) => a.player!).filter(Boolean),
      topScorer: best && players.get(best[0]) ? { player: players.get(best[0])!, goals: best[1] } : null,
      myPlayerId: me.data?.id ?? null,
      myAnswer: (answers.find((a) => a.player_id === me.data?.id)?.status ?? null) as AvailabilityStatus | null,
      availability: countAvailability(answers.map((a) => a.status), 0),
    }
  }, { lazy: true })
}
