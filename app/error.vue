<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const status = computed(() => props.error.statusCode ?? 500)

const copy = computed(() => {
  switch (status.value) {
    case 403: return { title: 'Accesso negato', text: 'Questa zona dello spogliatoio non è per te.' }
    case 404: return { title: 'Fuori gioco', text: 'Questa pagina non esiste.' }
    default: return { title: 'Infortunio', text: 'Qualcosa si è rotto. Riproviamo tra poco.' }
  }
})
const code = computed(() => ([403, 404].includes(status.value) ? status.value : 500))
useHead({ title: () => `${copy.value.title} · Rall Venezia` })
</script>

<template>
  <main class="err stage"><span class="stage-aurora" aria-hidden="true" />
    <ClubLogo :size="88" />
    <p class="code display tabular">{{ code }}</p>
    <h1 class="display">{{ copy.title }}</h1>
    <p class="muted">{{ copy.text }}</p>
    <button class="btn btn-primary" type="button" @click="clearError({ redirect: '/' })">Torna alla home</button>
  </main>
</template>

<style scoped>
.err { --ring-size: 640px; --ring-top: 10%; --stage-fade: transparent; min-height: 100dvh; display: grid; place-content: center; justify-items: center; gap: var(--space-3); padding: var(--space-6) var(--gutter); text-align: center; background: var(--rv-black); }
.code { font-size: var(--fs-score); color: var(--rv-orange); }
h1 { font-size: var(--fs-h1); }
</style>
