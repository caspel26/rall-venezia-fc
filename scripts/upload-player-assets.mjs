// Uploads private-assets/players/<slug>/{portrait,hero,thumb}.webp to the private `player-photos` bucket
// and points each player at them. Works against local Supabase or production (set the env accordingly):
//   node --env-file=.env scripts/upload-player-assets.mjs
// The service key is only read here, on your machine; it never goes anywhere near the app bundle.
import { readdir, readFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SECRET_KEY
if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required')
const admin = createClient(url, key, { auth: { persistSession: false } })

for (const [root, table] of [['private-assets/players', 'players'], ['private-assets/staff', 'staff_members']]) {
const slugs = await readdir(root).catch(() => [])
for (const slug of slugs) {
  const files = { portrait: 'portrait.webp', half: 'half.webp', hero: 'hero.webp', thumb: 'thumb.webp' }
  for (const f of Object.values(files)) {
    const body = await readFile(`${root}/${slug}/${f}`).catch(() => null)
    if (!body) { console.log(`skip ${slug}/${f} (missing, run scripts/build-player-assets.sh)`); continue }
    const { error } = await admin.storage.from('player-photos').upload(`${table === 'staff_members' ? 'staff/' : ''}${slug}/${f}`, body, { contentType: 'image/webp', upsert: true })
    if (error) throw error
  }
  const folder = table === 'staff_members' ? `staff/${slug}` : slug
  const { data, error } = await admin.from(table)
    .update(table === 'staff_members' ? { photo_path: `${folder}/${files.portrait}` } : { photo_path: `${slug}/${files.portrait}`, avatar_path: `${slug}/${files.thumb}` })
    .eq('slug', slug).select('id')
  if (error) throw error
  console.log(data?.length ? `ok   ${slug}` : `no player with slug ${slug}`)
}
}

// official club crests (private-assets/logos/<slug>.png, fetched from public sources, never committed) -> teams/<slug>.png
for (const f of await readdir('private-assets/logos').catch(() => [])) {
  if (!f.endsWith('.png')) continue
  const { error } = await admin.storage.from('player-photos').upload(`teams/${f}`, await readFile(`private-assets/logos/${f}`), { contentType: 'image/png', upsert: true })
  if (error) throw error
  console.log(`ok   logo ${f}`)
}
