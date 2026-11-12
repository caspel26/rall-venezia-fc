<script setup lang="ts">
defineProps<{ title: string; body: string; at?: string | null; pinned?: boolean }>()
</script>

<template>
  <article class="ann lift">
    <div class="top">
      <span class="tile"><AppIcon name="megaphone" :size="22" /></span>
      <span class="chip-i"><AppIcon :name="pinned ? 'pin' : 'megaphone'" :size="14" />{{ pinned ? 'In evidenza' : 'Dallo spogliatoio' }}</span>
      <span v-if="at" class="date">{{ formatShortDay(at) }}</span>
    </div>
    <h3 class="display">{{ title }}</h3>
    <p class="body">{{ body }}</p>
  </article>
</template>

<style scoped>
.ann { position: relative; display: grid; gap: 12px; padding: 24px; border-radius: var(--r-panel); overflow: hidden; background: radial-gradient(60% 70% at 100% 0%, var(--rv-orange-soft), transparent 70%), var(--panel-bg); box-shadow: inset 0 0 0 1px var(--rv-line); }
.ann::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 3px; background: linear-gradient(90deg, var(--rv-orange), transparent 70%); }
.top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.tile { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: var(--rv-orange-soft); color: var(--rv-orange); }
.date { font-size: 13px; color: var(--rv-muted); }
h3 { font-size: 28px; line-height: 1; }
.body { font-size: 16px; line-height: 1.55; color: var(--rv-cream-2); white-space: pre-line; }
</style>
