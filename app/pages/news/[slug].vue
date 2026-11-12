<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug))
const { data: a, status, error } = useArticle(slug)

watch(error, (e) => { if (e) showError(createError({ statusCode: e.statusCode ?? 404, statusMessage: e.statusMessage, fatal: true })) }, { immediate: true })
useHead({ title: () => (a.value ? `${a.value.title} · La Gazzetta Rall` : 'La Gazzetta Rall') })
</script>

<template>
  <div class="page">
    <NuxtLink to="/news" class="muted back">← Prima pagina</NuxtLink>
    <div class="paper grain">
      <NewsMasthead compact />
      <SkeletonBlock v-if="status === 'pending' && !a" size="hero" />
      <article v-else-if="a" class="art">
        <p v-if="a.kicker" class="kicker">{{ a.kicker }}</p>
        <h1 class="display">{{ a.title }}</h1>
        <p v-if="a.summary" class="sum">{{ a.summary }}</p>
        <p class="by">
          <span v-if="a.author_name">di {{ a.author_name }} · </span>
          <time v-if="a.published_at" :datetime="a.published_at">{{ formatDay(a.published_at) }}</time>
          <span v-else> · bozza</span>
        </p>
        <div class="body">
          <p v-for="(p, i) in paragraphs(a.body)" :key="i" :class="{ first: i === 0 }">{{ p }}</p>
        </div>
        <NuxtLink v-if="a.match" :to="`/matches/${a.match.id}`" class="matchlink">
          Rall Venezia vs {{ a.match.opponent?.name }} — vai alla partita →
        </NuxtLink>
      </article>
    </div>
  </div>
</template>

<style scoped>
.back { display: inline-block; margin-bottom: var(--space-4); text-decoration: none; min-height: 44px; line-height: 44px; }
.paper { background: var(--paper); color: var(--paper-ink); padding: var(--space-5); border-radius: var(--r-s); display: grid; gap: var(--space-5); }
.art { display: grid; gap: var(--space-3); max-width: 1000px; }
.kicker { font: 600 var(--fs-cap)/1.2 var(--font-ui); letter-spacing: .12em; text-transform: uppercase; color: var(--paper-accent); }
h1 { font-size: clamp(36px, 8vw, 72px); line-height: 1; }
.sum { font: 400 var(--fs-h3)/1.4 var(--font-serif); color: var(--paper-muted); }
.by { font: 600 var(--fs-cap)/1 var(--font-ui); letter-spacing: .08em; text-transform: uppercase; color: var(--paper-muted); padding: var(--space-3) 0; border-top: 1px solid var(--paper-rule); border-bottom: 1px solid var(--paper-rule); }
.body { font: 400 var(--fs-body)/1.65 var(--font-serif); display: grid; gap: var(--space-4); hyphens: auto; }
.body .first::first-letter { font: 400 4.4em/.8 var(--font-display); float: left; padding: .06em .1em 0 0; color: var(--paper-accent); }
.matchlink { font: 600 var(--fs-sm)/1.4 var(--font-ui); color: var(--paper-accent); text-decoration: none; min-height: 44px; display: inline-flex; align-items: center; }
.matchlink:hover { text-decoration: underline; }
@media (min-width: 701px) { .paper { padding: var(--space-6); } }
@media (min-width: 1051px) { .body { display: block; column-count: 2; column-gap: var(--space-6); column-rule: 1px solid var(--paper-rule); } .body p { margin: 0 0 var(--space-4); break-inside: avoid-column; } }
</style>
