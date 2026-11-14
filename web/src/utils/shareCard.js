// Carte de résultat en image — dessinée sur un canvas, à envoyer dans la messagerie du groupe.
// Les couleurs et la police viennent des tokens CSS : la carte suit le Design System.
import { matchBadge } from './comparison'
import { recordTitle, recordSubtitle, formatDate } from './text'

const WIDTH = 1080
const HEIGHT = 1350
const MARGIN = 84
const ROW_HEIGHT = 124
const MAX_ROWS = 6
const BADGE_TOKENS = { match: '--match', close: '--close', miss: '--miss' }

const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

// Coupe un texte en lignes qui tiennent dans `maxWidth` ; au-delà de `maxLines`, la dernière finit par "…"
function wrap(context, text, maxWidth, maxLines) {
  const lines = []
  for (const word of String(text).split(/\s+/)) {
    const last = lines[lines.length - 1]
    if (last !== undefined && context.measureText(`${last} ${word}`).width <= maxWidth) lines[lines.length - 1] = `${last} ${word}`
    else lines.push(word)
  }
  if (lines.length <= maxLines) return lines
  const kept = lines.slice(0, maxLines)
  let tail = kept[maxLines - 1]
  while (tail.length > 1 && context.measureText(`${tail}…`).width > maxWidth) tail = tail.slice(0, -1)
  kept[maxLines - 1] = `${tail}…`
  return kept
}

// rows : [{ label, hypo, match }] · summary, footer : textes déjà composés
export async function buildShareImage(record, { rows, summary, footer }) {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const c = canvas.getContext('2d')
  const font = token('--font') || 'sans-serif'
  const set = (weight, size, color) => { c.font = `${weight} ${size}px ${font}`; c.fillStyle = token(color) }
  const inner = WIDTH - MARGIN * 2

  c.fillStyle = token('--bg')
  c.fillRect(0, 0, WIDTH, HEIGHT)
  c.fillStyle = token('--primary')
  c.fillRect(0, 0, WIDTH, 18)

  c.textBaseline = 'alphabetic'
  set(700, 40, '--primary')
  c.fillText('MyWine', MARGIN, 130)
  set(500, 34, '--text-secondary')
  const context = record.session?.role === 'guest' ? `Dégustation à l'aveugle chez ${record.session.hostName}` : 'Dégustation à l\'aveugle'
  c.fillText(context, MARGIN, 186)

  // La bouteille
  let y = 300
  set(700, 76, '--text')
  for (const line of wrap(c, recordTitle(record), inner, 2)) { c.fillText(line, MARGIN, y); y += 88 }
  set(400, 38, '--text-secondary')
  c.fillText(wrap(c, recordSubtitle(record), inner, 1)[0], MARGIN, y - 18)
  y += 50

  // Le résumé, dans une pastille
  if (summary) {
    set(600, 40, '--primary')
    const width = c.measureText(summary).width + 72
    c.fillStyle = token('--primary-subtle')
    c.beginPath()
    c.roundRect(MARGIN, y - 54, width, 84, 42)
    c.fill()
    c.fillStyle = token('--primary')
    c.fillText(summary, MARGIN + 36, y)
    y += 96
  }

  // Une ligne par réponse : pastille de couleur, champ, hypothèse, verdict
  for (const row of rows.slice(0, MAX_ROWS)) {
    const badge = matchBadge(row.match)
    c.fillStyle = token('--border')
    c.fillRect(MARGIN, y, inner, 2)
    c.fillStyle = token(BADGE_TOKENS[badge.color])
    c.beginPath()
    c.arc(MARGIN + 18, y + 64, 18, 0, Math.PI * 2)
    c.fill()
    set(500, 30, '--text-secondary')
    c.fillText(row.label.toUpperCase(), MARGIN + 64, y + 50)
    set(600, 42, BADGE_TOKENS[badge.color])
    const verdictWidth = c.measureText(badge.label).width
    c.fillText(badge.label, WIDTH - MARGIN - verdictWidth, y + 98)
    set(600, 42, '--text')
    c.fillText(wrap(c, row.hypo, inner - 64 - verdictWidth - 32, 1)[0], MARGIN + 64, y + 98)
    y += ROW_HEIGHT
  }

  set(400, 32, '--text-secondary')
  c.fillText([footer, formatDate(record.tastedAt || record.createdAt)].filter(Boolean).join(' · '), MARGIN, HEIGHT - 72)

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
}
