import { slugify } from '~/utils/slug'

// Official crests live in the private `player-photos` bucket as teams/<slug>.png (never in git). One signed URL per
// team per page load, shared by every badge; null when there is no crest for that team.
const cache = new Map<string, Promise<string | null>>()

export function useTeamLogo(name: Ref<string> | string) {
  const client = useSupabaseClient()
  const url = ref<string | null>(null)
  onMounted(() => {
    const slug = slugify(toValue(name))
    if (!slug) return
    if (!cache.has(slug)) {
      cache.set(slug, client.storage.from('player-photos').createSignedUrl(`teams/${slug}.png`, 3600).then(({ data }) => data?.signedUrl ?? null))
    }
    cache.get(slug)!.then((u) => { url.value = u })
  })
  return url
}
