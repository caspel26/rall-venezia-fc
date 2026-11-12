<script setup lang="ts">
const { data, status } = useNews(1)
const a = computed(() => data.value?.[0])
</script>

<template>
  <WidgetFrame v-if="a || status === 'pending'" title="Dalla Gazzetta" to="/news" link-label="Prima pagina" bare :loading="status === 'pending' && !data">
    <div v-if="a" class="paper grain">
      <p class="mast display">La Gazzetta Rall</p>
      <NewsStory size="mid" :slug="a.slug" :kicker="a.kicker" :title="a.title" :summary="a.summary" :at="a.published_at" />
      <NuxtLink to="/news" class="all">Prima pagina →</NuxtLink>
    </div>
  </WidgetFrame>
</template>

<style scoped>
.paper { display: grid; gap: var(--space-3); padding: var(--space-5); background: var(--paper); color: var(--paper-ink); border-radius: var(--r-s); }
.all { font: 600 var(--fs-sm)/1 var(--font-ui); color: var(--paper-accent); text-decoration: none; min-height: 44px; display: inline-flex; align-items: center; }
.mast { font-size: var(--fs-h3); border-bottom: 2px solid var(--paper-rule); padding-bottom: var(--space-2); }
</style>
