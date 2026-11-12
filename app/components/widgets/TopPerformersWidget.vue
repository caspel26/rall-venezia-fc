<script setup lang="ts">
const goals = useRanking('goals', 1)
const assists = useRanking('assists', 1)
const mvps = useRanking('mvps', 1)
const tops = computed(() => [
  { label: 'Capocannoniere', row: goals.rows.value[0] },
  { label: 'Assist', row: assists.rows.value[0] },
  { label: 'MVP', row: mvps.rows.value[0] },
].filter((t) => t.row))
</script>

<template>
  <WidgetFrame title="Migliori" :loading="goals.status.value === 'pending' && !tops.length">
    <div v-if="tops.length" class="tops">
      <StatCard v-for="t in tops" :key="t.label" :label="t.label" :value="t.row!.value" :sub="fullName(t.row!.player)" />
    </div>
    <p v-else class="muted">Le classifiche si accendono dopo la prima partita.</p>
  </WidgetFrame>
</template>

<style scoped>
.tops { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
</style>
