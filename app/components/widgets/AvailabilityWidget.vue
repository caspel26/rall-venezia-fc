<script setup lang="ts">
const { data, status, refresh } = useNextMatch()
const { data: squad } = useSquad()
const byStatus = computed(() => new Map((data.value?.answers ?? []).map((a) => [a.playerId, a.status])))
const ORDER = { available: 0, maybe: 1, unavailable: 2, none: 3 } as const
const faces = computed(() => [...(squad.value ?? [])].map((p) => ({ p, s: (byStatus.value.get(p.id) ?? 'none') as keyof typeof ORDER }))
  .sort((a, b) => ORDER[a.s] - ORDER[b.s] || (a.p.shirt_number ?? 999) - (b.p.shirt_number ?? 999)))
const LABEL: Record<string, string> = { available: 'ci sono', maybe: 'forse', unavailable: 'non ci sono', none: 'nessuna risposta' }
</script>

<template>
  <WidgetFrame v-if="data || status === 'pending'" title="Chi c’è" icon="users-check" :loading="status === 'pending' && data === undefined">
    <template v-if="data">
      <ul class="faces" aria-label="Disponibilità della squadra">
        <li v-for="f in faces" :key="f.p.id">
          <NuxtLink :to="`/team/${f.p.slug}`" class="face">
            <PlayerAvatar :first="f.p.first_name" :last="f.p.last_name" :photo-path="f.p.photo_path" :size="56" :status="f.s" />
            <span class="ln">{{ f.p.last_name }}</span>
            <span class="sr-only">: {{ LABEL[f.s] }}</span>
          </NuxtLink>
        </li>
      </ul>
      <AvailabilitySummary :counts="data.counts" />
      <AvailabilitySelector v-if="data.myPlayerId" :match-id="data.match.id" :current="data.myAnswer" @saved="refresh()" />
    </template>
  </WidgetFrame>
</template>

<style scoped>
.faces { list-style: none; margin: 0; padding: 4px; display: grid; grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); gap: 14px 8px; }
.face { display: grid; justify-items: center; gap: 8px; text-decoration: none; color: inherit; border-radius: 12px; }
.face:focus-visible { outline: 2px solid var(--rv-orange); outline-offset: 4px; }
.ln { font: 600 12px/1.1 var(--font-ui); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
@media (max-width: 700px) { .faces :deep(.av) { --s: 48px !important; } }
</style>
