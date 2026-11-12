<script setup lang="ts">
const { data } = useLatestAnnouncement()
</script>

<template>
  <WidgetFrame v-if="data" title="Bacheca" bare>
    <NuxtLink to="/clubhouse/announcements" class="note">
      <span class="tape" aria-hidden="true" />
      <p class="eyebrow">{{ data.pinned ? 'In evidenza' : 'Dallo spogliatoio' }} · {{ formatShortDay(data.published_at!) }}</p>
      <h3 class="display">{{ data.title }}</h3>
      <p class="body">{{ data.body }}</p>
    </NuxtLink>
  </WidgetFrame>
</template>

<style scoped>
.note { position: relative; display: grid; gap: var(--space-2); padding: var(--space-6) var(--space-5) var(--space-5); background: #f3e6c6; color: #1a160f; text-decoration: none; transform: rotate(-.9deg); box-shadow: 0 14px 30px rgb(0 0 0 / .45); transition: transform 350ms var(--ease-out); }
.note .eyebrow { color: #6b5a2e; }
.tape { position: absolute; top: -12px; left: 50%; width: 110px; height: 26px; transform: translateX(-50%) rotate(2deg); background: rgb(253 127 16 / .75); box-shadow: 0 2px 6px rgb(0 0 0 / .3); }
h3 { font-size: var(--fs-h2); line-height: .95; }
.body { font: 400 var(--fs-body)/1.5 var(--font-serif); white-space: pre-line; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
@media (hover: hover) { .note:hover { transform: rotate(0deg) translateY(-4px); } }
</style>
