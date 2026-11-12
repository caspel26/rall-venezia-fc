import type { Database } from '~/types/database'
import type { AvailabilityStatus, PlayerRow } from '~/types/domain'

export function useAvailabilityBoard() {
  const client = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  return useAsyncData('availability-board', async () => {
    const { data: next } = await client.from('matches')
      .select('*, opponent:opponents(name, short_name)')
      .eq('status', 'scheduled').gte('kickoff_at', new Date().toISOString()).order('kickoff_at').limit(1).maybeSingle()
    if (!next) return null
    const [rows, squad, me] = await Promise.all([
      client.from('availability').select('player_id, status, responded_at').eq('match_id', next.id),
      client.from('players').select('*').eq('is_active', true),
      client.from('players').select('id').eq('profile_id', user.value?.sub ?? '').maybeSingle(),
    ])
    const answers = new Map((rows.data ?? []).map((r) => [r.player_id, r]))
    const groups: Record<AvailabilityStatus | 'none', { player: PlayerRow; at: string | null }[]> = { available: [], maybe: [], unavailable: [], none: [] }
    for (const p of (squad.data ?? []).sort((a, b) => a.last_name.localeCompare(b.last_name, 'it'))) {
      const a = answers.get(p.id)
      groups[(a?.status as AvailabilityStatus | undefined) ?? 'none'].push({ player: p, at: a?.responded_at ?? null })
    }
    return {
      match: next,
      groups,
      myPlayerId: me.data?.id ?? null,
      myAnswer: (answers.get(me.data?.id ?? '')?.status ?? null) as AvailabilityStatus | null,
    }
  }, { lazy: true })
}

export function useAnnouncements(limit = 50) {
  const client = useSupabaseClient<Database>()
  return useAsyncData(`announcements-${limit}`, async () => {
    const { data } = await client.from('announcements').select('*').not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('pinned', { ascending: false }).order('published_at', { ascending: false }).limit(limit)
    return data ?? []
  }, { lazy: true })
}
