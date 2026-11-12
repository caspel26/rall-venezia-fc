<script setup lang="ts">
const { data } = useLatestAnnouncement()
</script>

<template>
  <WidgetFrame v-if="data" title="Ultimo annuncio" bare>
    <AnnouncementCard :title="data.title" :body="data.body" :at="data.published_at" :pinned="data.pinned" />
  </WidgetFrame>
</template>
