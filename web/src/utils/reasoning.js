// Raisonnement embarqué — guide le joueur à partir de ce qu'il a lui-même noté.
// On croise ses notes (tanins, corps, acidité, arômes, maturité du fruit) avec la base de cépages
// pour proposer un climat probable et des cépages compatibles, chacun avec ses raisons.
// Rien ici ne lit la vraie bouteille : ce raisonnement ne peut donc rien révéler.
// Ce sont des tendances : on propose des pistes, on ne corrige pas.
import { GRAPES, findGrape } from '../data/wineKnowledge'
import { perceivedOf, flavorPoint } from './profile'

// ─── Lecture des notes sur des axes communs ──────────────────────────────────

const TANNIN = { t1: 'faible', t2: 'faible', t3: 'moyen', t4: 'fort', t5: 'fort' }
const ACIDITY_RED = { faible: 'faible', moyenne: 'moyenne', fraiche: 'haute' }
const ACIDITY_WHITE = { plate: 'faible', souple: 'faible', fraiche: 'moyenne', vive: 'haute', tranchante: 'haute' }
const BODY_WHITE = { legere: 'leger', souple: 'moyen', onctueuse: 'ample', grasse: 'ample' }

const SCALES = {
  tannin: ['faible', 'moyen', 'fort'],
  body: ['leger', 'moyen', 'ample'],
  acidity: ['faible', 'moyenne', 'haute'],
}
// Comment on redit au joueur ce qu'il a noté
const NOTE_PHRASES = {
  tannin: { faible: 'des tanins discrets', moyen: 'des tanins présents', fort: 'des tanins marqués' },
  body: { leger: 'un corps léger', moyen: 'un corps moyen', ample: 'un corps ample' },
  acidity: { faible: 'peu d\'acidité', moyenne: 'une acidité moyenne', haute: 'une acidité vive' },
  maturity: { frais: 'un fruit frais', mur: 'un fruit mûr', cuit: 'un fruit cuit ou confit' },
}
const AXIS_LABELS = { tannin: 'tanins', body: 'corps', acidity: 'acidité' }

// Le raisonnement ne vaut que pour les rouges et les blancs tranquilles : les profils de cépage
// de la base décrivent ces vins-là.
function colorOf(wineType) {
  return wineType === 'rouge' || wineType === 'blanc' ? wineType : null
}

export function readNotes(record) {
  const color = colorOf(record.wineType)
  const data = record.structure?.v === 2 ? (record.structure.data ?? {}) : {}
  const notes = { color, aromas: record.perception?.aromaFamilies ?? [] }
  if (color === 'rouge') {
    notes.tannin = TANNIN[data.taninIntensity]
    notes.body = data.body
    notes.acidity = ACIDITY_RED[data.acidity]
    notes.maturity = NOTE_PHRASES.maturity[data.fruitMaturity] ? data.fruitMaturity : undefined
  } else if (color === 'blanc') {
    notes.body = BODY_WHITE[data.texture]
    notes.acidity = ACIDITY_WHITE[data.acidity]
  }
  return notes
}

// Ce que le joueur a noté, en mots : ['des tanins discrets', 'un corps léger', 'des arômes de fruits rouges']
function notePhrases(notes) {
  const phrases = ['tannin', 'body', 'acidity', 'maturity']
    .filter(axis => notes[axis])
    .map(axis => NOTE_PHRASES[axis][notes[axis]])
  if (notes.aromas.length) phrases.push(`des arômes (${notes.aromas.slice(0, 3).join(', ').toLowerCase()})`)
  return phrases
}

// ─── Climat ──────────────────────────────────────────────────────────────────

// Un vin vif et léger évoque un climat frais ; un vin ample, mûr et peu acide, un climat chaud.
function climateLean(notes) {
  const cool = []
  const warm = []
  if (notes.acidity === 'haute') cool.push(NOTE_PHRASES.acidity.haute)
  if (notes.acidity === 'faible') warm.push(NOTE_PHRASES.acidity.faible)
  if (notes.body === 'leger') cool.push(NOTE_PHRASES.body.leger)
  if (notes.body === 'ample') warm.push(NOTE_PHRASES.body.ample)
  if (notes.maturity === 'frais') cool.push(NOTE_PHRASES.maturity.frais)
  if (notes.maturity === 'cuit') warm.push(NOTE_PHRASES.maturity.cuit)
  if (!cool.length && !warm.length) return null
  if (cool.length > warm.length) return { value: 'frais', label: 'plutôt frais', reasons: cool }
  if (warm.length > cool.length) return { value: 'chaud', label: 'plutôt chaud', reasons: warm }
  return { value: 'tempere', label: 'tempéré', reasons: [...cool, ...warm] }
}

// ─── Cépages ─────────────────────────────────────────────────────────────────

// En quoi un cépage colle, ou non, avec les notes du joueur
function fitGrape(grape, notes) {
  const fits = []
  const gaps = []
  let score = 0
  let axes = 0
  for (const axis of ['tannin', 'body', 'acidity']) {
    if (!notes[axis] || !grape[axis]) continue
    axes++
    const distance = Math.abs(SCALES[axis].indexOf(notes[axis]) - SCALES[axis].indexOf(grape[axis]))
    if (distance === 0) { score += 2; fits.push(AXIS_LABELS[axis]) }
    else if (distance === 1) score += 1
    else gaps.push(AXIS_LABELS[axis])
  }
  const shared = notes.aromas.filter(aroma => grape.aromas.includes(aroma))
  if (notes.aromas.length) {
    axes++
    score += Math.min(shared.length, 2)
    fits.push(...shared.slice(0, 2).map(aroma => aroma.toLowerCase()))
  }
  return { grape, fits, gaps, score: axes ? score / (axes * 2) : 0 }
}

// Résultat du raisonnement pour une dégustation en cours.
//   available : le raisonnement s'applique à ce type de vin
//   enough    : le joueur a noté assez de choses pour en tirer quelque chose
//   noted     : ses notes redites en mots · climate : { value, label, reasons } ou null
//   candidates: cépages de la couleur, du plus au moins compatible · styles : styles des meilleurs
export function reason(record) {
  const notes = readNotes(record)
  if (!notes.color) return { available: false, enough: false, noted: [], climate: null, candidates: [], styles: [], fitOf: () => null }
  const noted = notePhrases(notes)
  const signals = ['tannin', 'body', 'acidity'].filter(axis => notes[axis]).length + (notes.aromas.length ? 1 : 0)
  const enough = signals >= 2
  const fitOf = (name) => {
    const grape = findGrape(name)
    return grape && grape.color === notes.color && enough ? fitGrape(grape, notes) : null
  }
  const candidates = enough
    ? GRAPES.filter(g => g.color === notes.color).map(g => fitGrape(g, notes)).sort((a, b) => b.score - a.score)
    : []
  const styles = [...new Set(candidates.slice(0, 3).map(c => c.grape.style))].slice(0, 2)
  // point : où ses notes le placent sur la carte des saveurs (null s'il manque la matière ou l'acidité)
  const point = flavorPoint(perceivedOf(record), notes.color)
  return { available: true, enough, color: notes.color, noted, climate: climateLean(notes), candidates, styles, fitOf, point }
}

// "A, B et C"
export function listInWords(items) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`
}
