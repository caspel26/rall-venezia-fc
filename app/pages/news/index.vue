<script setup lang="ts">
useHead({ title: 'La Gazzetta Rall · Rall Venezia' })
const { data, status } = useNews()
const page = computed(() => frontPage(data.value ?? []))
</script>

<template>
  <div class="page">
    <div class="paper grain">
      <h1 class="sr-only">La Gazzetta Rall, prima pagina</h1>
      <NewsMasthead />

      <SkeletonBlock v-if="status === 'pending' && !data" size="hero" />

      <template v-else-if="page.lead">
        <div class="front">
          <NewsStory v-reveal class="leadcol" size="lead" :slug="page.lead.slug" :cover="page.lead.cover_path" :kicker="page.lead.kicker" :title="page.lead.title"
            :summary="page.lead.summary" :at="page.lead.published_at" />
          <div v-if="page.secondary.length" class="side">
            <NewsStory v-for="(a, i) in page.secondary" :key="a.id" v-reveal="i + 1" size="mid" :slug="a.slug" :cover="a.cover_path" :kicker="a.kicker" :title="a.title"
              :summary="a.summary" :at="a.published_at" />
          </div>
        </div>
        <section v-if="page.more.length" class="more" aria-label="Archivio">
          <h2 class="rubrica">Edizioni precedenti</h2>
          <div class="cols">
            <NewsStory v-for="(a, i) in page.more" :key="a.id" v-reveal="i % 3" size="small" :slug="a.slug" :kicker="a.kicker" :title="a.title" :at="a.published_at" />
          </div>
        </section>
      </template>

      <p v-else class="empty">Nessuna notizia in edicola. La redazione è in ritiro.</p>
    </div>
  </div>
</template>

<style scoped>
.paper { background: var(--paper); color: var(--paper-ink); padding: var(--space-5); border-radius: var(--r-s); display: grid; gap: var(--space-5); }
.front { display: grid; gap: var(--space-5); }
.side { display: grid; gap: var(--space-5); }
.side > :deep(*) { border-top: 1px solid var(--paper-rule); padding-top: var(--space-4); }
.rubrica { font: 700 var(--fs-cap)/1 var(--font-ui); letter-spacing: .14em; text-transform: uppercase; border-top: 3px double var(--paper-rule); padding-top: var(--space-3); margin-bottom: var(--space-4); }
.cols { display: grid; gap: var(--space-4); }
.empty { font: italic 400 var(--fs-h3)/1.4 var(--font-serif); text-align: center; padding: var(--space-7) 0; }
@media (min-width: 701px) { .paper { padding: var(--space-6); } .cols { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1051px) {
  .front { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 0; }
  .leadcol { padding-right: var(--space-6); border-right: 1px solid var(--paper-rule); }
  .side { padding-left: var(--space-6); }
  .side > :deep(*:first-child) { border-top: 0; padding-top: 0; }
}
</style>
