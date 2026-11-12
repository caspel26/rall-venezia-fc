<script setup lang="ts">
import type { PlayerRow } from '~/types/domain'
const props = defineProps<{ player: PlayerRow }>()
const position = computed(() => (props.player.position ? POSITION_LABELS[props.player.position] : null))
</script>

<template>
  <NuxtLink :to="`/team/${player.slug}`" class="card">
    <PlayerPortrait :first="player.first_name" :last="player.last_name" :number="player.shirt_number"
      :photo-path="player.photo_path" />
    <div class="info">
      <p class="no display tabular">{{ player.shirt_number != null ? `#${player.shirt_number}` : '' }}</p>
      <h3 class="display">{{ fullName(player) }}</h3>
      <p v-if="player.nickname" class="muted nick">“{{ player.nickname }}”</p>
      <p class="eyebrow">{{ [position, player.is_captain ? 'Capitano' : null].filter(Boolean).join(' · ') }}</p>
    </div>
  </NuxtLink>
</template>

<style scoped>
.card { display: grid; align-content: start; text-decoration: none; color: inherit; border: 1px solid var(--rv-line); border-radius: var(--r-card); overflow: hidden; background: var(--rv-surface); transition: border-color var(--dur) var(--ease-standard); }
.card:hover { border-color: var(--rv-orange); }
.info { display: grid; gap: var(--space-1); padding: var(--space-3) var(--space-4) var(--space-4); }
.no { color: var(--rv-orange); font-size: var(--fs-h3); min-height: 1.4em; }
h3 { font-size: var(--fs-h3); line-height: 1.05; }
.nick { font-size: var(--fs-sm); }
@media (hover: hover) { .card:hover :deep(.portrait) { filter: brightness(1.1); } }
</style>
