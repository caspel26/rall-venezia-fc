import { describe, expect, it } from 'vitest'
import { countAvailability, formOf, resultOf } from '../../app/utils/results'
import { formatScore } from '../../app/utils/format'

describe('resultOf', () => {
  it('is W, D or L from our point of view', () => {
    expect(resultOf({ rv_score: 10, opp_score: 5 })).toBe('W')
    expect(resultOf({ rv_score: 4, opp_score: 4 })).toBe('D')
    expect(resultOf({ rv_score: 3, opp_score: 4 })).toBe('L')
  })
  it('is null while the score is unknown', () => {
    expect(resultOf({ rv_score: null, opp_score: null })).toBeNull()
  })
})

describe('formOf', () => {
  it('keeps the last five, oldest first, skipping unplayed matches', () => {
    const ms = [
      { rv_score: 1, opp_score: 0 }, { rv_score: null, opp_score: null }, { rv_score: 0, opp_score: 1 },
      { rv_score: 2, opp_score: 2 }, { rv_score: 3, opp_score: 0 }, { rv_score: 1, opp_score: 5 }, { rv_score: 4, opp_score: 1 },
    ]
    expect(formOf(ms)).toEqual(['L', 'D', 'W', 'L', 'W'])
  })
})

describe('countAvailability', () => {
  it('derives "no response" from the squad size', () => {
    expect(countAvailability(['available', 'available', 'maybe', 'unavailable'], 7)).toEqual({
      available: 2, maybe: 1, unavailable: 1, noResponse: 3,
    })
  })
  it('never goes negative', () => {
    expect(countAvailability(['available', 'available'], 1).noResponse).toBe(0)
  })
})

describe('formatting', () => {
  it('shows a dash for missing values', () => {
    expect(formatScore(undefined)).toBe('–')
  })
})
