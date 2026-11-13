// Creates the club's accounts (username + password) against whatever Supabase the env points at:
//   node --env-file=.env scripts/create-members.mjs
// Only the admin edits; everyone else is a `player` (answers availability and votes the poll). Accounts that exist are
// skipped. Generated passwords are written to private-assets/credentials.txt (gitignored) and never printed.
import { mkdir, writeFile } from 'node:fs/promises'
import { randomInt } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SECRET_KEY
if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required')
const admin = createClient(url, key, { auth: { persistSession: false } })

const DOMAIN = 'rall.invalid' // keep in sync with server/utils/username.ts and the login page
const members = [
  { username: 'g.casillo', name: 'Giuseppe Casillo', role: 'admin' },
  { username: 'daniele.nappo', name: 'Daniele Nappo', role: 'player', player: 'daniele-nappo' },
  { username: 'antonio.verrone', name: 'Antonio Verrone', role: 'player', player: 'antonio-verrone' },
  { username: 'raffaele.miranda', name: 'Raffaele Miranda', role: 'player', player: 'raffaele-miranda' },
  { username: 'alfonso.avino', name: 'Alfonso Avino', role: 'player', player: 'alfonso-avino' },
  { username: 'salvatore.marigliano', name: 'Salvatore Marigliano', role: 'player', player: 'salvatore-marigliano' },
  { username: 'sergio.batti', name: 'Sergio Batti', role: 'player', player: 'sergio-batti' },
  { username: 'francesco.ferrara', name: 'Francesco Ferrara', role: 'player', player: 'francesco-ferrara' },
  { username: 'francesco.sepe', name: 'Francesco Sepe', role: 'player', player: 'francesco-sepe' },
  { username: 'pasquale.gallo', name: 'Pasquale Gallo', role: 'player' },
  { username: 'benito.marciano', name: 'Benito Marciano', role: 'player' },
  { username: 'alessandro.nappo', name: 'Alessandro Nappo', role: 'player' },
]

const alphabet = 'abcdefghjkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ23456789'
const password = () => Array.from({ length: 12 }, () => alphabet[randomInt(alphabet.length)]).join('')

const lines = []
for (const m of members) {
  const email = `${m.username}@${DOMAIN}`
  const pw = password()
  const { data, error } = await admin.auth.admin.createUser({ email, password: pw, email_confirm: true, user_metadata: { display_name: m.name } })
  if (error) { console.log(`skip ${m.username}: ${error.message}`); continue }
  const { error: roleError } = await admin.from('user_roles').update({ role: m.role }).eq('user_id', data.user.id)
  if (roleError) throw roleError
  if (m.player) {
    const { error: linkError } = await admin.from('players').update({ profile_id: data.user.id }).eq('slug', m.player)
    if (linkError) throw linkError
  }
  lines.push(`${m.username}\t${pw}\t${m.role}`)
  console.log(`ok   ${m.username} (${m.role})`)
}
if (lines.length) {
  await mkdir('private-assets', { recursive: true })
  await writeFile('private-assets/credentials.txt', `username\tpassword\truolo\n${lines.join('\n')}\n`, { mode: 0o600 })
  console.log('passwords written to private-assets/credentials.txt')
}
