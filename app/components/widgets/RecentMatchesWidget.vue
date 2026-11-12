<script setup lang="ts">
import { formOf } from '~/utils/results'
const { data, status } = useRecentMatches()
const form = computed(() => formOf([...(data.value ?? [])].reverse()))
</script>

<template>
  <WidgetFrame v-if="data?.length || status === 'pending'" title="Ultime 5 partite" to="/matches" :loading="status === 'pending' && !data">
    <FormStrip :form="form" />
    <ul class="rows" aria-label="Ultime partite">
      <li v-for="m in data" :key="m.id">
        <MatchCard :to="`/matches/${m.id}`" :opponent="m.opponent?.name ?? ''" :short="m.opponent?.short_name" :is-home="m.is_home"
          :kickoff-at="m.kickoff_at" :status="m.status" :rv="m.rv_score" :opp="m.opp_score" />
      </li>
    </ul>
  </WidgetFrame>
</template>

<style scoped>
.rows { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-2); }
</style>
