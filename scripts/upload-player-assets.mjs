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

const root = 'private-assets/players'
for (const slug of await readdir(root)) {
  const files = { portrait: 'portrait.webp', hero: 'hero.webp', thumb: 'thumb.webp' }
  for (const f of Object.values(files)) {
    const body = await readFile(`${root}/${slug}/${f}`).catch(() => null)
    if (!body) { console.log(`skip ${slug}/${f} (missing, run scripts/build-player-assets.sh)`); continue }
    const { error } = await admin.storage.from('player-photos').upload(`${slug}/${f}`, body, { contentType: 'image/webp', upsert: true })
    if (error) throw error
  }
  const { data, error } = await admin.from('players')
    .update({ photo_path: `${slug}/${files.portrait}`, avatar_path: `${slug}/${files.thumb}` })
    .eq('slug', slug).select('id')
  if (error) throw error
  console.log(data?.length ? `ok   ${slug}` : `no player with slug ${slug}`)
}
