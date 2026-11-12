<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useHead({ title: 'Scegli la password · Rall Venezia' })

const client = useSupabaseClient()
const route = useRoute()

const state = ref<'checking' | 'ready' | 'invalid'>('checking')
const password = ref('')
const confirm = ref('')
const error = ref('')
const busy = ref(false)

// The invite / recovery email carries a one-time token_hash; exchange it for a session.
onMounted(async () => {
  const tokenHash = route.query.token_hash
  const type = route.query.type === 'recovery' ? 'recovery' : 'invite'
  if (typeof tokenHash === 'string') {
    const { error: e } = await client.auth.verifyOtp({ token_hash: tokenHash, type })
    state.value = e ? 'invalid' : 'ready'
    if (!e) await navigateTo('/auth/set-password', { replace: true })
    return
  }
  const { data } = await client.auth.getSession()
  state.value = data.session ? 'ready' : 'invalid'
})

async function submit() {
  error.value = ''
  if (password.value.length < 10) {
    error.value = 'Usa almeno 10 caratteri.'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'Le due password non coincidono.'
    return
  }
  busy.value = true
  const { error: e } = await client.auth.updateUser({ password: password.value })
  busy.value = false
  if (e) {
    error.value = /same|different/i.test(e.message) ? 'Scegli una password diversa dalla precedente.' : 'Non siamo riusciti a salvare la password. Riprova.'
    return
  }
  await navigateTo('/')
}
</script>

<template>
  <ClubLogo :size="96" />
  <div v-if="state === 'checking'" class="muted" role="status">Controllo il tuo invito…</div>

  <div v-else-if="state === 'invalid'" class="stack">
    <h1 class="display">Link scaduto</h1>
    <p class="muted">Questo invito non è più valido. Chiedi a un admin di inviartene uno nuovo.</p>
    <NuxtLink class="btn btn-block" to="/login">Vai all’accesso</NuxtLink>
  </div>

  <template v-else>
    <div>
      <h1 class="display">Scegli la password</h1>
      <p class="eyebrow">Benvenuto nello spogliatoio</p>
    </div>
    <form class="stack" novalidate @submit.prevent="submit">
      <FormField id="pw" label="Nuova password" hint="Almeno 10 caratteri." v-slot="{ describedBy }">
        <input id="pw" v-model="password" class="input" type="password" autocomplete="new-password" required :aria-describedby="describedBy">
      </FormField>
      <FormField id="pw2" label="Ripeti la password" :error="error" v-slot="{ describedBy, invalid }">
        <input id="pw2" v-model="confirm" class="input" type="password" autocomplete="new-password" required
          :aria-invalid="invalid" :aria-describedby="describedBy">
      </FormField>
      <button class="btn btn-primary btn-block" type="submit" :disabled="busy">Entra</button>
    </form>
  </template>
</template>
