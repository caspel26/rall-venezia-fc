<script setup lang="ts">
import type { Database } from '~/types/database'
import { ROLE_LABELS, type Role } from '~/types/domain'

definePageMeta({ roles: ['admin'] })
useHead({ title: 'Utenti · Admin' })
const client = useSupabaseClient<Database>()
const { user } = useAuth()

const { data, refresh, status } = useAsyncData('admin-users', async () => {
  const [profiles, roles, players] = await Promise.all([
    client.from('profiles').select('*').order('email'),
    client.from('user_roles').select('user_id, role'),
    client.from('players').select('first_name, last_name, profile_id').not('profile_id', 'is', null),
  ])
  const roleOf = new Map((roles.data ?? []).map((r) => [r.user_id, r.role as Role]))
  const playerOf = new Map((players.data ?? []).map((p) => [p.profile_id!, fullName(p)]))
  return (profiles.data ?? []).map((p) => ({ ...p, role: roleOf.get(p.id) ?? 'viewer', player: playerOf.get(p.id) ?? null }))
}, { lazy: true })

const account = reactive({ username: '', name: '', role: 'player' as Role, password: '' })
const issued = ref<{ who: string; password: string } | null>(null)
async function createAccount() {
  msg.value = null
  issued.value = null
  busy.value = true
  try {
    const r = await $fetch<{ username: string; password: string }>('/api/admin/create-user', {
      method: 'POST', body: { username: account.username, role: account.role, displayName: account.name, password: account.password || undefined },
    })
    issued.value = { who: r.username, password: r.password }
    account.username = account.name = account.password = ''
    await refresh()
  } catch (e) {
    const code = (e as { statusMessage?: string }).statusMessage ?? ''
    msg.value = { kind: 'bad', text: code === 'invalid_username' ? 'Username: da 3 a 30 caratteri, minuscole, numeri, punto, trattino.' : code === 'weak_password' ? 'La password deve avere almeno 8 caratteri.' : /already|registered/i.test(code) ? 'Questo username esiste già.' : 'Non siamo riusciti a creare l’account.' }
  } finally {
    busy.value = false
  }
}
async function resetPassword(id: string, who: string) {
  msg.value = null
  try {
    const r = await $fetch<{ password: string }>(`/api/admin/users/${id}/password`, { method: 'POST', body: {} })
    issued.value = { who, password: r.password }
  } catch {
    msg.value = { kind: 'bad', text: 'Non siamo riusciti a reimpostare la password.' }
  }
}
const shown = (email: string) => email.replace(/@rall\.invalid$/, '')

const invite = reactive({ email: '', name: '', role: 'player' as Role })
const msg = ref<{ kind: 'ok' | 'bad'; text: string } | null>(null)
const busy = ref(false)
const ROLES = Object.entries(ROLE_LABELS) as [Role, string][]

async function sendInvite() {
  msg.value = null
  busy.value = true
  try {
    await $fetch('/api/admin/invite', { method: 'POST', body: { email: invite.email, role: invite.role, displayName: invite.name } })
    msg.value = { kind: 'ok', text: `Invito inviato a ${invite.email}.` }
    invite.email = invite.name = ''
    await refresh()
  } catch (e) {
    const code = (e as { statusMessage?: string }).statusMessage ?? ''
    msg.value = { kind: 'bad', text: code === 'invalid_email' ? 'Email non valida.' : 'Non siamo riusciti a inviare l’invito.' }
  } finally {
    busy.value = false
  }
}

async function setRole(id: string, role: Role) {
  msg.value = null
  const { error } = await client.from('user_roles').update({ role }).eq('user_id', id)
  msg.value = error
    ? { kind: 'bad', text: /last_admin/.test(error.message) ? 'Deve restare almeno un admin.' : 'Non siamo riusciti a cambiare il ruolo.' }
    : { kind: 'ok', text: 'Ruolo aggiornato.' }
  await refresh()
}

const confirming = ref('')
async function remove(id: string) {
  msg.value = null
  try {
    await $fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    msg.value = { kind: 'ok', text: 'Utente rimosso.' }
  } catch {
    msg.value = { kind: 'bad', text: 'Non è stato possibile rimuovere l’utente (deve restare almeno un admin).' }
  }
  confirming.value = ''
  await refresh()
}
</script>

