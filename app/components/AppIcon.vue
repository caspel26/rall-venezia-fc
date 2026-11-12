<script setup lang="ts">
export type IconName = 'home' | 'matches' | 'team' | 'stats' | 'locker' | 'menu' | 'close'
defineProps<{ name: IconName }>()
const paths: Record<IconName, string> = {
  home: 'M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10',
  matches: 'M4 7h16v12H4zM4 11h16M9 4v4M15 4v4',
  team: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5M16 4.5a3.2 3.2 0 0 1 0 6M18 14.8c1.8.7 3 2.3 3.5 5.2',
  stats: 'M5 20V11M12 20V4M19 20v-7',
  locker: 'M6 3h12v18H6zM12 3v18M9.5 11v2M14.5 11v2',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
}
</script>

<template>
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path :d="paths[name]" />
  </svg>
</template>
