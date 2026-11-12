import type { Database } from '~/types/database'

export function useRatings() {
  const client = useSupabaseClient<Database>()
  return useAsyncData('ratings', async () => {
    const { data } = await client.from('ratings')
      .select('id, score, review, attributes, player:players(id, first_name, last_name, slug), match:matches(id, kickoff_at, opponent:opponents(name))')
      .eq('published', true)
    return (data ?? []).sort((a, b) => (b.match?.kickoff_at ?? '').localeCompare(a.match?.kickoff_at ?? '') || Number(b.score) - Number(a.score))
  }, { lazy: true })
}
