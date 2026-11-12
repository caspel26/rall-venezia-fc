export interface NewsBlock {
  category: string
  kicker: string
  title: string
  summary: string
  match: string
  body: string
}

const KEYS: Record<string, keyof NewsBlock> = {
  categoria: 'category', category: 'category',
  occhiello: 'kicker', kicker: 'kicker',
  titolo: 'title', title: 'title',
  sommario: 'summary', summary: 'summary',
  partita: 'match', match: 'match',
  testo: 'body', body: 'body',
}

/**
 * Reads the "SCHEDA SITO" block a chat assistant writes next to the Instagram post:
 *   CATEGORIA: partita   OCCHIELLO: ...   TITOLO: ...   SOMMARIO: ...   PARTITA: Monza   TESTO: (everything after, paragraphs split by blank lines)
 * Labels are case-insensitive, anything before the first label (a "SCHEDA SITO" heading, chatter) is ignored, and TESTO takes the rest.
 */
export function parseNewsBlock(text: string): NewsBlock {
  const out: NewsBlock = { category: '', kicker: '', title: '', summary: '', match: '', body: '' }
  const lines = text.replace(/\r/g, '').split('\n')
  let current: keyof NewsBlock | null = null
  const buf: Record<string, string[]> = {}
  for (const line of lines) {
    const m = /^\s*[*_#>-]*\s*([A-Za-zÀ-ÿ]+)\s*[*_]*\s*:\s*[*_]*\s*(.*)$/.exec(line)
    const key = m ? KEYS[m[1]!.toLowerCase()] : undefined
    if (key && current !== 'body') {
      current = key
      buf[key] = [m![2]!.trim()]
    } else if (current) {
      ;(buf[current] ??= []).push(line)
    }
  }
  for (const [k, v] of Object.entries(buf)) {
    const joined = v.join('\n').replace(/\*\*/g, '').trim()
    out[k as keyof NewsBlock] = k === 'body' ? joined.replace(/\n{3,}/g, '\n\n') : joined.replace(/\s+/g, ' ')
  }
  return out
}
