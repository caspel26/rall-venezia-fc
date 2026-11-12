<script setup lang="ts">
export type IconName =
  | 'home' | 'matches' | 'calendar' | 'calendar-check' | 'team' | 'users' | 'users-check' | 'stats' | 'chart' | 'locker'
  | 'menu' | 'close' | 'x' | 'news' | 'instagram' | 'whistle' | 'megaphone' | 'pin' | 'clock' | 'map-pin' | 'plane'
  | 'ball' | 'assist' | 'star' | 'trophy' | 'armband' | 'shield' | 'list' | 'form' | 'check' | 'question'
  | 'share' | 'copy' | 'whatsapp' | 'arrow-right' | 'arrow-left' | 'chevron-right' | 'external'

withDefaults(defineProps<{ name: IconName; size?: number }>(), { size: 24 })

// 24x24, stroke icons (currentColor). Several subpaths per icon.
const paths: Record<IconName, string> = {
  home: 'M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10',
  matches: 'M4 7h16v12H4zM4 11h16M9 4v4M15 4v4',
  calendar: 'M4 7h16v12H4zM4 11h16M9 4v4M15 4v4',
  'calendar-check': 'M4 7h16v12H4zM4 11h16M9 4v4M15 4v4M9.5 15l2 2 3.5-3.5',
  team: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5M16 4.5a3.2 3.2 0 0 1 0 6M18 14.8c1.8.7 3 2.3 3.5 5.2',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5M16 4.5a3.2 3.2 0 0 1 0 6M18 14.8c1.8.7 3 2.3 3.5 5.2',
  'users-check': 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5M16 9l2 2 3.5-4',
  stats: 'M5 20V11M12 20V4M19 20v-7',
  chart: 'M5 20V11M12 20V4M19 20v-7',
  locker: 'M6 3h12v18H6zM12 3v18M9.5 11v2M14.5 11v2',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  x: 'M6 6l12 12M18 6 6 18',
  news: 'M5 5h11a1 1 0 0 1 1 1v13H6a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1ZM17 9h2a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2M7.5 9h6M7.5 12.5h6M7.5 16h4',
  instagram: 'M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM17 7h.01',
  whistle: 'M9 9.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM12.5 9H21v3h-5.5M5 9.5 3 6',
  megaphone: 'M4 10 14 5v14L4 14ZM7 14l1 5M17.5 9a4 4 0 0 1 0 6M20 7a7 7 0 0 1 0 10',
  pin: 'M9 3h6l-1 6 3 3H7l3-3ZM12 12v9',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3 2',
  'map-pin': 'M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10ZM12 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  plane: 'M21 3 3 10l7 3 3 7ZM10 13 21 3',
  ball: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 8.5l3 2.2-1.1 3.6h-3.8L9 10.7ZM12 8.5V3M15 10.7l5-1.6M13.9 14.3l3 4M10.1 14.3l-3 4M9 10.7 4 9.1',
  assist: 'M4 18c2-8 7-12 14-12M13 4l5 2-2 5',
  star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8Z',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0ZM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 13v4M8 20h8M10 17h4',
  armband: 'M4 9h16v6H4ZM13.5 10.5h-3a1.5 1.5 0 0 0 0 3h3',
  shield: 'M12 3 20 6v6c0 4.5-3.5 7.5-8 9-4.5-1.5-8-4.5-8-9V6Z',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  form: 'M3 16l5-5 4 3 9-8M16 6h5v5',
  check: 'M5 12.5l5 5L19 7',
  question: 'M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 1-1 1.7M12 17h.01',
  share: 'M4 12v7h16v-7M12 3v12M8 7l4-4 4 4',
  copy: 'M9 9h11v11H9zM5 15V5h10',
  whatsapp: 'M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3ZM9 8.5c0 3.5 3 6.5 6.5 6.5l1.2-1.6-2-1-.9.8c-1-.4-1.900-1.300-2.300-2.300l.8-.9-1-2Z',
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  'arrow-left': 'M19 12H5M11 6l-6 6 6 6',
  'chevron-right': 'm9 6 6 6-6 6',
  external: 'M14 4h6v6M20 4 10 14M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
}
</script>

<template>
  <svg viewBox="0 0 24 24" :width="size" :height="size" fill="none" stroke="currentColor" stroke-width="1.8"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path :d="paths[name]" />
  </svg>
</template>
