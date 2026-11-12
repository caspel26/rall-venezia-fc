import type { IconName } from '~/components/AppIcon.vue'

export type NewsCategory = 'instagram' | 'match' | 'club'

export const NEWS_CATEGORIES: Record<NewsCategory, { label: string; icon: IconName }> = {
  instagram: { label: 'Instagram', icon: 'instagram' },
  match: { label: 'Partita', icon: 'whistle' },
  club: { label: 'Club', icon: 'megaphone' },
}

/** An imported Instagram post, a match report (linked to a match) or a club note. */
export function newsCategory(a: { source?: string | null; match_id?: string | null }): NewsCategory {
  if (a.source === 'instagram') return 'instagram'
  return a.match_id ? 'match' : 'club'
}

/** Whole minutes at 200 words a minute, never less than one. */
export const readingMinutes = (body: string | null | undefined) =>
  Math.max(1, Math.round((body ?? '').trim().split(/\s+/).filter(Boolean).length / 200))
