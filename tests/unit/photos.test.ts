import { describe, expect, it } from 'vitest'
import { playerAsset } from '../../app/utils/photos'

describe('playerAsset', () => {
  it('maps the standard folder layout to each variant', () => {
    expect(playerAsset('daniele-nappo/portrait.webp', 'thumb')).toBe('daniele-nappo/thumb.webp')
    expect(playerAsset('daniele-nappo/portrait.webp', 'hero')).toBe('daniele-nappo/hero.webp')
    expect(playerAsset('daniele-nappo/portrait.webp', 'portrait')).toBe('daniele-nappo/portrait.webp')
  })
  it('uses a hand-uploaded single photo for every variant', () => {
    expect(playerAsset('x/1700000000.jpg', 'thumb')).toBe('x/1700000000.jpg')
  })
  it('is null without a path', () => {
    expect(playerAsset(null, 'hero')).toBeNull()
  })
})
