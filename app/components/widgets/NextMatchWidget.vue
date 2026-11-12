<script setup lang="ts">
const { data, status } = useNextMatch()
</script>

<template>
  <WidgetFrame title="Prossima partita" bare :loading="status === 'pending' && data === undefined">
    <MatchCard v-if="data" variant="hero" :to="`/matches/${data.match.id}`" :opponent="data.match.opponent?.name ?? ''"
      :short="data.match.opponent?.short_name" :is-home="data.match.is_home" :kickoff-at="data.match.kickoff_at"
      :venue="data.match.venue" :competition="data.match.competition?.name" :status="data.match.status"
      :rv="data.match.rv_score" :opp="data.match.opp_score" />
    <EmptyState v-else title="Nessuna partita in programma" text="Per una volta possiamo riposare." />
  </WidgetFrame>
</template>
