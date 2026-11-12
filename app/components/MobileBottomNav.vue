<script setup lang="ts">
const { primary } = useNav()
const route = useRoute()
</script>

<template>
  <nav class="bottom-nav" aria-label="Navigazione principale">
    <NuxtLink v-for="item in primary" :key="item.to" :to="item.to" class="item"
      :aria-current="isActive(route.path, item.to) ? 'page' : undefined">
      <AppIcon :name="item.icon" />
      <span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed; inset: auto 0 0 0; z-index: 20; display: flex; justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom); background: var(--rv-surface); border-top: 1px solid var(--rv-line);
}
.item {
  flex: 1; min-height: var(--nav-h); display: grid; place-items: center; align-content: center; gap: 2px;
  color: var(--rv-muted); text-decoration: none; font-size: var(--fs-cap); font-weight: var(--fw-ui);
  transition: color var(--dur) var(--ease-standard);
}
.item[aria-current='page'] { color: var(--rv-orange); }
@media (min-width: 1051px) { .bottom-nav { display: none; } }
</style>
