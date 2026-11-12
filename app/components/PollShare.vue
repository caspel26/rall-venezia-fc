<script setup lang="ts">
const props = defineProps<{ poll: { week_start: string; closes_at: string; created_at: string } }>()

const url = computed(() => (import.meta.client ? `${window.location.origin}/clubhouse/poll` : '/clubhouse/poll'))
const text = computed(() => pollShareText(props.poll, url.value))
const canShare = import.meta.client && typeof navigator !== 'undefined' && 'share' in navigator
const copied = ref(false)
const isNew = computed(() => Date.now() - new Date(props.poll.created_at).getTime() < 3 * 86_400_000)

async function copy() {
  try { await navigator.clipboard.writeText(text.value); copied.value = true; setTimeout(() => (copied.value = false), 2200) } catch { /* shown message stays selectable */ }
}
async function share() {
  try { await navigator.share({ text: text.value }) } catch { /* cancelled */ }
}
</script>

<template>
  <div class="share">
    <p v-if="isNew" class="hint"><span class="chip-i"><AppIcon name="megaphone" :size="14" />Nuovo sondaggio</span>È pronto: condividilo nel gruppo.</p>
    <div class="row">
      <a :href="whatsappLink(text)" class="btn btn-primary wa" target="_blank" rel="noopener noreferrer"><AppIcon name="whatsapp" :size="18" />Condividi su WhatsApp</a>
      <button v-if="canShare" type="button" class="btn" @click="share"><AppIcon name="share" :size="18" />Condividi</button>
      <button type="button" class="btn" @click="copy"><AppIcon :name="copied ? 'check' : 'copy'" :size="18" />{{ copied ? 'Copiato' : 'Copia messaggio' }}</button>
    </div>
    <p class="sr-only" role="status">{{ copied ? 'Messaggio copiato' : '' }}</p>
  </div>
</template>

<style scoped>
.share { display: grid; gap: 12px; }
.hint { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; font-size: var(--fs-sm); color: var(--rv-muted); }
.row { display: flex; flex-wrap: wrap; gap: 10px; }
.wa { text-decoration: none; }
</style>
