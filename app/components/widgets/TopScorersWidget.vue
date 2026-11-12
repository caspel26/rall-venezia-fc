<script setup lang="ts">
const { rows, status } = useRanking('goals', 5)
const max = computed(() => rows.value[0]?.value ?? 1)
</script>

<template>
  <WidgetFrame v-if="rows.length || status === 'pending'" title="Classifica marcatori" to="/stats" link-label="Tutte le stats" :loading="status === 'pending' && !rows.length">
    <ol class="rank">
      <li v-for="(r, i) in rows" :key="r.player.id" :class="{ first: r.position === 1 }">
        <span class="pos display tabular">{{ r.position }}</span>
        <PlayerPortrait class="av" :first="r.player.first_name" :last="r.player.last_name" :number="r.player.shirt_number" :photo-path="r.player.photo_path" variant="thumb" />
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
.rank { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-2); }
.rank li { display: grid; grid-template-columns: 24px 40px 1fr auto; align-items: center; gap: var(--space-3); }
.pos { color: var(--rv-muted); font-size: var(--fs-h3); text-align: center; }
.av { width: 40px; border: 1px solid var(--rv-line); }
.first .pos { color: var(--rv-gold); }
.first .av { border-color: var(--rv-gold); }
.mid { display: grid; gap: 4px; min-width: 0; }
.nm { text-decoration: none; font-weight: var(--fw-ui); font-size: var(--fs-sm); }
.bar { display: block; height: 6px; background: var(--rv-line); border-radius: 3px; overflow: hidden; }
.bar i { display: block; height: 100%; background: var(--rv-orange); border-radius: 3px; transform-origin: left; animation: grow 900ms var(--ease-out) both; }
.first .bar i { background: var(--rv-gold); }
@keyframes grow { from { transform: scaleX(0); } }
.v { font-size: var(--fs-h2); min-width: 2ch; text-align: right; }
@media (prefers-reduced-motion: reduce) { .bar i { animation: none; } }
</style>
