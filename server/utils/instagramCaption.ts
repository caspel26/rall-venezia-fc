export interface CaptionArticle {
  title: string
  summary: string | null
  body: string
}

const TITLE_MAX = 90

/** Lines made only of hashtags / mentions (the usual caption footer). */
const isTagLine = (l: string) => /^(\s*[#@][\p{L}\p{N}_.]+\s*)+$/u.test(l)

/**
 * Turn an Instagram caption into a Gazzetta article: first sentence/line as the headline,
 * the rest as the body, trailing hashtag lines dropped. Plain text only.
 */
export function captionToArticle(caption: string | null | undefined): CaptionArticle {
  const lines = (caption ?? '').replace(/\r/g, '').split('\n').map((l) => l.trim())
  while (lines.length && (lines[lines.length - 1] === '' || isTagLine(lines[lines.length - 1]!))) lines.pop()
  const text = lines.join('\n').trim()
  if (!text) return { title: 'Dal profilo Instagram', summary: null, body: 'Nuovo post sul profilo Instagram del Rall Venezia.' }

  const first = lines.find((l) => l) ?? ''
  const sentenceEnd = first.search(/[.!?](\s|$)/)
  let title = sentenceEnd > 15 ? first.slice(0, sentenceEnd + 1) : first
  if (title.length > TITLE_MAX) title = `${title.slice(0, TITLE_MAX - 1).replace(/\s+\S*$/, '')}…`
  const rest = text.slice(text.indexOf(first) + title.replace(/…$/, '').length).trim()
  const body = rest || text
  const summary = rest ? (rest.split('\n')[0]!.slice(0, 180) || null) : null
  return { title, summary, body: rest ? rest : text }
}

/** Only fetch cover images from Instagram's own CDNs (or the dev mock). */
export function isAllowedImageHost(url: string, apiBase: string): boolean {
  try {
    const u = new URL(url)
    if (u.origin === new URL(apiBase).origin && apiBase !== 'https://graph.instagram.com') return true
    return u.protocol === 'https:' && /(^|\.)(cdninstagram\.com|fbcdn\.net)$/.test(u.hostname)
  } catch {
    return false
  }
}
