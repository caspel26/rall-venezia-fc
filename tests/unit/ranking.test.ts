import { describe, expect, it } from 'vitest'
import { rankBy } from '../../app/utils/ranking'

const p = (id: string, name: string, appearances: number, goals: number) => ({ id, name, appearances, goals })

describe('rankBy', () => {
  const rows = [p('a', 'Rossi', 10, 5), p('b', 'Bianchi', 6, 5), p('c', 'Verdi', 8, 9), p('d', 'Neri', 3, 0)]

  it('orders by value, then fewer appearances, and drops zeros', () => {
    expect(rankBy(rows, (r) => r.goals).map((x) => x.row.id)).toEqual(['c', 'b', 'a'])
  })
  it('shares a position when value and appearances are equal', () => {
    const tied = [p('a', 'Rossi', 5, 4), p('b', 'Bianchi', 5, 4), p('c', 'Verdi', 5, 2)]
    expect(rankBy(tied, (r) => r.goals).map((x) => x.position)).toEqual([1, 1, 3])
  })
  it('breaks a full tie by name', () => {
    const tied = [p('a', 'Rossi', 5, 4), p('b', 'Bianchi', 5, 4)]
    expect(rankBy(tied, (r) => r.goals).map((x) => x.row.name)).toEqual(['Bianchi', 'Rossi'])
  })
  it('respects the limit', () => {
    expect(rankBy(rows, (r) => r.goals, 1)).toHaveLength(1)
  })
})
