import { describe, expect, it } from 'vitest'
import { addDays, nextMondayAfter, pollClosesAt, weeklyPollFor } from '../../server/utils/weeklyPoll'

describe('nextMondayAfter', () => {
  it('is the first Monday strictly after the date', () => {
    expect(nextMondayAfter('2026-11-05')).toBe('2026-11-09') // Thursday -> Monday
    expect(nextMondayAfter('2026-11-08')).toBe('2026-11-09') // Sunday -> next day
    expect(nextMondayAfter('2026-11-09')).toBe('2026-11-16') // Monday -> a week later
  })
})

describe('weeklyPollFor', () => {
  it('creates the poll the day after a match, for the following Monday', () => {
    expect(weeklyPollFor('2026-11-06', ['2026-11-05'])).toBe('2026-11-09')
  })
  it('after a Sunday match the poll (created Monday) covers that same coming week', () => {
    expect(weeklyPollFor('2026-11-09', ['2026-11-08'])).toBe('2026-11-09')
  })
  it('does nothing on other days', () => {
    expect(weeklyPollFor('2026-11-07', ['2026-11-05'])).toBeNull()
    expect(weeklyPollFor('2026-11-06', [])).toBeNull()
  })
})

describe('pollClosesAt', () => {
  it('is Friday 20:00 Rome, winter and summer', () => {
    expect(pollClosesAt('2026-11-09')).toBe('2026-11-13T19:00:00.000Z')
    expect(pollClosesAt('2026-06-08')).toBe('2026-06-12T18:00:00.000Z')
  })
  it('addDays crosses month ends', () => expect(addDays('2026-11-30', 2)).toBe('2026-12-02'))
})
