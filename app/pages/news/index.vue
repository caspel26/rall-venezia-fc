<script setup lang="ts">
import type { IconName } from '~/components/AppIcon.vue'

useHead({ title: 'Gazzetta · Rall Venezia' })
const { data, status } = useNews(40)
const route = useRoute()
const router = useRouter()

const cat = computed({
  get: () => (['match', 'club', 'instagram'].includes(String(route.query.cat)) ? String(route.query.cat) : 'all'),
  set: (v) => router.replace({ query: v === 'all' ? {} : { cat: v } }),
})
const filters: { key: string; label: string; icon?: IconName }[] = [
  { key: 'all', label: 'Tutte' },
  { key: 'match', label: 'Partite', icon: 'whistle' },
  { key: 'club', label: 'Club', icon: 'megaphone' },
  { key: 'instagram', label: 'Instagram', icon: 'instagram' },
]
const list = computed(() => (data.value ?? []).filter((a) => cat.value === 'all' || newsCategory(a) === cat.value))
const page = computed(() => frontPage(list.value))
const grid = computed(() => page.value.secondary.concat(page.value.more.slice(0, 3)))
const more = computed(() => page.value.more.slice(3))
</script>

<template>
  <div class="page">
    <PageHero title="Notizie" lead="Partite, club e spogliatoio.">
      <span class="chip-i start intro"><AppIcon name="news" :size="14" />Gazzetta</span>
    </PageHero>

    <div class="filters" role="group" aria-label="Filtra per categoria">
      <button v-for="f in filters" :key="f.key" type="button" class="f" :aria-pressed="cat === f.key" @click="cat = f.key">
        <AppIcon v-if="f.icon" :name="f.icon" :size="16" />{{ f.label }}
      </button>
    </div>

    <Transition name="vanish" mode="out-in">
      <SkeletonBlock v-if="status === 'pending' && !data" key="s" size="hero" />
      <div v-else-if="page.lead" :key="`c-${cat}`" class="feed">
        <NewsCard class="lead-card intro" variant="lead" :slug="page.lead.slug" :cover="page.lead.cover_path" :category="newsCategory(page.lead)" :kicker="page.lead.kicker"
          :title="page.lead.title" :summary="page.lead.summary" :at="page.lead.published_at" :minutes="readingMinutes(page.lead.body)" />
        <div v-if="grid.length" class="grid">
          <NewsCard v-for="(a, i) in grid" :key="a.id" v-reveal="i % 3" :slug="a.slug" :cover="a.cover_path" :category="newsCategory(a)" :kicker="a.kicker" :title="a.title"
            :summary="a.summary" :at="a.published_at" :minutes="readingMinutes(a.body)" />
        </div>
        <template v-if="more.length">
          <SectionHeader title="Altre notizie" />
          <div class="rows">
            <NewsCard v-for="(a, i) in more" :key="a.id" v-reveal="i % 2" variant="row" :slug="a.slug" :cover="a.cover_path" :category="newsCategory(a)" :title="a.title"
              :at="a.published_at" :minutes="readingMinutes(a.body)" />
          </div>
        </template>
      </div>
      <EmptyState v-else key="e" title="Nessuna notizia" text="La redazione è in ritiro." />
    </Transition>
  </div>
</template>

<style scoped>
.filters { display: flex; gap: 8px; overflow-x: auto; padding: 2px 2px 14px; margin-bottom: 8px; scrollbar-width: none; }
.f { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 16px; border: 0; border-radius: var(--r-pill); background: var(--rv-surface-3); color: var(--rv-cream); font: 600 14px/1 var(--font-ui); cursor: pointer; white-space: nowrap; transition: background var(--dur) var(--ease-standard), color var(--dur) var(--ease-standard), scale 240ms var(--ease-spring); }
.f svg { color: var(--rv-orange); }
.f:active { scale: .96; }
.f[aria-pressed='true'] { background: var(--rv-orange); color: var(--rv-orange-ink); }
.f[aria-pressed='true'] svg { color: var(--rv-orange-ink); }
.f:focus-visible { outline: 2px solid var(--rv-orange); outline-offset: 2px; }
.feed { display: grid; gap: 24px; }
.grid { display: grid; gap: 16px; }
.rows { display: grid; gap: 12px; }
@media (min-width: 701px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1051px) { .grid { grid-template-columns: repeat(3, 1fr); gap: 24px; } .rows { grid-template-columns: repeat(2, 1fr); } }
</style>
