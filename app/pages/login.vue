<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useHead({ title: 'Accesso · Rall Venezia' })

const client = useSupabaseClient()
const user = useSupabaseUser()
const redirectCookie = useSupabaseCookieRedirect()

const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')

watchEffect(() => {
  if (user.value) navigateTo(redirectCookie.pluck() || '/')
})

function message(raw: string) {
  if (/invalid login/i.test(raw)) return 'Username o password non corretti.'
  if (/rate limit|too many/i.test(raw)) return 'Troppi tentativi. Riprova tra qualche minuto.'
  return 'Qualcosa non ha funzionato. Riprova.'
}

async function submit() {
  busy.value = true
  error.value = ''
  // a bare username maps to the reserved address the admin created it with (same rule as server/utils/username.ts)
  const id = email.value.trim().toLowerCase()
  const { error: e } = await client.auth.signInWithPassword({ email: id.includes('@') ? id : `${id}@rall.invalid`, password: password.value })
  if (e) error.value = message(e.message)
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
      <FormField id="email" label="Username o email" v-slot="{ describedBy }">
        <input id="email" v-model="email" class="input" type="text" name="email" autocomplete="username" autocapitalize="none" spellcheck="false"
          required :aria-describedby="describedBy">
      </FormField>
      <FormField id="password" label="Password" :error="error" v-slot="{ describedBy, invalid }">
        <input id="password" v-model="password" class="input" type="password" name="password" autocomplete="current-password"
          required :aria-invalid="invalid" :aria-describedby="describedBy">
      </FormField>
      <button class="btn btn-primary btn-block" type="submit" :disabled="busy">Entra</button>
      <p class="muted help">Password dimenticata? Chiedila a chi gestisce il sito.</p>
    </form>

    <p class="muted quote intro d3">Quello che succede nello spogliatoio resta nello spogliatoio.</p>
  </div>
</template>

<style scoped>
.brand { font-size: var(--fs-h1); margin-bottom: var(--space-2); }
.help { font-size: var(--fs-sm); text-align: center; }
.quote { font-size: var(--fs-sm); font-style: italic; }
</style>
