<script setup lang="ts">
import type { PlayerRow } from '~/types/domain'
const props = defineProps<{ player: PlayerRow }>()
const position = computed(() => (props.player.position ? POSITION_LABELS[props.player.position] : null))
</script>

<template>
  <NuxtLink v-tilt :to="`/team/${player.slug}`" class="person-card card">
    <PlayerPortrait :first="player.first_name" :last="player.last_name" :number="player.shirt_number" :photo-path="player.photo_path" />
    <span v-if="player.shirt_number != null" class="chip display tabular">#{{ player.shirt_number }}</span>
    <span v-if="player.is_captain" class="cap" aria-label="Capitano">C</span>
    <div class="info">
      <p v-if="position" class="eyebrow pos">{{ position }}</p>
      <h3 class="display"><span class="fn">{{ player.first_name }}</span> <span class="ln">{{ player.last_name }}</span></h3>
      <p v-if="player.nickname" class="nick">“{{ player.nickname }}”</p>
    </div>
    <span class="shine" aria-hidden="true" />
    <span class="accent-bar" aria-hidden="true" />
  </NuxtLink>
</template>

<style scoped>
.card { --stage-fade: var(--rv-surface); }
.card :deep(.portrait) { --ring-size: 96%; --ring-top: 2%; --spot-y: 26%; }
.chip { position: absolute; z-index: 4; top: var(--space-3); left: var(--space-3); padding: 4px 10px; border-radius: var(--r-pill); background: var(--rv-glass); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); font-size: 20px; line-height: 1.1; }
.cap { position: absolute; z-index: 4; top: var(--space-3); right: var(--space-3); width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: var(--rv-gold); color: var(--rv-black); font: 700 var(--fs-sm)/1 var(--font-ui); box-shadow: 0 0 0 3px rgb(11 11 9 / .6); }
.info { position: absolute; z-index: 3; left: 0; right: 0; bottom: 0; display: grid; gap: 2px; padding: 56px var(--space-4) var(--space-4); background: linear-gradient(180deg, transparent 0%, rgb(11 11 9 / .88) 52%, rgb(11 11 9 / .96) 100%); }
.pos { color: var(--rv-orange); }
h3 { display: grid; line-height: .9; }
.fn { font-size: 20px; color: var(--rv-cream-2); }
.ln { font-size: 32px; }
.nick { font-size: var(--fs-sm); color: var(--rv-muted); }
@media (max-width: 700px) { .ln { font-size: 26px; } .fn { font-size: 17px; } }
</style>
