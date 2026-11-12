<script setup lang="ts">
const goals = useRanking('goals', 1)
const assists = useRanking('assists', 1)
const mvps = useRanking('mvps', 1)
const tops = computed(() => [
  { label: 'Capocannoniere', row: goals.rows.value[0], unit: 'gol', gold: false },
  { label: 'Re degli assist', row: assists.rows.value[0], unit: 'assist', gold: false },
  { label: 'MVP', row: mvps.rows.value[0], unit: 'volte', gold: true },
].filter((t) => t.row))
</script>

<template>
  <WidgetFrame title="Migliori" :loading="goals.status.value === 'pending' && !tops.length">
    <div v-if="tops.length" class="tops">
      <NuxtLink v-for="t in tops" :key="t.label" :to="`/team/${t.row!.player.slug}`" class="top" :class="{ gold: t.gold }">
        <PlayerPortrait class="av" :first="t.row!.player.first_name" :last="t.row!.player.last_name" :number="t.row!.player.shirt_number" :photo-path="t.row!.player.photo_path" variant="thumb" />
        <div class="txt">
          <p class="eyebrow">{{ t.label }}</p>
          <StatCard class="sc" label="" :value="t.row!.value" />
          <p class="who">{{ fullName(t.row!.player) }} <span class="muted">· {{ t.unit }}</span></p>
        </div>
      </NuxtLink>
    </div>
    <p v-else class="muted">Le classifiche si accendono dopo la prima partita.</p>
  </WidgetFrame>
</template>

<style scoped>
.tops { display: grid; gap: var(--space-3); }
.top { display: grid; grid-template-columns: 76px 1fr; gap: var(--space-4); align-items: center; padding: var(--space-3); border: 1px solid var(--rv-line); border-radius: var(--r-card); background: var(--rv-surface-2); text-decoration: none; color: inherit; transition: border-color var(--dur) var(--ease-standard), transform 300ms var(--ease-out); }
.av { width: 76px; border: 2px solid var(--rv-orange); }
.gold .av { border-color: var(--rv-gold); box-shadow: 0 0 22px rgb(212 175 55 / .35); }
.gold .eyebrow { color: var(--rv-gold); }
.txt { display: grid; gap: 2px; min-width: 0; }
.sc :deep(.eyebrow) { display: none; }
.sc :deep(.v) { font-size: 44px; line-height: .9; }
.who { font-weight: var(--fw-ui); font-size: var(--fs-sm); overflow-wrap: anywhere; }
@media (hover: hover) { .top:hover { border-color: var(--rv-orange); transform: translateX(3px); } }
</style>
