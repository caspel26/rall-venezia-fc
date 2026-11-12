<script setup lang="ts">
const { data, status, refresh } = useNextMatch()
const { data: squad } = useSquad()
const byStatus = computed(() => new Map((data.value?.answers ?? []).map((a) => [a.playerId, a.status])))
const ring = (id: string) => byStatus.value.get(id) ?? 'none'
const LABEL: Record<string, string> = { available: 'ci sono', maybe: 'forse', unavailable: 'non ci sono', none: 'nessuna risposta' }
</script>

<template>
  <WidgetFrame v-if="data || status === 'pending'" title="Chi c’è" :loading="status === 'pending' && data === undefined">
    <template v-if="data">
      <ul class="faces" aria-label="Disponibilità della squadra">
        <li v-for="p in squad" :key="p.id" :class="`s-${ring(p.id)}`" :title="`${fullName(p)}: ${LABEL[ring(p.id)]}`">
          <PlayerPortrait class="face" :first="p.first_name" :last="p.last_name" :number="p.shirt_number" :photo-path="p.photo_path" variant="thumb" />
          <span class="sr-only">{{ fullName(p) }}: {{ LABEL[ring(p.id)] }}</span>
        </li>
      </ul>
      <AvailabilitySummary :counts="data.counts" />
      <AvailabilitySelector v-if="data.myPlayerId" :match-id="data.match.id" :current="data.myAnswer" @saved="refresh()" />
    </template>
  </WidgetFrame>
</template>

<style scoped>
.faces { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--space-2); }
.faces li { border-radius: 50%; padding: 3px; background: var(--rv-line); transition: transform 300ms var(--ease-out), background var(--dur) var(--ease-standard); }
.face { width: 46px; }
.s-available { background: var(--rv-green); }
.s-maybe { background: var(--rv-amber); }
.s-unavailable { background: var(--rv-red); }
.s-none :deep(.shot) { filter: grayscale(1) opacity(.55); }
@media (hover: hover) { .faces li:hover { transform: translateY(-3px) scale(1.08); } }
</style>
