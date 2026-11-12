<script setup lang="ts">
const displayFonts = [
  { name: 'Anton', cls: 'f-anton' },
  { name: 'Bebas Neue', cls: 'f-bebas' },
]
</script>

<template>
  <main class="page">
    <p class="eyebrow">Stage 1 — bootstrap</p>
    <h1>Rall Venezia Clubhouse</h1>
    <p class="muted">Placeholder: tokens, fonts and grain. The real pages arrive in the next stages.</p>

    <section class="panel grain arrive spec">
      <p class="eyebrow">Risultato</p>
      <p class="display tabular score">10 — 5</p>
      <p class="eyebrow">Rall Venezia vs Monza</p>
      <div class="row">
        <span class="pill pill-w" aria-label="Vittoria">V</span>
        <span class="pill pill-d" aria-label="Pareggio">N</span>
        <span class="pill pill-l" aria-label="Sconfitta">P</span>
        <button class="btn btn-primary" type="button">Disponibile</button>
        <button class="btn" type="button">Forse</button>
      </div>
    </section>

    <section class="spec">
      <h2>Display font specimen</h2>
      <div v-for="f in displayFonts" :key="f.name" class="panel specimen">
        <p class="eyebrow">{{ f.name }}</p>
        <p class="name" :class="f.cls">Daniele Nappo</p>
        <p class="name sm" :class="f.cls">#1 Portiere · Capitano — 10 — 5 — MVP</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.spec { margin-top: var(--section-space); display: grid; gap: var(--space-4); }
.score { font-size: var(--fs-score); }
.row { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; }
.name { font-size: var(--fs-display); text-transform: uppercase; line-height: 1; }
.f-anton { font-family: 'Anton', sans-serif; }
.f-bebas { font-family: 'Bebas Neue', sans-serif; }
.name.sm { font-size: var(--fs-h2); }
</style>
