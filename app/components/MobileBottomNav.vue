<script setup lang="ts">
const { primary } = useNav()
const route = useRoute()
const activeIndex = computed(() => primary.value.findIndex((i) => isActive(route.path, i.to)))
</script>

<template>
  <nav class="bottom-nav dock" :class="{ neutral: activeIndex < 0 }" aria-label="Navigazione principale"
    :style="{ '--n': primary.length, '--i': Math.max(0, activeIndex) }">
    <span class="lens" aria-hidden="true" />
    <NuxtLink v-for="item in primary" :key="item.to" :to="item.to" class="item"
      :aria-current="isActive(route.path, item.to) ? 'page' : undefined">
      <AppIcon :name="item.icon" :size="22" />
      <span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
/* A floating dock of liquid glass: translucent tint, strong blur, a soft top highlight, and a "lens" that slides under the current section. */
.dock {
  position: fixed; z-index: 20; left: 50%; translate: -50% 0;
  bottom: calc(8px + env(safe-area-inset-bottom));
  display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); align-items: stretch;
  width: min(480px, calc(100vw - 24px - env(safe-area-inset-left) - env(safe-area-inset-right)));
  height: 60px; padding: 4px; isolation: isolate;
  border: 1px solid rgb(255 255 255 / .18); border-radius: 22px;
  background:
    linear-gradient(145deg, rgb(255 255 255 / .09), transparent 34%),
    linear-gradient(155deg, rgb(32 32 28 / .56), rgb(19 19 18 / .46));
  box-shadow: 0 12px 26px -12px rgb(0 0 0 / .6), 0 3px 8px rgb(0 0 0 / .25), inset 0 1px 0 rgb(255 255 255 / .22);
  -webkit-backdrop-filter: blur(22px) saturate(1.2) brightness(.9); backdrop-filter: blur(22px) saturate(1.2) brightness(.9);
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) { .dock { background: rgb(26 26 24 / .94); } }
.lens {
  position: absolute; z-index: 0; top: 4px; left: 4px; height: calc(100% - 8px);
  width: calc((100% - 8px) / var(--n)); transform: translateX(calc(var(--i) * 100%));
  border-radius: 17px; border: 1px solid var(--rv-orange-line);
  background: linear-gradient(180deg, rgb(253 127 16 / .30), rgb(253 127 16 / .12));
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .18), 0 2px 8px rgb(0 0 0 / .25);
  transition: transform 260ms var(--ease-spring), opacity 160ms var(--ease-standard); pointer-events: none;
}
.neutral .lens { opacity: 0; }
.item {
  position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  min-width: 0; min-height: 48px; padding: 2px 1px; border-radius: 16px; text-decoration: none; text-align: center;
  color: rgb(243 234 216 / .74); font: var(--fw-ui) var(--fs-cap)/1.2 var(--font-ui); -webkit-tap-highlight-color: transparent;
  transition: color var(--dur) var(--ease-standard), transform 200ms var(--ease-spring);
}
.item:active { transform: scale(.92); }
.item[aria-current='page'] { color: var(--rv-orange); font-weight: var(--fw-head); }
.item:focus-visible { outline: 2px solid var(--rv-orange); outline-offset: -2px; }
@media (min-width: 1051px) { .dock { display: none; } }
@media (prefers-reduced-motion: reduce) { .lens { transition: none; } }
</style>
