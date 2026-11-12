import { describe, expect, it } from 'vitest'
import { captionToArticle, isAllowedImageHost } from '../../server/utils/instagramCaption'

describe('captionToArticle', () => {
  it('uses the first sentence as headline and the rest as body, dropping the hashtag footer', () => {
    const a = captionToArticle('Tre punti pesantissimi! Vittoria 10-5 contro il Monza.\nMVP Marigliano.\n\n#rallvenezia #futsal @monza')
    expect(a.title).toBe('Tre punti pesantissimi!')
    expect(a.body).toBe('Vittoria 10-5 contro il Monza.\nMVP Marigliano.')
    expect(a.summary).toBe('Vittoria 10-5 contro il Monza.')
  })
  it('truncates very long first lines on a word boundary', () => {
    const a = captionToArticle(`${'parola '.repeat(30)}fine`)
    expect(a.title.length).toBeLessThanOrEqual(90)
    expect(a.title.endsWith('…')).toBe(true)
  })
  it('keeps a single short line as both headline and body', () => {
    const a = captionToArticle('Domani si gioca')
    expect(a.title).toBe('Domani si gioca')
    expect(a.body).toBe('Domani si gioca')
    expect(a.summary).toBeNull()
  })
  it('falls back for empty or hashtag-only captions', () => {
    expect(captionToArticle(null).title).toBe('Dal profilo Instagram')
    expect(captionToArticle('#a #b').title).toBe('Dal profilo Instagram')
  })
})

describe('isAllowedImageHost', () => {
  const base = 'https://graph.instagram.com'
  it('allows Instagram CDNs over https only', () => {
    expect(isAllowedImageHost('https://scontent-fra5-1.cdninstagram.com/v/x.jpg', base)).toBe(true)
    expect(isAllowedImageHost('https://scontent.xx.fbcdn.net/v/x.jpg', base)).toBe(true)
    expect(isAllowedImageHost('http://scontent.cdninstagram.com/x.jpg', base)).toBe(false)
  })
  it('refuses other hosts, including lookalikes and internal addresses', () => {
    expect(isAllowedImageHost('https://evil.com/cdninstagram.com.jpg', base)).toBe(false)
    expect(isAllowedImageHost('https://notcdninstagram.com/x.jpg', base)).toBe(false)
    expect(isAllowedImageHost('http://169.254.169.254/latest', base)).toBe(false)
  })
  it('allows the mock origin only when the API base is overridden', () => {
    expect(isAllowedImageHost('http://127.0.0.1:3199/img/1.png', 'http://127.0.0.1:3199')).toBe(true)
    expect(isAllowedImageHost('http://127.0.0.1:3199/img/1.png', base)).toBe(false)
  })
})
