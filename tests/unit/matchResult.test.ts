import { describe, expect, it } from 'vitest'
import { buildResultPayload, validateResult, type ResultDraft } from '../../app/utils/matchResult'
import { isoToRomeLocal, romeLocalToIso } from '../../app/utils/time'

const draft = (over: Partial<ResultDraft> = {}): ResultDraft => ({
  rv: 3, opp: 1,
  lineup: { a: { played: true, starter: true }, b: { played: true, starter: false }, c: { played: false, starter: false } },
  goals: [{ scorer: 'a', assist: 'b', minute: 5, own: false }],
  mvp: 'a',
  ...over,
})

describe('validateResult', () => {
  it('accepts a consistent result', () => expect(validateResult(draft())).toEqual({}))
  it('requires a score and a lineup', () => {
    expect(validateResult(draft({ rv: null })).score).toBeTruthy()
    expect(validateResult(draft({ lineup: {} })).lineup).toBeTruthy()
  })
  it('rejects more recorded goals than the score', () => {
    const g = { scorer: 'a', assist: '', minute: null, own: false }
    expect(validateResult(draft({ rv: 1, goals: [g, g] })).goals).toContain('2 gol')
  })
  it('rejects scorers, assists and MVP who did not play', () => {
    expect(validateResult(draft({ goals: [{ scorer: 'c', assist: '', minute: null, own: false }] })).scorers).toBeTruthy()
    expect(validateResult(draft({ goals: [{ scorer: 'a', assist: 'c', minute: null, own: false }] })).scorers).toBeTruthy()
    expect(validateResult(draft({ mvp: 'c' })).mvp).toBeTruthy()
  })
  it('lets an own goal have no scorer', () => {
    expect(validateResult(draft({ goals: [{ scorer: '', assist: '', minute: null, own: true }] }))).toEqual({})
  })
})

describe('buildResultPayload', () => {
  it('maps the draft to RPC arguments', () => {
    const p = buildResultPayload(draft({ goals: [{ scorer: 'a', assist: '', minute: 7, own: false }, { scorer: '', assist: 'b', minute: null, own: true }] }))
    expect(p.p_lineup).toEqual([{ player_id: 'a', is_starter: true }, { player_id: 'b', is_starter: false }])
    expect(p.p_goals).toEqual([
      { scorer_id: 'a', assist_id: null, minute: 7, is_own_goal: false },
      { scorer_id: null, assist_id: null, minute: null, is_own_goal: true },
    ])
    expect(p.p_mvp_ids).toEqual(['a'])
  })
})

describe('Rome time conversion', () => {
  it('converts winter (CET) and summer (CEST) wall clock to UTC', () => {
    expect(romeLocalToIso('2026-11-17T20:00')).toBe('2026-11-17T19:00:00.000Z')
    expect(romeLocalToIso('2026-07-17T20:00')).toBe('2026-07-17T18:00:00.000Z')
  })
  it('round-trips', () => {
    for (const l of ['2026-11-17T20:00', '2026-03-29T04:30', '2026-10-25T01:15']) expect(isoToRomeLocal(romeLocalToIso(l))).toBe(l)
  })
})
