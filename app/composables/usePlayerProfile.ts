import type { Database } from '~/types/database'

export function usePlayerProfile(slug: MaybeRef<string>) {
  const client = useSupabaseClient<Database>()
  return useAsyncData(`player-${toValue(slug)}`, async () => {
    const { data: player } = await client.from('players').select('*').eq('slug', toValue(slug)).maybeSingle()
    if (!player) throw createError({ statusCode: 404, statusMessage: 'Giocatore non trovato' })

    const [career, seasonStats, seasons, played, goals, ratings] = await Promise.all([
      client.from('player_career_stats').select('*').eq('player_id', player.id).maybeSingle(),
      client.from('player_season_stats').select('*').eq('player_id', player.id),
      client.from('seasons').select('id, name').order('starts_on', { ascending: false }),
      client.from('match_players').select('is_starter, match:matches(id, kickoff_at, is_home, rv_score, opp_score, status, opponent:opponents(name, short_name))')
        .eq('player_id', player.id),
      client.from('goals').select('match_id, scorer_id, assist_id').or(`scorer_id.eq.${player.id},assist_id.eq.${player.id}`),
      client.from('ratings').select('id, score, review, attributes, match:matches(kickoff_at, opponent:opponents(name))')
        .eq('player_id', player.id).eq('published', true),
    ])

    const seasonName = new Map((seasons.data ?? []).map((s) => [s.id, s.name]))
    const perMatch = new Map<string, { goals: number; assists: number }>()
    for (const g of goals.data ?? []) {
      const e = perMatch.get(g.match_id) ?? { goals: 0, assists: 0 }
      if (g.scorer_id === player.id) e.goals++
      if (g.assist_id === player.id) e.assists++
      perMatch.set(g.match_id, e)
    }

    const matches = (played.data ?? [])
      .filter((r) => r.match?.status === 'completed')
      .map((r) => ({ ...r.match!, isStarter: r.is_starter, ...(perMatch.get(r.match!.id) ?? { goals: 0, assists: 0 }) }))
      .sort((a, b) => b.kickoff_at.localeCompare(a.kickoff_at))

    return {
      player,
      career: career.data,
      seasons: (seasonStats.data ?? []).map((s) => ({ ...s, seasonName: s.season_id ? seasonName.get(s.season_id) ?? '' : '' })),
      matches,
      ratings: (ratings.data ?? []).sort((a, b) => (b.match?.kickoff_at ?? '').localeCompare(a.match?.kickoff_at ?? '')),
    }
  }, { lazy: true })
}
