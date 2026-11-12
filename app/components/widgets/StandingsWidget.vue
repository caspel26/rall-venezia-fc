<script setup lang="ts">
const { data, status } = useStandings()
// the top five, plus our own row if we are further down
const shown = computed(() => {
  const d = data.value
  if (!d) return []
  const top = d.rows.slice(0, 5)
  return d.us && d.us.position > 5 ? [...top, d.us] : top
})
</script>

<template>
  <WidgetFrame v-if="data?.rows.length || status === 'pending'" title="Classifica" icon="trophy" to="/stats?tab=league" link-label="Tutta" :loading="status === 'pending' && !data">
    <template v-if="data">
      <StandingsTable :rows="shown" />
      <p v-if="data.updated" class="muted upd">Aggiornata il {{ formatShortDay(data.updated) }}</p>
    </template>
  </WidgetFrame>
</template>

<style scoped>
.upd { font-size: var(--fs-sm); }
</style>
