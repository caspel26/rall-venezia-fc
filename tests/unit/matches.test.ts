import { describe, expect, it } from 'vitest'
import { filterMatches } from '../../app/composables/useMatches'

const m = (id: string, status: string, kickoff_at: string, season_id = 's1', competition_id: string | null = 'c1') =>
  ({ id, status, kickoff_at, season_id, competition_id })

const all = [
  m('past-old', 'completed', '2026-09-10T20:00:00Z'),
  m('past-new', 'completed', '2026-10-10T20:00:00Z'),
  m('soon', 'scheduled', '2026-11-20T20:00:00Z'),
  m('later', 'scheduled', '2026-12-20T20:00:00Z'),
  m('other-season', 'completed', '2025-10-10T20:00:00Z', 's0', 'c2'),
]

const base = { state: 'all' as const, season: '', competition: '' }

describe('filterMatches', () => {
  it('puts upcoming matches first (soonest first), then played ones (latest first)', () => {
    expect(filterMatches(all, base).map((x) => x.id)).toEqual(['soon', 'later', 'past-new', 'past-old', 'other-season'])
  })
  it('filters by state', () => {
    expect(filterMatches(all, { ...base, state: 'upcoming' }).map((x) => x.id)).toEqual(['soon', 'later'])
    expect(filterMatches(all, { ...base, state: 'completed' })).toHaveLength(3)
  })
  it('filters by season and competition', () => {
    expect(filterMatches(all, { ...base, season: 's0' }).map((x) => x.id)).toEqual(['other-season'])
    expect(filterMatches(all, { ...base, competition: 'c2' }).map((x) => x.id)).toEqual(['other-season'])
  })
})
