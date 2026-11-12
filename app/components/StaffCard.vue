<script setup lang="ts">
import type { Tables } from '~/types/database'
defineProps<{ member: Tables<'staff_members'>; compact?: boolean }>()
</script>

<template>
  <article v-tilt class="person-card person-card--staff card" :class="{ compact }" tabindex="-1">
    <PlayerPortrait stage="staff" logo-fallback :first="member.first_name" :last="member.last_name" :number="null" :photo-path="member.photo_path" />
    <span class="chip"><AppIcon name="shield" :size="14" /> Staff</span>
    <div class="info">
      <p class="eyebrow role">{{ member.role_title }}</p>
      <h3 class="display"><span class="fn">{{ member.first_name }}</span> <span class="ln">{{ member.last_name }}</span></h3>
    </div>
    <span class="shine" aria-hidden="true" />
    <span class="accent-bar" aria-hidden="true" />
  </article>
</template>

<style scoped>
.card :deep(.portrait) { --ring-size: 96%; --ring-top: 2%; --spot-y: 26%; --stage-fade: var(--rv-surface); }
.chip { position: absolute; z-index: 4; top: var(--space-3); left: var(--space-3); display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: var(--r-pill); background: var(--rv-glass); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); font: 600 var(--fs-cap)/1 var(--font-ui); letter-spacing: .12em; text-transform: uppercase; color: var(--rv-green-ui); }
.info { position: absolute; z-index: 3; left: 0; right: 0; bottom: 0; display: grid; gap: 2px; padding: 56px var(--space-4) var(--space-4); background: linear-gradient(180deg, transparent 0%, rgb(11 11 9 / .88) 52%, rgb(11 11 9 / .96) 100%); }
.compact .ln { font-size: 22px; } .compact .fn { font-size: 15px; } .compact .info { padding-top: 40px; }
.compact .role { font-size: 11px; letter-spacing: .08em; }
.role { color: var(--rv-green-ui); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
h3 { display: grid; line-height: .9; }
.fn { font-size: 20px; color: var(--rv-cream-2); }
.ln { font-size: 32px; }
@media (max-width: 700px) { .ln { font-size: 26px; } .fn { font-size: 17px; } }
</style>
