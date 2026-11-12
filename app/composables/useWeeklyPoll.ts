import type { Database } from '~/types/database'

const addDay = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10)

/** The open weekly poll (Mon-Fri), who voted for which day, and what I picked. */
export function useWeeklyPoll() {
  const client = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  return useAsyncData('weekly-poll', async () => {
    const { data: poll } = await client.from('polls').select('*').gt('closes_at', new Date().toISOString())
      .order('week_start').limit(1).maybeSingle()
    if (!poll) return null
    const [votes, me] = await Promise.all([
      client.from('poll_votes').select('player_id, day').eq('poll_id', poll.id),
      client.from('players').select('id').eq('profile_id', user.value?.sub ?? '').maybeSingle(),
    ])
    const rows = votes.data ?? []
    const days = [0, 1, 2, 3, 4].map((i) => {
      const date = addDay(poll.week_start, i)
      const voters = rows.filter((v) => v.day === date).map((v) => v.player_id)
      return { date, voters, n: voters.length }
    })
    const top = Math.max(0, ...days.map((d) => d.n))
    return {
      poll,
      days,
      best: top > 0 ? days.filter((d) => d.n === top).map((d) => d.date) : [],
      top,
      respondents: new Set(rows.map((v) => v.player_id)).size,
      myPlayerId: me.data?.id ?? null,
      mine: rows.filter((v) => v.player_id === me.data?.id).map((v) => v.day),
    }
  }, { lazy: true })
}
