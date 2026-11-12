<script setup lang="ts">
import type { PlayerRow } from '~/types/domain'
const props = defineProps<{ player: PlayerRow }>()
const position = computed(() => (props.player.position ? POSITION_LABELS[props.player.position] : null))
</script>

<template>
  <NuxtLink :to="`/team/${player.slug}`" class="card">
    <PlayerPortrait class="ph" :first="player.first_name" :last="player.last_name" :number="player.shirt_number" :photo-path="player.photo_path" />
    <div class="info">
      <p class="eyebrow pos">{{ [position, player.is_captain ? 'Capitano' : null].filter(Boolean).join(' · ') }}</p>
      <h3 class="display">{{ player.first_name }} <br>{{ player.last_name }}</h3>
      <p v-if="player.nickname" class="muted nick">“{{ player.nickname }}”</p>
    </div>
    <span v-if="player.is_captain" class="cap" aria-label="Capitano">C</span>
    <span class="bar" aria-hidden="true" />
  </NuxtLink>
</template>

<style scoped>
.card { position: relative; display: grid; align-content: start; text-decoration: none; color: inherit; border: 1px solid var(--rv-line); border-radius: var(--r-card); overflow: hidden; background: var(--rv-surface); transition: border-color var(--dur) var(--ease-standard), transform 400ms var(--ease-out), box-shadow 400ms var(--ease-out); }
.info { display: grid; gap: var(--space-1); padding: var(--space-3) var(--space-4) var(--space-4); position: relative; z-index: 3; }
h3 { font-size: var(--fs-h2); line-height: .95; }
.nick { font-size: var(--fs-sm); }
.pos { color: var(--rv-orange); }
.cap { position: absolute; z-index: 4; top: var(--space-3); right: var(--space-3); width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: var(--rv-gold); color: var(--rv-black); font: 700 var(--fs-sm)/1 var(--font-ui); }
.bar { position: absolute; left: 0; bottom: 0; height: 3px; width: 100%; background: var(--rv-orange); transform: scaleX(0); transform-origin: left; transition: transform 500ms var(--ease-out); }
@media (hover: hover) {
  .card:hover { border-color: var(--rv-orange); transform: translateY(-4px); box-shadow: 0 18px 40px rgb(0 0 0 / .5); }
  .card:hover .bar { transform: scaleX(1); }
  .card:hover :deep(.shot.in) { transform: translateY(-2%) scale(1.05); }
}
</style>
