<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug))
const { data: a, status, error } = useArticle(slug)
const { data: others } = useNews(8)

watch(error, (e) => { if (e) showError(createError({ statusCode: e.statusCode ?? 404, statusMessage: e.statusMessage, fatal: true })) }, { immediate: true })
useHead({ title: () => (a.value ? `${a.value.title} · Gazzetta` : 'Gazzetta · Rall Venezia') })

const category = computed(() => (a.value ? newsCategory(a.value) : 'club'))
const more = computed(() => (others.value ?? []).filter((x) => x.slug !== slug.value).slice(0, 3))
const initials = computed(() => (a.value?.author_name ?? 'RV').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase())
</script>

<template>
  <div class="page">
    <div class="bar">
      <NuxtLink to="/news" class="backbtn" aria-label="Torna alle notizie"><AppIcon name="arrow-left" :size="20" /></NuxtLink>
      <NewsChip v-if="a" :category="category" />
    </div>

    <SkeletonBlock v-if="status === 'pending' && !a" size="hero" />
    <article v-else-if="a" class="art">
      <header class="hero">
        <NewsCover class="cov" :path="a.cover_path" :category="category" :alt="a.title" />
        <div class="veil" aria-hidden="true" />
        <div class="ttl">
          <p v-if="a.kicker" class="eyebrow k intro">{{ a.kicker }}</p>
          <h1 class="display intro d1">{{ a.title }}</h1>
        </div>
      </header>

      <div class="col">
        <p class="meta">
          <span class="who"><span class="ini">{{ initials }}</span>{{ a.author_name ? `di ${a.author_name}` : 'Redazione' }}</span>
          <span v-if="a.published_at" class="m"><AppIcon name="calendar" :size="14" /><time :datetime="a.published_at">{{ formatDay(a.published_at) }}</time></span>
          <span class="m"><AppIcon name="clock" :size="14" />{{ readingMinutes(a.body) }} min</span>
        </p>
        <p v-if="a.summary" class="stand">{{ a.summary }}</p>
        <div class="body"><p v-for="(p, i) in paragraphs(a.body)" :key="i">{{ p }}</p></div>

        <div class="actions">
          <NuxtLink v-if="a.match" :to="`/matches/${a.match.id}`" class="action lift">
            <span class="tile"><AppIcon name="whistle" :size="22" /></span>
            <span class="tx"><strong>Rall Venezia vs {{ a.match.opponent?.name }}</strong><small>Vai alla partita</small></span>
            <AppIcon name="chevron-right" :size="20" />
          </NuxtLink>
          <a v-if="a.external_url?.startsWith('https://')" :href="a.external_url" class="action lift" target="_blank" rel="noopener noreferrer">
            <span class="tile"><AppIcon name="instagram" :size="22" /></span>
            <span class="tx"><strong>Guarda il post</strong><small>Su Instagram</small></span>
            <AppIcon name="external" :size="18" />
          </a>
        </div>
      </div>

      <section v-if="more.length" class="more" aria-label="Altre notizie">
        <SectionHeader title="Altre notizie" to="/news" link-label="Tutte" />
        <div class="rail">
          <NewsCard v-for="o in more" :key="o.id" :slug="o.slug" :cover="o.cover_path" :category="newsCategory(o)" :kicker="o.kicker" :title="o.title" :summary="o.summary"
            :at="o.published_at" :minutes="readingMinutes(o.body)" />
        </div>
      </section>
    </article>
  </div>
</template>

<style scoped>
.bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.backbtn { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: var(--rv-glass); box-shadow: inset 0 0 0 1px var(--rv-line-strong); color: var(--rv-cream); transition: scale 240ms var(--ease-spring), background var(--dur) var(--ease-standard); }
.backbtn:hover { background: var(--rv-orange-soft); scale: 1.08; }
.hero { position: relative; display: grid; border-radius: var(--r-panel); overflow: hidden; }
.cov { aspect-ratio: 4 / 3; }
.veil { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 35%, rgb(11 11 9 / .55) 60%, rgb(11 11 9 / .95) 100%); pointer-events: none; }
.ttl { position: absolute; left: 0; right: 0; bottom: 0; padding: 20px; display: grid; gap: 8px; }
.k { color: var(--rv-orange); }
h1 { font-size: clamp(36px, 5vw, 84px); line-height: .95; max-width: 20ch; }
.col { max-width: 68ch; margin: 24px auto 0; display: grid; gap: 20px; }
.meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 18px; font-size: 14px; color: var(--rv-muted); }
.who { display: inline-flex; align-items: center; gap: 10px; font-weight: 600; color: var(--rv-cream); }
.ini { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: var(--rv-orange-soft); color: var(--rv-orange); font-size: 12px; font-weight: 700; }
.m { display: inline-flex; align-items: center; gap: 6px; }
.m svg { color: var(--rv-orange); }
.stand { font-size: var(--fs-lead); line-height: 1.5; font-weight: 600; color: var(--rv-cream); border-left: 2px solid var(--rv-orange-line); padding-left: 16px; }
.body { display: grid; gap: 20px; font-size: var(--fs-article); line-height: 1.7; color: var(--rv-cream-2); }
.actions { display: grid; gap: 10px; margin-top: 8px; }
.action { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 14px; min-height: 72px; padding: 12px 16px; border-radius: 14px; background: var(--rv-surface-2); box-shadow: inset 0 0 0 1px var(--rv-line); text-decoration: none; color: inherit; }
.tile { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; background: var(--rv-orange-soft); color: var(--rv-orange); }
.tx { display: grid; }
.tx small { color: var(--rv-muted); font-size: 13px; }
.more { margin-top: 48px; }
.rail { display: grid; grid-auto-flow: column; grid-auto-columns: 80%; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 8px; }
.rail > * { scroll-snap-align: start; }
@media (min-width: 701px) {
  .cov { aspect-ratio: 21 / 9; }
  .ttl { padding: 40px; }
  .rail { grid-auto-flow: row; grid-template-columns: repeat(3, 1fr); grid-auto-columns: auto; overflow: visible; gap: 24px; }
}
@media (max-width: 700px) {
  .hero { margin-inline: calc(var(--gutter) * -1); border-radius: 0; }
  h1 { font-size: 40px; }
}
</style>
