<script setup lang="ts">
import type { Database } from '~/types/database'

type Day = { date: string; n: number; voters: string[] }
const props = defineProps<{ pollId: string; days: Day[]; mine: string[]; best: string[]; top: number; canVote: boolean }>()
const emit = defineEmits<{ saved: [] }>()

const client = useSupabaseClient<Database>()
const selected = ref(new Set(props.mine))
watch(() => props.mine, (m) => { selected.value = new Set(m) })
const saving = ref(false)
const error = ref('')
const announce = ref('')

// Several days can be chosen: each tap adds or removes one, shown at once and rolled back if refused.
async function toggle(date: string) {
  if (!props.canVote || saving.value) return
  const before = new Set(selected.value)
  const next = new Set(before)
  next.has(date) ? next.delete(date) : next.add(date)
  selected.value = next
  saving.value = true
  error.value = ''
  const { error: e } = await client.rpc('set_poll_votes', { p_poll_id: props.pollId, p_days: [...next].sort() })
  saving.value = false
  if (e) {
    selected.value = before
    error.value = /poll_closed/.test(e.message) ? 'Il sondaggio è chiuso.' : 'Non siamo riusciti a salvare. Riprova.'
    return
  }
  announce.value = `Giorni scelti: ${[...next].map((d) => pollDay(d).full).join(', ') || 'nessuno'}`
  emit('saved')
}
const shown = (d: Day) => d.n + (selected.value.has(d.date) && !props.mine.includes(d.date) ? 1 : 0) - (!selected.value.has(d.date) && props.mine.includes(d.date) ? 1 : 0)
</script>

<template>
  <div>
    <div class="days" role="group" aria-label="Scegli i giorni in cui ci sei">
      <button v-for="d in days" :key="d.date" type="button" class="day" :class="{ on: selected.has(d.date), best: best.includes(d.date) }"
        :aria-pressed="selected.has(d.date)" :disabled="!canVote" @click="toggle(d.date)">
        <span v-if="selected.has(d.date)" class="mark" aria-hidden="true"><AppIcon name="check" :size="14" /></span>
        <span class="dow eyebrow">{{ pollDay(d.date).dow }}</span>
        <span class="num display tabular">{{ pollDay(d.date).num }}</span>
        <span class="bar" aria-hidden="true"><i :class="{ gold: best.includes(d.date) }" :style="{ height: `${top ? (shown(d) / Math.max(top, shown(d))) * 100 : 0}%` }" /></span>
        <span class="n tabular"><Transition name="tick" mode="out-in"><b :key="shown(d)">{{ shown(d) }}</b></Transition></span>
        <span v-if="best.includes(d.date)" class="star" role="img" aria-label="Giorno più votato"><AppIcon name="star" :size="14" /></span>
      </button>
    </div>
    <p v-if="error" class="err" role="alert">{{ error }}</p>
    <p class="sr-only" role="status" aria-live="polite">{{ announce }}</p>
  </div>
</template>

<style scoped>
.days { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-2); }
.day { position: relative; display: grid; justify-items: center; gap: 2px; padding: 26px var(--space-1) var(--space-2); min-height: 150px; border: 1px solid var(--rv-line); border-radius: 14px; background: var(--rv-surface-2); color: var(--rv-cream); font: inherit; cursor: pointer; transition: border-color var(--dur) var(--ease-standard), background var(--dur) var(--ease-standard), transform 200ms var(--ease-out); }
.day:disabled { cursor: default; }
.day:active { transform: scale(.96); }
.mark { position: absolute; top: 7px; left: 8px; color: var(--rv-orange); }
.num { font-size: var(--fs-h1); line-height: 1; }
.bar { position: relative; width: 10px; height: 56px; background: var(--rv-line); border-radius: 7px; overflow: hidden; display: flex; align-items: flex-end; margin: var(--space-1) 0; }
.bar i { display: block; width: 100%; background: var(--rv-orange); border-radius: 7px; transition: height 600ms var(--ease-out); }
.bar i.gold { background: var(--rv-gold); }
.n { position: relative; height: 1.4em; min-width: 1.4em; text-align: center; font-weight: var(--fw-head); }
.on { border-color: var(--rv-orange); background: linear-gradient(180deg, rgb(253 127 16 / .28), rgb(253 127 16 / .08)); }
.on .dow { color: var(--rv-orange); }
.best { border-color: var(--rv-gold); }
.star { position: absolute; top: 6px; right: 8px; color: var(--rv-gold); display: grid; }
.err { color: var(--rv-red); font-size: var(--fs-sm); margin-top: var(--space-2); }
@media (hover: hover) { .day:not(:disabled):hover { border-color: var(--rv-orange); transform: translateY(-3px); } }

</style>
