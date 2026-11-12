<script setup lang="ts">
const { primary, secondary } = useNav()
const { user, role, signOut } = useAuth()
const route = useRoute()
const name = computed(() => user.value?.user_metadata?.display_name ?? user.value?.email ?? '')
</script>

<template>
  <aside class="rail">
    <NuxtLink to="/" class="brand" aria-label="Rall Venezia FC, home">
      <ClubLogo :size="40" />
      <span class="display">Rall Venezia</span>
    </NuxtLink>
    <nav aria-label="Navigazione principale" class="links">
      <NuxtLink v-for="item in primary" :key="item.to" :to="item.to" class="link"
        :aria-current="isActive(route.path, item.to) ? 'page' : undefined">
        <AppIcon :name="item.icon" /><span>{{ item.label }}</span>
      </NuxtLink>
    </nav>
    <nav aria-label="Altre sezioni" class="links more">
      <NuxtLink v-for="item in secondary" :key="item.to" :to="item.to" class="link small"
        :aria-current="isActive(route.path, item.to) ? 'page' : undefined"><AppIcon :name="item.icon" :size="20" /><span>{{ item.label }}</span></NuxtLink>
    </nav>
    <div class="me">
      <p class="who">{{ name }}</p>
      <p class="eyebrow">{{ role }}</p>
      <button class="btn-link" type="button" @click="signOut">Esci</button>
    </div>
  </aside>
</template>

<style scoped>
.rail {
  position: sticky; top: 0; height: 100dvh; display: none; flex-direction: column; gap: var(--space-5);
  padding: var(--space-5); border-right: 1px solid var(--rv-line); background: var(--rv-surface);
}
@media (min-width: 1051px) { .rail { display: flex; } }
.brand { display: flex; align-items: center; gap: var(--space-3); text-decoration: none; font-size: var(--fs-h3); }
.links { display: grid; gap: var(--space-1); }
.link {
  display: flex; align-items: center; gap: var(--space-3); min-height: 44px; padding: 0 var(--space-3);
  border-radius: var(--r-s); color: var(--rv-muted); text-decoration: none; font-weight: var(--fw-ui);
  transition: color var(--dur) var(--ease-standard), background var(--dur) var(--ease-standard);
}
.link:hover { color: var(--rv-cream); background: var(--rv-surface-2); }
.link[aria-current='page'] { color: var(--rv-orange); background: var(--rv-surface-2); }
.link.small { font-size: var(--fs-sm); }
.more { margin-top: var(--space-2); }
.me { margin-top: auto; display: grid; gap: var(--space-1); }
.who { font-weight: var(--fw-ui); overflow-wrap: anywhere; }
.btn-link { text-align: left; padding: 0; min-height: 44px; }
</style>
