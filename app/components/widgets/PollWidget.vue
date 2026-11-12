<script setup lang="ts">
const { data, status, refresh } = useWeeklyPoll()
const range = computed(() => {
  if (!data.value) return ''
  const a = pollDay(data.value.days[0]!.date); const b = pollDay(data.value.days[4]!.date)
  return `${a.num}–${b.num} ${b.month}`
})
const bestText = computed(() => {
  const d = data.value
  if (!d || !d.best.length) return 'Nessun voto ancora: scegli i giorni in cui ci sei.'
  return `Più votato: ${d.best.map((x) => pollDay(x).full.split(' ')[0]).join(' e ')} (${d.top})`
})
</script>

<template>
  <WidgetFrame v-if="data || status === 'pending'" title="Sondaggio della settimana" icon="calendar-check" to="/clubhouse/poll" link-label="Chi viene" :loading="status === 'pending' && data === undefined">
    <template v-if="data">
      <p class="when display"><span class="dash" aria-hidden="true" />{{ range }}</p>
      <PollVote :poll-id="data.poll.id" :days="data.days" :mine="data.mine" :best="data.best" :top="data.top" :can-vote="!!data.myPlayerId" @saved="refresh()" />
      <p class="best"><AppIcon name="users" :size="16" />{{ data.respondents }} {{ data.respondents === 1 ? 'risposta' : 'risposte' }} · {{ bestText }}</p>
    </template>
  </WidgetFrame>
</template>

<style scoped>
.when { display: flex; align-items: center; gap: 12px; font-size: 28px; line-height: 1; text-transform: capitalize; }
.dash { width: 28px; height: 3px; border-radius: 2px; background: var(--rv-orange); }
.best { display: flex; align-items: center; gap: 8px; font-size: var(--fs-sm); color: var(--rv-muted); }
</style>
