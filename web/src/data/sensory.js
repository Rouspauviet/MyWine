// Correspondances visuelles de la saisie sensorielle — chaque valeur renvoie à un token de tokens.css.
// Les libellés sont ceux de wineData.js : ce sont eux qui restent enregistrés sur les fiches.

// Robe → token `--robe-<clé>`
export const ROBE_TOKENS = {
  'Rubis clair': 'rubis-clair', 'Rubis': 'rubis', 'Grenat': 'grenat', 'Pourpre': 'pourpre', 'Tuilé': 'tuile', 'Brun': 'brun',
  'Jaune pâle': 'jaune-pale', 'Jaune citrin': 'jaune-citrin', 'Jaune doré': 'jaune-dore', 'Or': 'or', 'Ambré': 'ambre',
  'Rose pâle': 'rose-pale', 'Rose saumon': 'rose-saumon', 'Rose framboise': 'rose-framboise', 'Rose foncé': 'rose-fonce', 'Orangé': 'orange',
  'Blanc cristallin': 'cristallin', 'Rosé': 'rose-saumon', 'Doré': 'jaune-dore',
  'Jaune ambré': 'ambre', 'Or cuivré': 'cuivre', 'Tuilé orangé': 'tuile-orange', 'Ocre': 'ocre', 'Brun orangé': 'brun-orange',
  'Rouge rosé': 'rouge-rose', 'Grenat très pâle': 'grenat-pale',
}

// Famille aromatique → groupe de couleur, token `--aroma-<groupe>`
const AROMA_GROUPS = {
  'fruits-rouges': ['Fruits rouges', 'Fruits rouges légers', 'Fraise', 'Cerise', 'Groseille', 'Framboise'],
  'fruits-noirs': ['Fruits noirs', 'Cassis léger'],
  'fruits-blancs': ['Fruits à chair blanche', 'Fruits blancs', 'Pomme/Poire', 'Coing'],
  'agrumes': ['Agrumes', 'Mandarine confite'],
  'exotique': ['Fruits tropicaux', 'Ananas', 'Abricot sec', 'Figue'],
  'floral': ['Floral', 'Floral rouge', 'Fleurs séchées'],
  'vegetal': ['Végétal', 'Thé'],
  'epices': ['Épices', 'Épices douces', 'Épices légères'],
  'boise': ['Boisé', 'Toast', 'Noisette', 'Noix'],
  'terre': ['Terreux', 'Animal', 'Miso/Fermenté', 'Levure'],
  'mineral': ['Minéral'],
  'patisserie': ['Miel/Cire', 'Brioche', 'Beurre', 'Bonbon/Confiture'],
  'evolue': ['Balsamique', 'Oxydatif'],
}

const GROUP_OF = Object.fromEntries(Object.entries(AROMA_GROUPS).flatMap(([group, names]) => names.map(n => [n, group])))

export const aromaToken = (name) => `--aroma-${GROUP_OF[name] ?? 'mineral'}`
export const robeToken = (name) => (ROBE_TOKENS[name] ? `--robe-${ROBE_TOKENS[name]}` : null)
