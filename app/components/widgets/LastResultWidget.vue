<script setup lang="ts">
const { data, status } = useRecentMatches()
const last = computed(() => data.value?.[0])
const mvp = computed(() => {
  const p = last.value?.mvp_awards?.[0]?.player
  return p ? fullName(p) : undefined
})
</script>

<template>
  <WidgetFrame v-if="last || status === 'pending'" title="Ultimo risultato" bare :loading="status === 'pending' && !data">
    <div v-if="last" class="panel last grain">
      <p class="eyebrow">Ultimo risultato</p>
      <ScoreBoard :rv="last.rv_score" :opp="last.opp_score" :is-home="last.is_home" :opponent="last.opponent?.name ?? ''" />
      <div class="meta">
        <MVPBadge v-if="mvp" :name="mvp" />
        <NuxtLink :to="`/matches/${last.id}`" class="muted">Vai alla partita</NuxtLink>
      </div>
    </div>
  </WidgetFrame>
  <EmptyState v-else-if="status === 'success'" title="Nessun risultato ancora" text="Il primo tre punti è in arrivo." />
</template>

<style scoped>
.last { display: grid; gap: var(--space-4); }
.meta { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-4); }
</style>
