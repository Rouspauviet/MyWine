// Niveaux de dégustateur — le niveau adapte le formulaire, il ne juge pas.

export const LEVELS = [
  { value: 'debutant', label: 'Débutant', description: 'Peu de questions, des mots simples, et l\'app te guide pas à pas.' },
  { value: 'amateur',  label: 'Amateur',  description: 'La grille complète, avec une aide pour raisonner si tu bloques.' },
  { value: 'confirme', label: 'Confirmé', description: 'La grille complète, sans guidage : des indices seulement si tu les demandes.' },
  { value: 'expert',   label: 'Expert',   description: 'Tout est ouvert, aucune aide : appellation, producteur, millésime, climat, sol.' },
]

export const DEFAULT_LEVEL = 'amateur'

const LEVEL_KEY = 'mywine.level'
const NAME_KEY = 'mywine.name'

function read(key) {
  try { return localStorage.getItem(key) } catch { return null }
}
function write(key, value) {
  try { localStorage.setItem(key, value) } catch { /* stockage indisponible : on fait sans */ }
}

// Dernier niveau choisi sur cet appareil, proposé par défaut la fois suivante
export function getPreferredLevel() {
  const stored = read(LEVEL_KEY)
  return LEVELS.some(l => l.value === stored) ? stored : DEFAULT_LEVEL
}
export function setPreferredLevel(level) { write(LEVEL_KEY, level) }

// Prénom de l'hôte, mémorisé pour les prochaines dégustations à plusieurs
export function getPreferredName() { return read(NAME_KEY) ?? '' }
export function setPreferredName(name) { write(NAME_KEY, name) }

// Cépages courants par couleur — chips du niveau Débutant et leurres des choix multiples
export const COMMON_GRAPES = {
  rouge: ['Pinot Noir', 'Gamay', 'Merlot', 'Cabernet Sauvignon', 'Cabernet Franc', 'Syrah', 'Grenache', 'Malbec', 'Sangiovese', 'Tempranillo'],
  blanc: ['Chardonnay', 'Sauvignon Blanc', 'Chenin Blanc', 'Riesling', 'Viognier', 'Gewurztraminer', 'Pinot Gris', 'Melon de Bourgogne', 'Sémillon', 'Vermentino'],
  petillant: ['Chardonnay', 'Pinot Noir', 'Pinot Meunier', 'Chenin Blanc', 'Glera', 'Macabeo', 'Mauzac', 'Riesling'],
}

// Rosé et clairet viennent de cépages rouges ; les vins orange de cépages blancs
export function commonGrapesFor(wineType) {
  if (wineType === 'blanc' || wineType === 'orange') return COMMON_GRAPES.blanc
  if (wineType === 'petillant') return COMMON_GRAPES.petillant
  if (wineType === 'rouge' || wineType === 'rose' || wineType === 'clairet') return COMMON_GRAPES.rouge
  return [...COMMON_GRAPES.rouge.slice(0, 6), ...COMMON_GRAPES.blanc.slice(0, 6)]
}
