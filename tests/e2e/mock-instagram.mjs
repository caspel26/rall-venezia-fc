// Minimal stand-in for graph.instagram.com so the sync can be tested end to end without a Meta account.
import { createServer } from 'node:http'

const PORT = 3199
const GOOD = 'IGMOCKTOKEN_valid_0123456789abcdef'
let run = Date.now().toString(36) // post ids; POST /__reset issues new ones (the DB keeps imported posts)
// 1x1 PNG
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==', 'base64')

const posts = (base) => [
  { id: `${run}1`, caption: 'Tre punti pesantissimi! Vittoria 10-5 contro il Monza.\nMVP Marigliano.\n\n#rallvenezia #futsal', media_type: 'IMAGE', media_url: `${base}/img/1.png`, permalink: 'https://www.instagram.com/p/MOCK1/', timestamp: new Date(Date.now() - 3600_000).toISOString() },
  { id: `${run}2`, caption: 'Domani si torna in campo', media_type: 'VIDEO', thumbnail_url: `${base}/img/2.png`, media_url: `${base}/video.mp4`, permalink: 'https://www.instagram.com/reel/MOCK2/', timestamp: new Date(Date.now() - 60_000).toISOString() },
]

createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const base = `http://127.0.0.1:${PORT}`
  const json = (code, body) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)) }
  if (req.method === 'POST' && url.pathname === '/__reset') { run = Date.now().toString(36); return json(200, { run }) }
  if (url.pathname.startsWith('/img/')) { res.writeHead(200, { 'content-type': 'image/png' }); return res.end(PNG) }
  if (url.searchParams.get('access_token') !== GOOD) return json(400, { error: { message: 'Invalid OAuth access token.' } })
  if (url.pathname === '/me') return json(200, { id: '17841400000000000', username: 'rallvenezia_mock' })
  if (url.pathname === '/me/media') return json(200, { data: posts(base) })
  if (url.pathname === '/refresh_access_token') return json(200, { access_token: GOOD, token_type: 'bearer', expires_in: 5184000 })
  json(404, { error: { message: 'not found' } })
}).listen(PORT, '127.0.0.1')
