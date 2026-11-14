// Profil comparé — ce que le dégustateur a perçu, face au profil typique du cépage révélé.
// Sert au profil comparé, à la carte des saveurs et aux penchants de "Mon palais".
// Tout est ramené sur une échelle de 1 à 5. Ce sont des tendances : un écart n'est jamais une faute.
import { findGrape } from '../data/wineKnowledge'
import { fineProfile } from '../data/grapeProfiles'

export const SCALE_MAX = 5

export const PROFILE_AXES = [
  { key: 'tannin', label: 'Tanins', ends: ['Discrets', 'Marqués'] },
  { key: 'body', label: 'Corps', ends: ['Léger', 'Ample'] },
  { key: 'acidity', label: 'Acidité', ends: ['Faible', 'Vive'] },
]

// La saisie ramenée sur l'échelle de 1 à 5. Une saisie à trois niveaux se place à 1,5 · 3 · 4,5 :
// "ample" couvre ainsi les cépages notés 4 comme ceux notés 5.
const TANNIN = { t1: 1, t2: 2, t3: 3, t4: 4, t5: 5 }
const THREE = { low: 1.5, mid: 3, high: 4.5 }
const BODY_RED = { leger: THREE.low, moyen: THREE.mid, ample: THREE.high }
const ACIDITY_RED = { faible: THREE.low, moyenne: THREE.mid, fraiche: THREE.high }
const ACIDITY_WHITE = { plate: 1, souple: 2, fraiche: 3, vive: 4, tranchante: 5 }
const BODY_WHITE = { legere: 1.5, souple: 3, onctueuse: 4, grasse: 5 }

// Ce que le dégustateur a noté : { tannin, body, acidity } de 1 à 5, null si non noté
export function perceivedOf(record) {
  const data = record.structure?.v === 2 ? (record.structure.data ?? {}) : {}
  if (record.wineType === 'rouge') {
    return { tannin: TANNIN[data.taninIntensity] ?? null, body: BODY_RED[data.body] ?? null, acidity: ACIDITY_RED[data.acidity] ?? null }
  }
  if (record.wineType === 'blanc') {
    return { tannin: null, body: BODY_WHITE[data.texture] ?? null, acidity: ACIDITY_WHITE[data.acidity] ?? null }
  }
  return { tannin: null, body: null, acidity: null }
}

// Bande d'une valeur : 0 faible (≤ 2), 1 moyen, 2 fort (≥ 4). Deux valeurs de la même bande "collent".
export const bandOf = (value) => (value <= 2 ? 0 : value >= 4 ? 2 : 1)

// Le cépage principal de la bouteille, s'il est dans la base et si son profil s'applique à ce vin.
// Les profils décrivent des vins tranquilles : on ne les applique ni à un pétillant ni à un rosé.
export function mainGrapeOf(record) {
  const reality = record.reality ?? {}
  const grape = (reality.grapes ?? []).map(findGrape).find(Boolean)
  if (!grape) return null
  const applies = (grape.color === 'rouge' && reality.type === 'rouge') || (grape.color === 'blanc' && reality.type === 'blanc')
  return applies ? grape : null
}

// Les axes d'un cépage seul (fiche cépage, entraînement) : [{ key, label, ends, you: null, typical }]
export function typicalAxes(grape) {
  const fine = fineProfile(grape)
  if (!fine) return []
  return PROFILE_AXES.filter(axis => fine[axis.key]).map(axis => ({ ...axis, you: null, typical: fine[axis.key], gap: 0 }))
}

// Renvoie null si la comparaison n'a pas de sens (cépage inconnu, autre type de vin, rien de noté).
//   axes   : [{ key, label, ends, you, typical, gap }] — `you` vaut null si l'axe n'a pas été noté ;
//            `gap` : -2 à 2, écart de bande entre la perception et le profil typique
//   aromas : [{ name, found }] arômes typiques du cépage · extra : ce que le dégustateur a senti en plus
export function buildProfile(record) {
  const grape = mainGrapeOf(record)
  if (!grape || record.mode !== 'blind' || record.wineType !== grape.color) return null
  const perceived = perceivedOf(record)
  const axes = typicalAxes(grape).map(axis => {
    const you = perceived[axis.key]
    return { ...axis, you, gap: you === null ? 0 : bandOf(you) - bandOf(axis.typical) }
  })
  const smelled = record.perception?.aromaFamilies ?? []
  const aromas = grape.aromas.map(name => ({ name, found: smelled.includes(name) }))
  const extra = smelled.filter(name => !grape.aromas.includes(name))
  const noted = axes.some(axis => axis.you !== null) || smelled.length > 0
  return noted ? { grape: grape.name, axes, aromas, extra } : null
}

// ─── Carte des saveurs ───────────────────────────────────────────────────────
// Deux axes de 1 à 5. Horizontal : la matière (tanins et corps pour un rouge, corps pour un blanc).
// Vertical : la fraîcheur (acidité).

export const FLAVOR_AXES = {
  rouge: { x: ['Léger', 'Puissant'], y: ['Rond', 'Vif'] },
  blanc: { x: ['Léger', 'Ample'], y: ['Rond', 'Vif'] },
}

const mean = (values) => {
  const known = values.filter(v => v !== null && v !== undefined)
  return known.length ? known.reduce((s, v) => s + v, 0) / known.length : null
}

// Position d'un profil { tannin, body, acidity } sur la carte, ou null s'il manque un des deux axes
export function flavorPoint(profile, color) {
  if (!profile) return null
  const x = color === 'rouge' ? mean([profile.tannin, profile.body]) : (profile.body ?? null)
  const y = profile.acidity ?? null
  return x === null || y === null ? null : { x, y }
}
