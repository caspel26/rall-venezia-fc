<script setup lang="ts">
const props = defineProps<{ label: string; id: string; hint?: string; error?: string }>()
const describedBy = computed(() => [props.hint && `${props.id}-hint`, props.error && `${props.id}-err`].filter(Boolean).join(' ') || undefined)
</script>

<template>
  <div class="field">
    <label :for="id">{{ label }}</label>
    <slot :described-by="describedBy" :invalid="!!error" />
    <p v-if="hint" :id="`${id}-hint`" class="muted hint">{{ hint }}</p>
    <p v-if="error" :id="`${id}-err`" class="err" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.field { display: grid; gap: var(--space-2); text-align: left; }
label { font-size: var(--fs-sm); font-weight: var(--fw-ui); }
.hint, .err { font-size: var(--fs-sm); }
.err { color: var(--rv-red); }
</style>
