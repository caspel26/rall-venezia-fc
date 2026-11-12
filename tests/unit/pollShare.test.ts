import { describe, expect, it } from 'vitest'
import { pollShareText, whatsappLink } from '../../app/utils/pollShare'

describe('pollShareText', () => {
  const poll = { week_start: '2026-11-16', closes_at: '2026-11-20T19:00:00.000Z' }
  it('names the week, the link and the deadline', () => {
    const t = pollShareText(poll, 'https://club.example/clubhouse/poll')
    expect(t).toContain('16–20 novembre')
    expect(t).toContain('https://club.example/clubhouse/poll')
    expect(t).toContain('venerdì alle 20:00')
    expect(t).toContain('più di uno')
  })
  it('spans two months when the week does', () => {
    expect(pollShareText({ week_start: '2026-11-30', closes_at: '2026-12-04T19:00:00.000Z' }, 'u')).toContain('30 novembre – 4 dicembre')
  })
})

describe('whatsappLink', () => {
  it('encodes the message for wa.me', () => {
    expect(whatsappLink('a b\nc')).toBe('https://wa.me/?text=a%20b%0Ac')
  })
})
