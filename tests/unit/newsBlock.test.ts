import { describe, expect, it } from 'vitest'
import { parseNewsBlock } from '../../app/utils/newsBlock'

const sample = `Ecco il post!
SCHEDA SITO
CATEGORIA: partita
OCCHIELLO: GIORNATA 9
TITOLO: Il Rall travolge il Monza 10-5
SOMMARIO: Dieci gol e tre punti portati a casa.
PARTITA: Monza
TESTO:
Serata da incorniciare al Palazzetto.

Verrone firma una tripletta.
Daniele Nappo chiude la porta: MVP.`

describe('parseNewsBlock', () => {
  it('reads every field and keeps the body paragraphs', () => {
    const b = parseNewsBlock(sample)
    expect(b.category).toBe('partita')
    expect(b.kicker).toBe('GIORNATA 9')
    expect(b.title).toBe('Il Rall travolge il Monza 10-5')
    expect(b.summary).toBe('Dieci gol e tre punti portati a casa.')
    expect(b.match).toBe('Monza')
    expect(b.body).toBe('Serata da incorniciare al Palazzetto.\n\nVerrone firma una tripletta.\nDaniele Nappo chiude la porta: MVP.')
  })
  it('ignores case, bold markers and the text before the first label', () => {
    const b = parseNewsBlock('**Titolo:** Prova\n**Testo:**\nUno.\n\nDue.')
    expect(b.title).toBe('Prova')
    expect(b.body).toBe('Uno.\n\nDue.')
  })
  it('does not treat a colon inside the body as a new field', () => {
    const b = parseNewsBlock('TITOLO: X\nTESTO:\nRisultato: 10-5 per noi.\nTitolo: non è un campo qui.')
    expect(b.body).toContain('Risultato: 10-5 per noi.')
    expect(b.body).toContain('Titolo: non è un campo qui.')
    expect(b.title).toBe('X')
  })
})
