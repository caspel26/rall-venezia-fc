<script setup lang="ts">
const { secondary } = useNav()
const { user, role, signOut } = useAuth()
const open = ref(false)
const scrolled = useScrolled()
const route = useRoute()
watch(() => route.fullPath, () => { open.value = false })
const name = computed(() => user.value?.user_metadata?.display_name ?? user.value?.email ?? '')
</script>

<template>
  <header class="top" :class="{ 'hdr-scrolled': scrolled }">
    <NuxtLink to="/" class="brand" aria-label="Rall Venezia FC, home">
      <ClubLogo :size="32" /><span class="display">Rall Venezia</span>
    </NuxtLink>
    <button class="menu-btn" type="button" :aria-expanded="open" aria-controls="top-menu" aria-label="Menu" @click="open = !open">
      <AppIcon :name="open ? 'close' : 'menu'" />
    </button>
    <div v-show="open" id="top-menu" class="menu panel">
      <p class="who">{{ name }} <span class="eyebrow">· {{ role }}</span></p>
      <NuxtLink v-for="item in secondary" :key="item.to" :to="item.to" class="m-link">{{ item.label }}</NuxtLink>
      <button class="m-link out" type="button" @click="signOut">Esci</button>
    </div>
  </header>
</template>

<style scoped>
.top {
  position: sticky; top: 0; z-index: 15; display: flex; align-items: center; justify-content: space-between;
  min-height: 56px; padding: 0 var(--gutter); background: var(--rv-black); border-bottom: 1px solid transparent; transition: background-color .25s, border-color .25s;
}
.brand { display: flex; align-items: center; gap: var(--space-2); text-decoration: none; font-size: var(--fs-h3); }
.menu-btn { width: 44px; height: 44px; display: grid; place-items: center; background: none; border: 0; color: var(--rv-cream); cursor: pointer; }
.menu { position: absolute; top: 56px; right: var(--gutter); min-width: 220px; display: grid; gap: var(--space-1); padding: var(--space-3); }
.who { padding: var(--space-2) var(--space-3); font-weight: var(--fw-ui); overflow-wrap: anywhere; }
.m-link { display: flex; align-items: center; min-height: 44px; padding: 0 var(--space-3); border-radius: var(--r-s); text-decoration: none; background: none; border: 0; color: var(--rv-cream); font: inherit; cursor: pointer; text-align: left; }
.m-link:hover { background: var(--rv-surface-2); }
.out { color: var(--rv-muted); }
@media (min-width: 1051px) { .top { display: none; } }
</style>
