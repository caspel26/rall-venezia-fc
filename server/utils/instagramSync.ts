import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/database'
import { captionToArticle, isAllowedImageHost } from './instagramCaption'

type Admin = SupabaseClient<Database>

interface IgMedia {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url?: string
  thumbnail_url?: string
  permalink: string
  timestamp: string
}

export const apiBase = () => process.env.INSTAGRAM_API_BASE || 'https://graph.instagram.com'

export interface SyncResult {
  imported: number
  refreshed: boolean
  username: string | null
}

const REFRESH_WITHIN_MS = 10 * 24 * 3600 * 1000
const MIN_TOKEN_AGE_MS = 24 * 3600 * 1000

async function igFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = `${apiBase()}${path}?${new URLSearchParams(params)}`
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
  const json = await res.json().catch(() => ({})) as T & { error?: { message?: string } }
  if (!res.ok) throw new Error(json.error?.message ?? `Instagram API ${res.status}`)
  return json
}

/** Check a pasted token and return the account it belongs to. */
export async function inspectToken(token: string) {
  return igFetch<{ id: string; username: string }>('/me', { fields: 'id,username', access_token: token })
}

/** Long-lived tokens last 60 days and can be refreshed (after 24h) any time before they expire. */
export async function refreshToken(token: string) {
  return igFetch<{ access_token: string; expires_in: number }>('/refresh_access_token', {
    grant_type: 'ig_refresh_token', access_token: token,
  })
}

async function storeCover(admin: Admin, media: IgMedia): Promise<string | null> {
  const src = media.media_type === 'VIDEO' ? (media.thumbnail_url ?? media.media_url) : media.media_url
  if (!src || !isAllowedImageHost(src, apiBase())) return null
  // no redirects: the host check above is only valid for the URL we were given
  const res = await fetch(src, { signal: AbortSignal.timeout(20_000), redirect: 'error' })
  const type = res.headers.get('content-type') ?? ''
  if (!res.ok || !type.startsWith('image/')) return null
  const bytes = new Uint8Array(await res.arrayBuffer())
  if (bytes.byteLength > 8 * 1024 * 1024) return null
  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg'
  const path = `instagram/${media.id}.${ext}`
  const { error } = await admin.storage.from('graphics').upload(path, bytes, { contentType: type, upsert: true })
  return error ? null : path
}

/** Import posts we have not seen yet as published Gazzetta articles; refresh the token when due. */
export async function syncInstagram(admin: Admin): Promise<SyncResult> {
  const { data: conn } = await admin.from('instagram_connection').select('*').maybeSingle()
  if (!conn) throw new Error('not_connected')

  try {
    let token = conn.access_token
    let refreshed = false
    const now = Date.now()
    const expiresAt = conn.expires_at ? new Date(conn.expires_at).getTime() : null
    const age = now - new Date(conn.token_refreshed_at).getTime()
    if (expiresAt && expiresAt - now < REFRESH_WITHIN_MS && age > MIN_TOKEN_AGE_MS) {
      const r = await refreshToken(token)
      token = r.access_token
      refreshed = true
      await admin.from('instagram_connection').update({
        access_token: token, token_refreshed_at: new Date().toISOString(),
        expires_at: new Date(now + r.expires_in * 1000).toISOString(),
      }).eq('id', true)
    }

    const feed = await igFetch<{ data: IgMedia[] }>('/me/media', {
      fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp', limit: '12', access_token: token,
    })
    const posts = feed.data ?? []
    const { data: known } = await admin.from('news_articles').select('external_id').in('external_id', posts.map((p) => p.id))
    const seen = new Set((known ?? []).map((k) => k.external_id))

    let imported = 0
    let insertError: string | null = null
    // oldest first so the newest ends up on top
    for (const m of posts.filter((p) => !seen.has(p.id)).reverse()) {
      const a = captionToArticle(m.caption)
      const cover = await storeCover(admin, m).catch(() => null)
      const { error } = await admin.from('news_articles').insert({
        slug: `ig-${m.id}`, kicker: 'DA INSTAGRAM', title: a.title, summary: a.summary, body: a.body,
        cover_path: cover, source: 'instagram', external_id: m.id, external_url: m.permalink,
        published_at: m.timestamp, author_name: 'Social media team',
      })
      if (error) insertError = error.message
      else imported++
    }

    await admin.from('instagram_connection').update({ last_synced_at: new Date().toISOString(), last_error: insertError }).eq('id', true)
    return { imported, refreshed, username: conn.username }
  } catch (e) {
    await admin.from('instagram_connection').update({ last_error: (e as Error).message.slice(0, 300) }).eq('id', true)
    throw e
  }
}
