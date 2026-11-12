import { describe, expect, it } from 'vitest'
import { parseStandings, rankStandings } from '../../app/utils/standings'

describe('rankStandings', () => {
  it('orders by points, then by the manual order, and numbers the rows', () => {
    const r = rankStandings([
      { team: 'Napoli', points: 18, sort_order: 4 },
      { team: 'Lazio', points: 21, sort_order: 1 },
      { team: 'Venezia', points: 18, sort_order: 3, is_us: true },
    ])
    expect(r.map((x) => [x.position, x.team])).toEqual([[1, 'Lazio'], [2, 'Venezia'], [3, 'Napoli']])
  })
})

describe('parseStandings', () => {
  it('reads the common ways of pasting a table', () => {
    const t = ['1 LAZIO 21', '2. Como - 19', '3) venezia, 18', 'Napoli\t18', 'AC MILAN 15 pt', '', 'solo testo'].join('\n')
    expect(parseStandings(t)).toEqual([
      { team: 'Lazio', points: 21 }, { team: 'Como', points: 19 }, { team: 'Venezia', points: 18 },
      { team: 'Napoli', points: 18 }, { team: 'Ac Milan', points: 15 },
    ])
  })
  it('does not mistake a rank for the points of a lone number', () => {
    expect(parseStandings('21')).toEqual([])
  })
})
