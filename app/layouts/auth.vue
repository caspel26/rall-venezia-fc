<template>
  <main class="auth grain stripes">
    <div class="auth-card"><slot /></div>
  </main>
</template>

<style scoped>
.auth { min-height: 100dvh; display: grid; place-items: center; padding: var(--space-6) var(--gutter); background: var(--rv-black); }
.auth-card { width: 100%; max-width: 380px; display: grid; gap: var(--space-5); justify-items: center; text-align: center; }
</style>
