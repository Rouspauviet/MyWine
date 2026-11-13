// Fiche "Pour comprendre" — relie ce que le dégustateur a perçu au profil typique du vin révélé.
// Calculée à l'affichage à partir de la base de connaissances : rien n'est stocké sur la fiche.
// Ton : on explique, on ne note pas. Un écart avec le profil typique n'est jamais une faute.
import { findGrape, findRegion } from '../data/wineKnowledge'

// Ramène la saisie du dégustateur sur l'échelle de la base de connaissances
const TANNIN_LEVEL = { t1: 'faible', t2: 'faible', t3: 'moyen', t4: 'fort', t5: 'fort' }
const RED_ACIDITY = { faible: 'faible', moyenne: 'moyenne', fraiche: 'haute' }
const WHITE_ACIDITY = { plate: 'faible', souple: 'faible', fraiche: 'moyenne', vive: 'haute', tranchante: 'haute' }
const WHITE_BODY = { legere: 'leger', souple: 'moyen', onctueuse: 'ample', grasse: 'ample' }

const RANK = { faible: 0, leger: 0, moyen: 1, moyenne: 1, fort: 2, haute: 2, ample: 2 }
const EXPLANATION = 'Le millésime, l\'âge ou la vinification peuvent l\'expliquer.'

// "le cépage Syrah" plutôt que "le/la Syrah" : évite de se tromper sur le genre des cépages
const du = (name) => `du cépage ${name}`
const le = (name) => `le cépage ${name}`

// Un axe de structure : comment le nommer, et les mots pour chaque niveau
const AXES = {
  tannin: {
    words: { faible: 'discrets', moyen: 'présents', fort: 'marqués' },
    match: (w, g) => `Des tanins ${w} : c'est typique ${du(g)}.`,
    gap: (p, e, g) => `Tu as trouvé les tanins ${p}, alors que ${le(g)} en donne d'habitude de plus ${e}.`,
  },
  body: {
    words: { leger: 'léger', moyen: 'moyen', ample: 'ample' },
    match: (w, g) => `Un corps ${w} : c'est typique ${du(g)}.`,
    gap: (p, e, g) => `Tu as trouvé le corps ${p}, alors que ${le(g)} donne d'habitude un vin plus ${e}.`,
  },
  acidity: {
    words: { faible: 'faible', moyenne: 'moyenne', haute: 'vive' },
    match: (w, g) => `Une acidité ${w} : c'est typique ${du(g)}.`,
    gap: (p, e, g) => `Tu as trouvé l'acidité ${p}, alors que ${le(g)} donne d'habitude une acidité ${e}.`,
  },
}

// Perception identique au profil → confirmation ; opposée → explication ; voisine → on ne dit rien
function axisLine(axisKey, perceived, expected, grapeName) {
  if (!perceived || !expected) return null
  const axis = AXES[axisKey]
  const gap = Math.abs(RANK[perceived] - RANK[expected])
  if (gap === 0) return { kind: 'match', text: axis.match(axis.words[perceived], grapeName) }
  if (gap === 2) return { kind: 'gap', text: `${axis.gap(axis.words[perceived], axis.words[expected], grapeName)} ${EXPLANATION}` }
  return null
}

function structureLines(record, grape) {
  const data = record.structure?.data ?? {}
  if (grape.color === 'rouge' && record.wineType === 'rouge') {
    return [
      axisLine('tannin', TANNIN_LEVEL[data.taninIntensity], grape.tannin, grape.name),
      axisLine('body', data.body, grape.body, grape.name),
      axisLine('acidity', RED_ACIDITY[data.acidity], grape.acidity, grape.name),
    ]
  }
  if (grape.color === 'blanc' && record.wineType === 'blanc') {
    return [
      axisLine('acidity', WHITE_ACIDITY[data.acidity], grape.acidity, grape.name),
      axisLine('body', WHITE_BODY[data.texture], grape.body, grape.name),
    ]
  }
  return []
}

function aromaLine(record, grape) {
  const shared = (record.perception?.aromaFamilies ?? []).filter(a => grape.aromas.includes(a))
  if (!shared.length) return null
  const verdict = shared.length > 1 ? 'Ce sont des marqueurs' : 'C\'est un marqueur'
  return { kind: 'match', text: `Tu as senti : ${shared.join(', ').toLowerCase()}. ${verdict} ${du(grape.name)}.` }
}

// Renvoie null s'il n'y a rien à dire (cépage et région absents de la base)
export function buildLesson(record) {
  const reality = record.reality ?? {}
  const grapes = (reality.grapes ?? []).map(findGrape).filter(Boolean)
  const region = findRegion(reality.region)
  if (!grapes.length && !region) return null

  const main = grapes[0] ?? null
  // Les rapprochements avec la perception n'ont de sens que pour une dégustation à l'aveugle
  const lines = record.mode === 'blind' && main
    ? [...structureLines(record, main), aromaLine(record, main)].filter(Boolean)
    : []

  return {
    grapes: grapes.slice(0, 2).map(g => ({ name: g.name, about: g.about })),
    region: region ? { name: region.name, about: region.about } : null,
    lines,
  }
}
