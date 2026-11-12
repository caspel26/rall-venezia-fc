<script setup lang="ts">
import type { Database } from '~/types/database'
import type { AvailabilityStatus } from '~/types/domain'

const props = defineProps<{ matchId: string; current: AvailabilityStatus | null }>()
const emit = defineEmits<{ saved: [status: AvailabilityStatus] }>()

const client = useSupabaseClient<Database>()
const answer = ref<AvailabilityStatus | null>(props.current)
const saving = ref(false)
const error = ref('')
const announce = ref('')

const OPTIONS: { value: AvailabilityStatus; label: string; icon: string }[] = [
  { value: 'available', label: 'Ci sono', icon: '✓' },
  { value: 'maybe', label: 'Forse', icon: '?' },
  { value: 'unavailable', label: 'Non ci sono', icon: '✕' },
]

// Optimistic: a tap shows at once. Taps are never dropped: the last one wins, and only a refused latest tap rolls back.
let seq = 0
async function choose(status: AvailabilityStatus) {
  if (status === answer.value) return
  const previous = answer.value
  answer.value = status
  const mine = ++seq
  saving.value = true
  error.value = ''
  const { error: e } = await client.rpc('set_availability', { p_match_id: props.matchId, p_status: status })
  if (mine === seq) saving.value = false
  if (e) {
    if (mine === seq) { answer.value = previous; error.value = 'Non siamo riusciti a salvare la risposta. Riprova.' }
    return
  }
  if (mine === seq) {
    announce.value = `Risposta salvata: ${OPTIONS.find((o) => o.value === status)?.label}`
    emit('saved', status)
  }
}
</script>

<template>
  <div>
    <div class="opts" role="group" aria-label="La tua disponibilità per la prossima partita">
      <button v-for="o in OPTIONS" :key="o.value" type="button" class="opt" :class="o.value"
        :aria-pressed="answer === o.value" @click="choose(o.value)">
        <span class="ic" aria-hidden="true">{{ o.icon }}</span>{{ o.label }}
      </button>
    </div>
    <p v-if="error" class="err" role="alert">{{ error }}</p>
    <p class="sr" role="status" aria-live="polite">{{ announce }}</p>
  </div>
</template>

<style scoped>
.opts { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2); }
.opt {
  min-height: 52px; display: grid; place-items: center; align-content: center; gap: 2px; padding: var(--space-2);
  border: 1px solid var(--rv-line); border-radius: var(--r-s); background: var(--rv-surface-2); color: var(--rv-cream);
  font: var(--fw-ui) var(--fs-sm)/1.1 var(--font-ui); cursor: pointer;
  transition: background var(--dur) var(--ease-standard), border-color var(--dur) var(--ease-standard), transform var(--dur-fast) var(--ease-out);
}
.opt:active { transform: scale(.97); }
.ic { font-size: var(--fs-h3); line-height: 1; }
.opt[aria-pressed='true'].available { background: var(--rv-green); border-color: var(--rv-green); color: var(--rv-black); }
.opt[aria-pressed='true'].maybe { background: var(--rv-amber); border-color: var(--rv-amber); color: var(--rv-black); }
.opt[aria-pressed='true'].unavailable { background: var(--rv-red); border-color: var(--rv-red); color: var(--rv-black); }
.err { color: var(--rv-red); font-size: var(--fs-sm); margin-top: var(--space-2); }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
</style>
