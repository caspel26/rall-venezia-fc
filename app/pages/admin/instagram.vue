<script setup lang="ts">
definePageMeta({ roles: ['admin'] })
useHead({ title: 'Instagram · Admin' })

interface Status { connected: boolean; username?: string; expires_at?: string; last_synced_at?: string; last_error?: string }
const { data: st, refresh, status } = useAsyncData('ig-status', () => $fetch<Status>('/api/admin/instagram'), { lazy: true })

const token = ref('')
const busy = ref(false)
const msg = ref<{ kind: 'ok' | 'bad'; text: string } | null>(null)

const when = (iso?: string) => (iso ? `${formatShortDay(iso)} ${formatTime(iso)}` : '–')
const daysLeft = computed(() => (st.value?.expires_at ? Math.ceil((new Date(st.value.expires_at).getTime() - Date.now()) / 86_400_000) : null))

async function connect() {
  msg.value = null
  busy.value = true
  try {
    const r = await $fetch<{ username: string }>('/api/admin/instagram/connect', { method: 'POST', body: { token: token.value } })
    token.value = ''
    msg.value = { kind: 'ok', text: `Collegato a @${r.username}.` }
    await refresh()
  } catch (e) {
    const code = (e as { statusMessage?: string }).statusMessage
    msg.value = { kind: 'bad', text: code === 'token_rejected' ? 'Instagram ha rifiutato il token.' : 'Token non valido.' }
  } finally {
    busy.value = false
  }
}

async function sync() {
  msg.value = null
  busy.value = true
  try {
    const r = await $fetch<{ imported: number }>('/api/instagram/sync', { method: 'POST' })
    msg.value = { kind: 'ok', text: r.imported ? `${r.imported} nuovi post importati in Gazzetta.` : 'Nessun nuovo post.' }
  } catch {
    msg.value = { kind: 'bad', text: 'Sincronizzazione non riuscita. Controlla il collegamento.' }
  } finally {
    busy.value = false
    await refresh()
  }
}

const confirming = ref(false)
async function disconnect() {
  await $fetch('/api/admin/instagram', { method: 'DELETE' })
  confirming.value = false
  await refresh()
}
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Admin" title="Instagram" lead="Ogni nuovo post diventa un articolo in Gazzetta: la copertina è la prima immagine, la didascalia è il testo." />
    <AdminTabs />

    <SkeletonBlock v-if="status === 'pending' && !st" size="lg" />
    <section v-else class="panel stack" aria-labelledby="st">
      <h2 id="st" class="eyebrow">Collegamento</h2>
      <template v-if="st?.connected">
        <p><strong>@{{ st.username }}</strong> collegato<span v-if="daysLeft != null" class="muted"> · il token si rinnova da solo, scade tra {{ daysLeft }} giorni se non viene usato</span></p>
        <p class="muted">Ultima sincronizzazione: {{ when(st.last_synced_at) }}</p>
        <p v-if="st.last_error" class="notice bad" role="alert">Ultimo errore: {{ st.last_error }}</p>
        <div class="row-actions">
          <button class="btn btn-primary" type="button" :disabled="busy" @click="sync">Sincronizza ora</button>
          <button v-if="!confirming" class="btn btn-danger" type="button" @click="confirming = true">Scollega</button>
          <button v-else class="btn btn-danger" type="button" @click="disconnect">Conferma</button>
        </div>
      </template>
      <p v-else class="muted">Non collegato. Incolla qui sotto il token di accesso dell’account Instagram (vedi docs/INSTAGRAM.md).</p>

      <form class="form-grid" novalidate @submit.prevent="connect">
        <FormField id="igtoken" :label="st?.connected ? 'Sostituisci il token' : 'Token di accesso'" hint="Non viene mai mostrato di nuovo." v-slot="{ describedBy }">
          <input id="igtoken" v-model="token" class="input" type="password" autocomplete="off" spellcheck="false" :aria-describedby="describedBy">
        </FormField>
        <div><button class="btn" type="submit" :disabled="busy || !token">Collega</button></div>
      </form>
    </section>

    <p v-if="msg" class="notice msg" :class="msg.kind" role="status">{{ msg.text }}</p>
  </div>
</template>

<style scoped>
.stack { display: grid; gap: var(--space-4); }
.msg { margin-top: var(--space-4); }
</style>
