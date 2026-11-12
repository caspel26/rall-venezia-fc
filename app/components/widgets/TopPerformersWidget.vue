<script setup lang="ts">
import type { IconName } from '~/components/AppIcon.vue'
const goals = useRanking('goals', 1)
const assists = useRanking('assists', 1)
const mvps = useRanking('mvps', 1)
const tops = computed(() => ([
  { label: 'Capocannoniere', icon: 'ball' as IconName, row: goals.rows.value[0], unit: 'gol', gold: false },
  { label: 'Re degli assist', icon: 'assist' as IconName, row: assists.rows.value[0], unit: 'assist', gold: false },
  { label: 'MVP', icon: 'star' as IconName, row: mvps.rows.value[0], unit: 'volte', gold: true },
]).filter((t) => t.row))
</script>

<template>
  <WidgetFrame title="Migliori" icon="star" :loading="goals.status.value === 'pending' && !tops.length">
    <div v-if="tops.length" class="tops">
      <NuxtLink v-for="t in tops" :key="t.label" :to="`/team/${t.row!.player.slug}`" class="top lift" :class="{ gold: t.gold }">
        <span class="mini stage"><PlayerAvatar :first="t.row!.player.first_name" :last="t.row!.player.last_name" :photo-path="t.row!.player.photo_path" :size="64" :ring="t.gold ? 'gold' : 'orange'" /></span>
        <div class="txt">
          <span class="chip-i"><AppIcon :name="t.icon" :size="14" />{{ t.label }}</span>
          <StatCard class="sc" label="" :value="t.row!.value" />
          <p class="who">{{ fullName(t.row!.player) }}</p>
        </div>
      </NuxtLink>
    </div>
    <p v-else class="muted">Le classifiche si accendono dopo la prima partita.</p>
  </WidgetFrame>
</template>

<style scoped>
.tops { display: grid; gap: 10px; }
.top { display: grid; grid-template-columns: 96px 1fr; align-items: center; min-height: 96px; border-radius: 14px; overflow: hidden; background: var(--rv-surface-2); box-shadow: inset 0 0 0 1px var(--rv-line); text-decoration: none; color: inherit; }
.mini { --ring-size: 0; --spot-y: 40%; --stage-fade: transparent; align-self: stretch; display: grid; place-items: center; }
.mini::before, .mini::after { display: none; }
.gold { background: linear-gradient(90deg, var(--rv-gold-soft), var(--rv-surface-2) 70%); }
.gold .chip-i svg { color: var(--rv-gold); }
.txt { display: grid; gap: 2px; justify-items: start; padding: 10px 14px 10px 4px; min-width: 0; }
.sc :deep(.eyebrow) { display: none; }
.sc :deep(.v) { font-size: 40px; line-height: 1; }
.who { font: 600 14px/1.2 var(--font-ui); overflow-wrap: anywhere; }
</style>
