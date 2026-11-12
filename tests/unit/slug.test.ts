import { describe, expect, it } from 'vitest'
import { slugify } from '../../app/utils/slug'

describe('slugify', () => {
  it('lowercases, strips accents and joins with dashes', () => {
    expect(slugify('Daniele', 'Nappo')).toBe('daniele-nappo')
    expect(slugify('Niccolò', "D'Angelo")).toBe('niccolo-d-angelo')
  })
  it('trims stray separators', () => expect(slugify('  --Ro  ', 'Ssi!! ')).toBe('ro-ssi'))
})
