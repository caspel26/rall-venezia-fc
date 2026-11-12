<script setup lang="ts">
const { data, status } = useTeamRecord()
const cells = computed(() => data.value ? [
  { label: 'Giocate', v: data.value.played }, { label: 'Vinte', v: data.value.wins },
  { label: 'Pareggiate', v: data.value.draws }, { label: 'Perse', v: data.value.losses },
] : [])
const diff = computed(() => (data.value?.goal_difference ?? 0))
</script>

<template>
  <WidgetFrame v-if="data || status === 'pending'" :title="`Stagione ${data?.season ?? ''}`.trim()" to="/stats" link-label="Tutte le stats" :loading="status === 'pending' && !data">
    <dl v-if="data" class="rec">
      <div v-for="c in cells" :key="c.label"><dt>{{ c.label }}</dt><dd class="display tabular">{{ c.v }}</dd></div>
    </dl>
    <p v-if="data" class="muted gd">Gol {{ data.goals_for }}–{{ data.goals_against }} · differenza <strong>{{ diff > 0 ? `+${diff}` : diff }}</strong></p>
  </WidgetFrame>
</template>

<style scoped>
.rec { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-2); margin: 0; }
dt { font-size: var(--fs-cap); color: var(--rv-muted); font-weight: var(--fw-ui); }
dd { margin: 0; font-size: var(--fs-h1); }
.gd { font-size: var(--fs-sm); }
</style>
