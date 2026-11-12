import type { Database } from '~/types/database'

export function useNews(limit = 20) {
  const client = useSupabaseClient<Database>()
  return useAsyncData(`news-${limit}`, async () => {
    const { data } = await client.from('news_articles')
      .select('id, slug, kicker, title, summary, is_lead, published_at, cover_path')
      .not('published_at', 'is', null).lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false }).limit(limit)
    return data ?? []
  }, { lazy: true })
}

export function useArticle(slug: MaybeRef<string>) {
  const client = useSupabaseClient<Database>()
  return useAsyncData(`article-${toValue(slug)}`, async () => {
    const { data, error } = await client.from('news_articles')
      .select('*, match:matches(id, kickoff_at, opponent:opponents(name))')
      .eq('slug', toValue(slug)).maybeSingle()
    if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Articolo non trovato' })
    return data
  }, { lazy: true })
}

/** Lead story first, then the rest newest-first. Pure so it is unit-tested. */
export function frontPage<T extends { is_lead: boolean; published_at: string | null }>(list: T[]) {
  const lead = list.find((a) => a.is_lead) ?? list[0] ?? null
  const rest = list.filter((a) => a !== lead)
  return { lead, secondary: rest.slice(0, 3), more: rest.slice(3) }
}

/** Body paragraphs: plain text split on blank lines (never HTML). */
export const paragraphs = (body: string) => body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
