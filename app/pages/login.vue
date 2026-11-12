<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useHead({ title: 'Accesso · Rall Venezia' })

const client = useSupabaseClient()
const user = useSupabaseUser()
const redirectCookie = useSupabaseCookieRedirect()

const mode = ref<'login' | 'reset'>('login')
const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')
const info = ref('')

watchEffect(() => {
  if (user.value) navigateTo(redirectCookie.pluck() || '/')
})

function message(raw: string) {
  if (/invalid login/i.test(raw)) return 'Email o password non corretti.'
  if (/rate limit|too many/i.test(raw)) return 'Troppi tentativi. Riprova tra qualche minuto.'
  return 'Qualcosa non ha funzionato. Riprova.'
}

async function submit() {
  busy.value = true
  error.value = info.value = ''
  if (mode.value === 'login') {
    const { error: e } = await client.auth.signInWithPassword({ email: email.value.trim(), password: password.value })
    if (e) error.value = message(e.message)
  } else {
    // The reply is identical whether or not the address exists, so the form cannot be used to probe members.
    await client.auth.resetPasswordForEmail(email.value.trim())
    info.value = 'Se l’indirizzo è nello spogliatoio, riceverai un’email con il link.'
  }
  busy.value = false
}
</script>

<template>
  <div class="auth-stack">
    <ClubLogo :size="112" class="intro" />
    <div class="intro d1">
      <h1 class="display brand">Rall Venezia FC</h1>
      <p class="eyebrow">Accesso allo spogliatoio</p>
    </div>

    <form class="stack intro d2" novalidate @submit.prevent="submit">
      <FormField id="email" label="Email" v-slot="{ describedBy }">
        <input id="email" v-model="email" class="input" type="email" name="email" autocomplete="username" inputmode="email"
          required :aria-describedby="describedBy">
      </FormField>
      <FormField v-if="mode === 'login'" id="password" label="Password" :error="error" v-slot="{ describedBy, invalid }">
        <input id="password" v-model="password" class="input" type="password" name="password" autocomplete="current-password"
          required :aria-invalid="invalid" :aria-describedby="describedBy">
      </FormField>
      <p v-if="info" class="muted" role="status">{{ info }}</p>
      <button class="btn btn-primary btn-block" type="submit" :disabled="busy">
        {{ mode === 'login' ? 'Entra' : 'Invia il link' }}
      </button>
      <button class="btn-link" type="button" @click="mode = mode === 'login' ? 'reset' : 'login'; error = info = ''">
        {{ mode === 'login' ? 'Password dimenticata?' : 'Torna all’accesso' }}
      </button>
    </form>

    <p class="muted quote intro d3">Quello che succede nello spogliatoio resta nello spogliatoio.</p>
  </div>
</template>

<style scoped>
.brand { font-size: var(--fs-h1); margin-bottom: var(--space-2); }
.quote { font-size: var(--fs-sm); font-style: italic; }
</style>
