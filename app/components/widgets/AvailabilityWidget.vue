<script setup lang="ts">
const { data, status } = useNextMatch()
</script>

<template>
  <WidgetFrame v-if="data || status === 'pending'" title="Disponibilità" :loading="status === 'pending' && data === undefined">
    <template v-if="data">
      <AvailabilitySelector v-if="data.myPlayerId" :match-id="data.match.id" :current="data.myAnswer" />
      <AvailabilitySummary :counts="data.counts" />
    </template>
  </WidgetFrame>
</template>
