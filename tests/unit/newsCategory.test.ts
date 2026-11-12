import { describe, expect, it } from 'vitest'
import { newsCategory, readingMinutes } from '../../app/utils/news'

describe('newsCategory', () => {
  it('Instagram imports win, then match reports, then club notes', () => {
    expect(newsCategory({ source: 'instagram', match_id: 'm1' })).toBe('instagram')
    expect(newsCategory({ source: 'manual', match_id: 'm1' })).toBe('match')
    expect(newsCategory({ source: 'manual', match_id: null })).toBe('club')
    expect(newsCategory({})).toBe('club')
  })
})

describe('readingMinutes', () => {
  it('is at least one minute and rounds at 200 words a minute', () => {
    expect(readingMinutes('poche parole')).toBe(1)
    expect(readingMinutes(Array(450).fill('parola').join(' '))).toBe(2)
    expect(readingMinutes('')).toBe(1)
  })
})
