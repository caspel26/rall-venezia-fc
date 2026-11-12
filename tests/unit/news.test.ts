import { describe, expect, it } from 'vitest'
import { frontPage, paragraphs } from '../../app/composables/useNews'

const a = (id: string, is_lead = false) => ({ id, is_lead, published_at: '2026-11-01T10:00:00Z' })

describe('frontPage', () => {
  it('uses the flagged lead, then three secondary stories, then the archive', () => {
    const p = frontPage([a('1'), a('2'), a('3', true), a('4'), a('5'), a('6')])
    expect(p.lead?.id).toBe('3')
    expect(p.secondary.map((x) => x.id)).toEqual(['1', '2', '4'])
    expect(p.more.map((x) => x.id)).toEqual(['5', '6'])
  })
  it('falls back to the newest story when none is flagged', () => {
    expect(frontPage([a('1'), a('2')]).lead?.id).toBe('1')
  })
  it('handles an empty edition', () => {
    expect(frontPage([]).lead).toBeNull()
  })
})

describe('paragraphs', () => {
  it('splits on blank lines and drops empties', () => {
    expect(paragraphs('Uno.\n\nDue.\n  \nTre.\n\n')).toEqual(['Uno.', 'Due.', 'Tre.'])
  })
})
