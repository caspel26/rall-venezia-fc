export type PhotoVariant = 'portrait' | 'half' | 'hero' | 'thumb'

/**
 * Player images follow `<slug>/portrait.webp`, `<slug>/hero.webp`, `<slug>/thumb.webp` in the private
 * `player-photos` bucket. A path that is not of that shape (a single photo uploaded by hand in the admin)
 * is used for every variant.
 */
export function playerAsset(path: string | null | undefined, variant: PhotoVariant): string | null {
  if (!path) return null
  return /\/portrait\.webp$/.test(path) ? path.replace(/portrait\.webp$/, `${variant}.webp`) : path
}
