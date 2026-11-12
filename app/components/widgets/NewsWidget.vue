<script setup lang="ts">
const { data, status } = useNews(3)
</script>

<template>
  <WidgetFrame v-if="data?.length || status === 'pending'" title="Gazzetta" icon="news" to="/news" link-label="Tutte le notizie" :loading="status === 'pending' && !data">
    <div v-if="data?.length" class="stack">
      <NewsCard v-if="data[0]!.cover_path" :slug="data[0]!.slug" :cover="data[0]!.cover_path" :category="newsCategory(data[0]!)" :kicker="data[0]!.kicker" :title="data[0]!.title"
        :summary="data[0]!.summary" :at="data[0]!.published_at" :minutes="readingMinutes(data[0]!.body)" />
      <NewsCard v-for="a in (data[0]!.cover_path ? data.slice(1) : data)" :key="a.id" variant="row" :slug="a.slug" :cover="a.cover_path" :category="newsCategory(a)" :title="a.title"
        :at="a.published_at" :minutes="readingMinutes(a.body)" />
    </div>
  </WidgetFrame>
</template>

<style scoped>
.stack { display: grid; gap: 12px; }
</style>
