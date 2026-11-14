// "Mon palais" — portrait calculé à l'affichage à partir du journal : rien n'est stocké.
// Ni score ni classement : on décrit ce que la personne boit, aime et reconnaît.
import { WINE_TYPES } from '../data/wineData'
import { findGrape, grapeKey } from '../data/wineKnowledge'
import { MAP_REGIONS } from '../data/franceMap'
import { normalize } from './text'
import { buildProfile, PROFILE_AXES } from './profile'

const TOP = 5                 // longueur des classements
const MIN_RATED = 2           // notes nécessaires pour parler d'un cépage ou d'une région "bien notés"
const MIN_LEANING = 3         // dégustations nécessaires pour parler d'un penchant
const LEANING_THRESHOLD = 0.5 // écart moyen (en niveaux) à partir duquel on le signale

// Champs suivis à l'aveugle, dans l'ordre d'affichage
export const BLIND_FIELDS = [
  { key: 'type', label: 'Type' },
  { key: 'country', label: 'Pays' },
  { key: 'region', label: 'Région' },
  { key: 'grapes', label: 'Cépage' },
  { key: 'vintage', label: 'Millésime' },
]

const LEANING_WORDS = {
  tannin: ['les tanins plus discrets', 'les tanins plus marqués'],
  body: ['le corps plus léger', 'le corps plus ample'],
  acidity: ['l\'acidité plus faible', 'l\'acidité plus vive'],
}

// Compte des occurrences, en gardant le premier nom rencontré pour l'affichage
function tally() {
  const map = new Map()
  return {
    add(key, name, rating) {
      if (!key) return
      const entry = map.get(key) ?? { name, value: 0, ratings: [] }
      entry.value++
      if (rating) entry.ratings.push(rating)
      map.set(key, entry)
    },
    top: () => [...map.values()].sort((a, b) => b.value - a.value),
    // Les mieux notés, parmi ceux qui ont assez de notes
    liked: () => [...map.values()]
      .filter(e => e.ratings.length >= MIN_RATED)
      .map(e => ({ name: e.name, value: e.ratings.reduce((s, r) => s + r, 0) / e.ratings.length, count: e.ratings.length }))
      .sort((a, b) => b.value - a.value || b.count - a.count),
  }
}

const canonicalRegion = (name) => MAP_REGIONS.find(r => normalize(r.name) === normalize(name ?? ''))?.name ?? null

export function buildPalate(records) {
  const done = records.filter(r => r.status === 'done')
  const grapes = tally()
  const regions = tally()
  const countries = tally()
  const typeCounts = {}
  const blind = Object.fromEntries(BLIND_FIELDS.map(f => [f.key, { exact: 0, close: 0, miss: 0 }]))
  const gaps = Object.fromEntries(PROFILE_AXES.map(a => [a.key, []]))
  let blindCount = 0
  let favorites = 0

  for (const record of done) {
    const reality = record.reality ?? {}
    const rating = record.style?.rating ?? null
    if (record.style?.favorite) favorites++
    if (reality.type) typeCounts[reality.type] = (typeCounts[reality.type] ?? 0) + 1
    for (const name of reality.grapes ?? []) grapes.add(grapeKey(name), findGrape(name)?.name ?? name, rating)
    const region = canonicalRegion(reality.region)
    if (region) regions.add(region, region, rating)
    else if (reality.country && normalize(reality.country) !== 'france') countries.add(normalize(reality.country), reality.country, rating)

    if (record.mode !== 'blind') continue
    const matches = record.comparison?.matches ?? {}
    if (Object.keys(matches).length) blindCount++
    for (const field of BLIND_FIELDS) if (matches[field.key]) blind[field.key][matches[field.key]]++
    const profile = buildProfile(record)
    for (const axis of profile?.axes ?? []) if (axis.you !== null) gaps[axis.key].push(axis.you - axis.typical)
  }

  const leanings = PROFILE_AXES
    .map(axis => {
      const values = gaps[axis.key]
      const mean = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0
      if (values.length < MIN_LEANING || Math.abs(mean) < LEANING_THRESHOLD) return null
      return { key: axis.key, count: values.length, text: LEANING_WORDS[axis.key][mean > 0 ? 1 : 0] }
    })
    .filter(Boolean)

  return {
    total: done.length,
    favorites,
    types: WINE_TYPES.map(t => ({ key: t.value, label: t.label, value: typeCounts[t.value] ?? 0, tone: t.value })),
    grapes: grapes.top().slice(0, TOP),
    regionCounts: Object.fromEntries(regions.top().map(r => [r.name, r.value])),
    countries: countries.top(),
    likedGrapes: grapes.liked().slice(0, 3),
    likedRegions: regions.liked().slice(0, 3),
    blindCount,
    blind: BLIND_FIELDS.map(f => ({ ...f, ...blind[f.key], total: blind[f.key].exact + blind[f.key].close + blind[f.key].miss })).filter(f => f.total > 0),
    leanings,
    profiled: Math.max(...PROFILE_AXES.map(a => gaps[a.key].length)),
  }
}
