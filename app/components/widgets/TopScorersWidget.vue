<script setup lang="ts">
const { rows, status } = useRanking('goals', 5)
const max = computed(() => rows.value[0]?.value ?? 1)
const tied = (i: number) => i > 0 && rows.value[i]!.position === rows.value[i - 1]!.position || (rows.value[i + 1]?.position === rows.value[i]!.position)
</script>

<template>
  <WidgetFrame v-if="rows.length || status === 'pending'" title="Classifica marcatori" icon="ball" to="/stats" link-label="Tutte le stats" :loading="status === 'pending' && !rows.length">
    <ol class="rank">
      <li v-for="(r, i) in rows" :key="r.player.id" :class="{ first: r.position === 1 }">
        <span class="pos display tabular">{{ tied(i) && r.position > 1 ? '=' : '' }}{{ r.position }}</span>
        <PlayerAvatar :first="r.player.first_name" :last="r.player.last_name" :photo-path="r.player.photo_path" :size="r.position === 1 ? 48 : 40" :ring="r.position === 1 ? 'gold' : 'none'" />
        <div class="mid">
          <NuxtLink :to="`/team/${r.player.slug}`" class="nm">{{ fullName(r.player) }}</NuxtLink>
          <span class="bar"><i :style="{ width: `${(r.value / max) * 100}%`, animationDelay: `${i * 90}ms` }" /></span>
        </div>
        <span class="v display tabular">{{ r.value }}</span>
      </li>
    </ol>
  </WidgetFrame>
</template>

<style scoped>
.rank { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.rank li { display: grid; grid-template-columns: 32px 48px 1fr auto; align-items: center; gap: 12px; min-height: 56px; padding: 4px 8px; border-radius: 10px; transition: background var(--dur) var(--ease-standard); }
.rank li:hover { background: var(--rv-surface-2); }
.pos { color: var(--rv-muted); font-size: 20px; text-align: center; }
.first .pos { color: var(--rv-gold); }
.rank li :deep(.av) { margin-inline: auto; }
.mid { display: grid; gap: 6px; min-width: 0; }
.nm { text-decoration: none; font: 600 14px/1.2 var(--font-ui); }
.bar { display: block; height: 6px; background: var(--rv-surface-3); border-radius: 3px; overflow: hidden; }
.bar i { display: block; height: 100%; background: var(--rv-orange); border-radius: 3px; transform-origin: left; animation: grow 900ms var(--ease-out) both; }
.first .bar i { background: var(--rv-gold); }
@keyframes grow { from { transform: scaleX(0); } }
.v { font-size: 28px; min-width: 2ch; text-align: right; }
@media (prefers-reduced-motion: reduce) { .bar i { animation: none; } }
</style>