<template>
  <div class="page">
    <PageHero eyebrow="Admin" title="Utenti" lead="Nessuna registrazione pubblica: gli account li crea l’admin." />
    <AdminTabs />

    <section class="panel" aria-labelledby="inv">
      <h2 id="inv" class="eyebrow">Invita un membro</h2>
      <form class="form-grid" novalidate @submit.prevent="sendInvite">
        <FormField id="iemail" label="Email" v-slot="{ describedBy }"><input id="iemail" v-model="invite.email" class="input" type="email" inputmode="email" autocomplete="off" required :aria-describedby="describedBy"></FormField>
        <FormField id="iname" label="Nome (facoltativo)" v-slot="{ describedBy }"><input id="iname" v-model="invite.name" class="input" autocomplete="off" :aria-describedby="describedBy"></FormField>
        <FormField id="irole" label="Ruolo" v-slot="{ describedBy }">
          <select id="irole" v-model="invite.role" class="input" :aria-describedby="describedBy"><option v-for="[v, l] in ROLES" :key="v" :value="v">{{ l }}</option></select>
        </FormField>
        <div><button class="btn btn-primary" type="submit" :disabled="busy">Invia invito</button></div>
      </form>
    </section>

 <section class="panel" aria-labelledby="acc">
      <h2 id="acc" class="eyebrow">Nuovo account con username e password</h2>
      <form class="form-grid" novalidate @submit.prevent="createAccount">
        <FormField id="auser" label="Username" v-slot="{ describedBy }"><input id="auser" v-model="account.username" class="input" autocomplete="off" autocapitalize="none" required :aria-describedby="describedBy"></FormField>
        <FormField id="aname" label="Nome (facoltativo)" v-slot="{ describedBy }"><input id="aname" v-model="account.name" class="input" autocomplete="off" :aria-describedby="describedBy"></FormField>
        <FormField id="arole" label="Ruolo" v-slot="{ describedBy }">
          <select id="arole" v-model="account.role" class="input" :aria-describedby="describedBy"><option v-for="[v, l] in ROLES" :key="v" :value="v">{{ l }}</option></select>
        </FormField>
        <FormField id="apass" label="Password (vuota = ne generiamo una)" v-slot="{ describedBy }"><input id="apass" v-model="account.password" class="input" autocomplete="off" :aria-describedby="describedBy"></FormField>
        <div><button class="btn btn-primary" type="submit" :disabled="busy">Crea account</button></div>
      </form>
    </section>

    <section v-if="issued" class="panel issued" role="status">
      <p class="eyebrow">Password per {{ issued.who }} (si vede solo ora)</p>
      <p class="pw display">{{ issued.password }}</p>
    </section>

    <p v-if="msg" class="notice msg" :class="msg.kind" role="status">{{ msg.text }}</p>

    <SkeletonBlock v-if="status === 'pending' && !data" size="lg" />
    <TransitionGroup v-else tag="ul" name="vlist" class="users" aria-label="Utenti">
      <li v-for="u in data" :key="u.id" class="u">
        <div class="who">
          <p class="nm">{{ u.display_name || shown(u.email) }}</p>
          <p class="muted sm">{{ shown(u.email) }}<template v-if="u.player"> · giocatore: {{ u.player }}</template></p>
        </div>
        <select class="input rsel" :aria-label="`Ruolo di ${u.email}`" :value="u.role" @change="setRole(u.id, ($event.target as HTMLSelectElement).value as Role)">
          <option v-for="[v, l] in ROLES" :key="v" :value="v">{{ l }}</option>
        </select>
        <button type="button" class="btn btn-sm" @click="resetPassword(u.id, u.display_name || shown(u.email))">Nuova password</button>
        <template v-if="u.id !== user?.sub">
          <button v-if="confirming !== u.id" type="button" class="btn btn-sm btn-danger" @click="confirming = u.id">Rimuovi</button>
          <button v-else type="button" class="btn btn-sm btn-danger" @click="remove(u.id)">Conferma</button>
        </template>
      </li>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.issued { margin-top: var(--space-4); }
.pw { font-size: var(--fs-h2); letter-spacing: .08em; user-select: all; }
.msg { margin: var(--space-4) 0; }
.users { position: relative; list-style: none; margin: var(--space-5) 0 0; padding: 0; display: grid; gap: var(--space-2); }
.u { display: grid; gap: var(--space-2); padding: var(--space-3) 0; border-bottom: 1px solid var(--rv-line); align-items: center; }
.nm { font-weight: var(--fw-ui); overflow-wrap: anywhere; }
.sm { font-size: var(--fs-sm); overflow-wrap: anywhere; }
.rsel { max-width: 200px; }
@media (min-width: 701px) { .u { grid-template-columns: 1fr 200px auto auto; gap: var(--space-4); } }
</style>
