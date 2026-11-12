<script setup lang="ts">
const { data } = useLatestAnnouncement()
</script>

<template>
  <WidgetFrame v-if="data" title="Bacheca" icon="megaphone" bare>
    <NuxtLink to="/clubhouse/announcements" class="note lift">
      <div class="top">
        <span class="tile"><AppIcon name="megaphone" :size="22" /></span>
        <span class="chip-i" :class="{ muted: !data.pinned }"><AppIcon :name="data.pinned ? 'pin' : 'megaphone'" :size="14" />{{ data.pinned ? 'In evidenza' : 'Dallo spogliatoio' }}</span>
        <span class="date">{{ formatShortDay(data.published_at!) }}</span>
      </div>
      <h3 class="display">{{ data.title }}</h3>
      <p class="body">{{ data.body }}</p>
      <span class="link-chip">Apri la bacheca<AppIcon name="arrow-right" :size="14" /></span>
    </NuxtLink>
  </WidgetFrame>
</template>

<style scoped>
.note { position: relative; display: grid; gap: 14px; justify-items: start; padding: 24px; border-radius: var(--r-panel); text-decoration: none; color: inherit; overflow: hidden;
  background: radial-gradient(60% 70% at 100% 0%, var(--rv-orange-soft), transparent 70%), var(--panel-bg); box-shadow: inset 0 0 0 1px var(--rv-line); }
.note::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 3px; background: linear-gradient(90deg, var(--rv-orange), transparent 70%); }
.top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.tile { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: var(--rv-orange-soft); color: var(--rv-orange); }
.chip-i.muted svg { color: var(--rv-muted); }
.date { font-size: 13px; color: var(--rv-muted); }
h3 { font-size: 28px; line-height: 1; }
.body { font: 400 16px/1.55 var(--font-ui); color: var(--rv-cream-2); white-space: pre-line; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
@media (max-width: 700px) { h3 { font-size: 24px; } }
</style>
