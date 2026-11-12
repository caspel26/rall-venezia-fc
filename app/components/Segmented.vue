<script setup lang="ts">
const props = defineProps<{ items: { key: string; label: string }[]; modelValue: string; label: string }>()
const emit = defineEmits<{ 'update:modelValue': [key: string] }>()

// Tabs pattern: roving tabindex, arrow keys move between tabs.
function onKey(e: KeyboardEvent, i: number) {
  const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
  if (!step) return
  e.preventDefault()
  const next = props.items[(i + step + props.items.length) % props.items.length]!
  emit('update:modelValue', next.key)
  nextTick(() => (document.getElementById(`tab-${next.key}`) as HTMLElement | null)?.focus())
}
</script>

<template>
  <div class="seg" role="tablist" :aria-label="label">
    <button v-for="(it, i) in items" :id="`tab-${it.key}`" :key="it.key" type="button" role="tab"
      :aria-selected="modelValue === it.key" :tabindex="modelValue === it.key ? 0 : -1"
      @click="emit('update:modelValue', it.key)" @keydown="onKey($event, i)">{{ it.label }}</button>
  </div>
</template>

<style scoped>
.seg { display: inline-flex; gap: var(--space-1); padding: var(--space-1); background: var(--rv-surface); border: 1px solid var(--rv-line); border-radius: var(--r-s); max-width: 100%; overflow-x: auto; }
button { min-height: 40px; padding: 0 var(--space-4); border: 0; border-radius: var(--r-s); background: none; color: var(--rv-muted); font: var(--fw-ui) var(--fs-sm)/1 var(--font-ui); cursor: pointer; white-space: nowrap; transition: background var(--dur) var(--ease-standard), color var(--dur) var(--ease-standard); }
button[aria-selected='true'] { background: var(--rv-orange); color: var(--rv-orange-ink); }
</style>
