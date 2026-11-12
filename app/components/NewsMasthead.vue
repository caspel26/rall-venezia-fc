<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
const today = formatDay(new Date().toISOString())
</script>

<template>
  <header class="mast" :class="{ compact }">
    <div class="top"><span>Anno I</span><span class="cap">{{ today }}</span><span>Edizione dello spogliatoio</span></div>
    <NuxtLink to="/news" class="name display" aria-label="La Gazzetta Rall, prima pagina">La Gazzetta Rall</NuxtLink>
    <p class="tag">Il quotidiano del Rall Venezia FC · tre punti, zero scuse</p>
  </header>
</template>

<style scoped>
.mast { display: grid; gap: var(--space-2); text-align: center; border-bottom: 3px double var(--paper-rule); padding-bottom: var(--space-3); }
.top { display: flex; justify-content: space-between; gap: var(--space-3); font: 600 var(--fs-cap)/1 var(--font-ui); letter-spacing: .12em; text-transform: uppercase; color: var(--paper-muted); border-bottom: 1px solid var(--paper-rule); padding-bottom: var(--space-2); }
.cap { text-transform: capitalize; letter-spacing: .06em; }
.name { font-size: clamp(40px, 11vw, 112px); color: var(--paper-ink); text-decoration: none; line-height: .95; }
.compact .name { font-size: clamp(32px, 7vw, 56px); }
.tag { font: italic 400 var(--fs-sm)/1.3 var(--font-serif); color: var(--paper-muted); }
@media (max-width: 700px) { .top span:last-child { display: none; } .top { justify-content: space-between; } }
</style>
