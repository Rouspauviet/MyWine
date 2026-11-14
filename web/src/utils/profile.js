// Profil comparé — ce que le dégustateur a perçu, face au profil typique du cépage révélé.
// Sert à la carte "Ta perception face au profil typique" et aux penchants de "Mon palais".
// Ce sont des tendances : un écart n'est jamais une faute.
import { findGrape } from '../data/wineKnowledge'
import { readNotes } from './reasoning'

// Les axes communs à la saisie et à la base de cépages, du plus faible au plus fort
export const PROFILE_AXES = [
  { key: 'tannin', label: 'Tanins', levels: ['faible', 'moyen', 'fort'], ends: ['Discrets', 'Marqués'] },
  { key: 'body', label: 'Corps', levels: ['leger', 'moyen', 'ample'], ends: ['Léger', 'Ample'] },
  { key: 'acidity', label: 'Acidité', levels: ['faible', 'moyenne', 'haute'], ends: ['Faible', 'Vive'] },
]

// Le cépage principal de la bouteille, s'il est dans la base et si son profil s'applique à ce vin.
// Les profils décrivent des vins tranquilles : on ne les applique ni à un pétillant ni à un rosé.
export function mainGrapeOf(record) {
  const reality = record.reality ?? {}
  const grape = (reality.grapes ?? []).map(findGrape).find(Boolean)
  if (!grape) return null
  const applies = (grape.color === 'rouge' && reality.type === 'rouge') || (grape.color === 'blanc' && reality.type === 'blanc')
  return applies ? grape : null
}

// Renvoie null si la comparaison n'a pas de sens (cépage inconnu, autre type de vin, rien de noté).
//   axes   : [{ key, label, ends, you, typical }] — positions 0 à 2, `you` vaut null si l'axe n'a pas été noté
//   aromas : [{ name, found }] arômes typiques du cépage · extra : ce que le dégustateur a senti en plus
export function buildProfile(record) {
  const grape = mainGrapeOf(record)
  if (!grape || record.mode !== 'blind' || record.wineType !== grape.color) return null
  const notes = readNotes(record)
  const axes = PROFILE_AXES
    .filter(axis => grape[axis.key])
    .map(axis => ({
      key: axis.key,
      label: axis.label,
      ends: axis.ends,
      you: notes[axis.key] ? axis.levels.indexOf(notes[axis.key]) : null,
      typical: axis.levels.indexOf(grape[axis.key]),
    }))
  const aromas = grape.aromas.map(name => ({ name, found: notes.aromas.includes(name) }))
  const extra = notes.aromas.filter(name => !grape.aromas.includes(name))
  const noted = axes.some(axis => axis.you !== null) || notes.aromas.length > 0
  return noted ? { grape: grape.name, axes, aromas, extra } : null
}
