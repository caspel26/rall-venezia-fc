<script setup lang="ts">
type Row = { id: string; team: string; points: number; position: number; is_us: boolean }
const props = defineProps<{ rows: Row[]; split?: boolean }>()
// two columns of ten, like the printed table, when there is room
const half = computed(() => Math.ceil(props.rows.length / 2))
</script>

<template>
  <ol class="table" :class="{ split }" :style="split ? { '--half': half } : undefined" aria-label="Classifica del campionato">
    <li v-for="r in rows" :key="r.id" class="r" :class="{ us: r.is_us }" :aria-current="r.is_us ? 'true' : undefined">
      <span class="pos display tabular">{{ r.position }}</span>
      <ClubLogo v-if="r.is_us" :size="36" class="logo" />
      <OpponentBadge v-else :name="r.team" size="sm" />
      <span class="team">{{ r.team }}<span v-if="r.is_us" class="sr-only"> (noi)</span></span>
      <span class="pts display tabular">{{ r.points }}<small>pt</small></span>
    </li>
  </ol>
</template>

<style scoped>
.table { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.r { display: grid; grid-template-columns: 28px 40px 1fr auto; align-items: center; gap: 12px; min-height: 52px; padding: 6px 14px; border-radius: 12px; background: var(--rv-surface-2); box-shadow: inset 0 0 0 1px var(--rv-line); }
.pos { font-size: 20px; color: var(--rv-muted); text-align: center; }
.team { font: 600 16px/1.2 var(--font-ui); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pts { font-size: 26px; line-height: 1; }
.pts small { font: 600 11px/1 var(--font-ui); letter-spacing: .1em; text-transform: uppercase; color: var(--rv-muted); margin-left: 4px; }
.logo { width: 36px; height: 36px; }
.r:nth-child(-n+3) .pos { color: var(--rv-gold); }
.us { background: linear-gradient(90deg, var(--rv-orange-soft), var(--rv-surface-2) 80%); box-shadow: inset 0 0 0 1px var(--rv-orange-line); }
.us .pos, .us .pts { color: var(--rv-orange); }
@media (min-width: 1051px) {
  .split { grid-auto-flow: column; grid-template-rows: repeat(var(--half), auto); grid-template-columns: repeat(2, 1fr); gap: 6px 20px; }
}
</style>
