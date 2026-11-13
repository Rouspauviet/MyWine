// Autocomplétion des appellations françaises (AOC/AOP/IGP)
// Choisir une appellation permet de déduire région et pays.
import data from './appellationsFR.json'
import { normalize } from '../utils/text'

const LIST = data.appellations.map(a => ({
  name: a.name,
  type: a.type,
  region: a.region,
  country: a.country,
  keys: [a.name, ...(a.aliases ?? [])].map(normalize),
}))

export function searchAppellations(query, max = 6) {
  const q = normalize(query)
  if (q.length < 2) return []
  const starts = []
  const contains = []
  for (const a of LIST) {
    if (a.keys.some(k => k === q)) continue // déjà saisi tel quel : rien à suggérer
    if (a.keys.some(k => k.startsWith(q))) starts.push(a)
    else if (a.keys.some(k => k.includes(q))) contains.push(a)
  }
  return [...starts, ...contains].slice(0, max)
}

// Appellation correspondant exactement au texte saisi (pour déduire la région)
export function findAppellation(name) {
  const q = normalize(name)
  if (!q) return null
  return LIST.find(a => a.keys.includes(q)) ?? null
}

export const REGIONS = [...new Set(LIST.map(a => a.region).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, 'fr'))
