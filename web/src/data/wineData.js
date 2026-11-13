// Données et constantes du domaine vin — MyWine

// === Étape 3 : Hypothèses ===

export const CLIMATE_OPTIONS = [
  { value: 'frais', label: 'Frais' },
  { value: 'tempere', label: 'Tempéré' },
  { value: 'chaud', label: 'Chaud' },
]

export const SOIL_OPTIONS = [
  { value: 'calcaire', label: 'Calcaire' },
  { value: 'argile', label: 'Argile' },
  { value: 'schiste', label: 'Schiste' },
  { value: 'sable', label: 'Sable' },
  { value: 'granit', label: 'Granit' },
  { value: 'nsp', label: 'Je ne sais pas' },
]

export const COUNTRIES = [
  'France', 'Italie', 'Espagne', 'Portugal', 'Allemagne', 'Autriche',
  'Grèce', 'Hongrie', 'Suisse', 'Géorgie',
  'États-Unis', 'Argentine', 'Chili', 'Afrique du Sud',
  'Australie', 'Nouvelle-Zélande', 'Maroc', 'Autre',
]

// === Étape 4 : Style ===

export const STYLE_OPTIONS = [
  { value: 'plaisir', label: 'Plaisir immédiat' },
  { value: 'gastronomique', label: 'Gastronomique' },
  { value: 'garde', label: 'Vin de garde' },
  { value: 'auteur', label: "Vin d'auteur" },
]

export const PAIRING_SUGGESTIONS = [
  'Viandes rouges', 'Volaille', 'Poissons', 'Fruits de mer',
  'Fromages', 'Charcuterie', 'Végétarien', 'Desserts', 'Apéritif',
]


// ─── Types de vin ─────────────────────────────────────────────────────────────
// simplified:true → pas de grammaire dédiée : étape Structure en saisie libre

export const WINE_TYPES = [
  { value: 'rouge',     label: 'Rouge' },
  { value: 'blanc',     label: 'Blanc' },
  { value: 'rose',      label: 'Rosé' },
  { value: 'petillant', label: 'Pétillant' },
  { value: 'orange',    label: 'Orange' },
  { value: 'clairet',   label: 'Clairet',  simplified: true },
  { value: 'autre',     label: 'Autre',    simplified: true },
]

// ─── Robe par type ────────────────────────────────────────────────────────────

export const ROBE_OPTIONS_BY_TYPE = {
  rouge:     ['Rubis clair', 'Rubis', 'Grenat', 'Pourpre', 'Tuilé', 'Brun'],
  blanc:     ['Jaune pâle', 'Jaune citrin', 'Jaune doré', 'Or', 'Ambré'],
  rose:      ['Rose pâle', 'Rose saumon', 'Rose framboise', 'Rose foncé', 'Orangé'],
  petillant: ['Blanc cristallin', 'Jaune pâle', 'Rosé', 'Doré'],
  orange:    ['Jaune ambré', 'Or cuivré', 'Tuilé orangé', 'Ocre', 'Brun orangé'],
  clairet:   ['Rose foncé', 'Rouge rosé', 'Grenat très pâle'],
}

// ─── Familles aromatiques par type ───────────────────────────────────────────

export const AROMA_FAMILIES_BY_TYPE = {
  rouge:     ['Fruits noirs', 'Fruits rouges', 'Floral', 'Épices', 'Terreux', 'Animal', 'Végétal', 'Boisé', 'Balsamique'],
  blanc:     ['Agrumes', 'Fruits à chair blanche', 'Fruits tropicaux', 'Floral', 'Minéral', 'Végétal', 'Miel/Cire', 'Boisé', 'Oxydatif'],
  rose:      ['Fruits rouges légers', 'Fruits blancs', 'Floral', 'Agrumes', 'Bonbon/Confiture'],
  petillant: ['Agrumes', 'Pomme/Poire', 'Ananas', 'Fraise', 'Brioche', 'Levure', 'Beurre', 'Noisette', 'Toast'],
  orange:    ['Abricot sec', 'Coing', 'Figue', 'Mandarine confite', 'Noix', 'Thé', 'Épices douces', 'Miso/Fermenté', 'Fleurs séchées'],
  clairet:   ['Cerise', 'Groseille', 'Framboise', 'Cassis léger', 'Floral rouge', 'Épices légères'],
}

// ─── Structure Rouge — TaninBlock ────────────────────────────────────────────

export const TANNIN_INTENSITY = [
  { value: 't1', label: 'Quasi absents' },
  { value: 't2', label: 'Discrets' },
  { value: 't3', label: 'Présents' },
  { value: 't4', label: 'Marqués' },
  { value: 't5', label: 'Très marqués' },
]

export const TANNIN_TEXTURE = [
  { value: 'veloutés',  label: 'Veloutés' },
  { value: 'soyeux',    label: 'Soyeux' },
  { value: 'granuleux', label: 'Granuleux' },
  { value: 'anguleux',  label: 'Anguleux' },
  { value: 'cacao',     label: 'Poudre de cacao' },
]

export const FRUIT_MATURITY = [
  { value: 'frais',     label: 'Fruit frais' },
  { value: 'mur',       label: 'Fruit mûr' },
  { value: 'cuit',      label: 'Fruit cuit/confit' },
  { value: 'tertiaire', label: 'Tertiaire dominant' },
]

// ─── Structure Blanc — TensionBlock ──────────────────────────────────────────

export const ACIDITY_5 = [
  { value: 'plate',      label: 'Plate' },
  { value: 'souple',     label: 'Souple' },
  { value: 'fraiche',    label: 'Fraîche' },
  { value: 'vive',       label: 'Vive' },
  { value: 'tranchante', label: 'Tranchante' },
]

export const TEXTURE_WHITE = [
  { value: 'legere',    label: 'Légère et sèche' },
  { value: 'souple',    label: 'Souple' },
  { value: 'onctueuse', label: 'Onctueuse' },
  { value: 'grasse',    label: 'Grasse et ronde' },
]

export const MINERALITY = [
  { value: 'absente',  label: 'Absente' },
  { value: 'discrete', label: 'Discrète' },
  { value: 'presente', label: 'Présente' },
  { value: 'marquee',  label: 'Marquée' },
]

export const MINERALITY_TYPE = [
  { value: 'craie',   label: 'Craie' },
  { value: 'silex',   label: 'Silex' },
  { value: 'iode',    label: 'Iode' },
  { value: 'fume',    label: 'Fumé' },
  { value: 'mouille', label: 'Pierre mouillée' },
]

// ─── Structure Rosé — FraicheurBlock ─────────────────────────────────────────

export const VIVACITY = [
  { value: 'plate',  label: 'Plate' },
  { value: 'souple', label: 'Souple' },
  { value: 'fraiche',label: 'Fraîche' },
  { value: 'vive',   label: 'Très vive' },
]

export const PERCEIVED_SWEETNESS = [
  { value: 'sec',     label: 'Sec' },
  { value: 'leger',   label: 'Légèrement sucré' },
  { value: 'demisec', label: 'Demi-sec' },
  { value: 'sucre',   label: 'Sucré' },
]

export const LIGHT_STRUCTURE = [
  { value: 'aucune',  label: 'Aucune' },
  { value: 'legere',  label: 'Légère présence' },
  { value: 'presente',label: 'Présente' },
  { value: 'nette',   label: 'Nette' },
]

// ─── Structure Pétillant — EffervescenceBlock ─────────────────────────────────

export const BUBBLE_QUALITY = [
  { value: 'tres_fines', label: 'Très fines et persistantes' },
  { value: 'fines',      label: 'Fines' },
  { value: 'moyennes',   label: 'Moyennes' },
  { value: 'vives',      label: 'Vives et piquantes' },
  { value: 'grossieres', label: 'Grossières' },
]

export const PERCEIVED_DOSAGE = [
  { value: 'brut_nature', label: 'Brut nature' },
  { value: 'brut',        label: 'Brut' },
  { value: 'leger',       label: 'Légèrement sucré' },
  { value: 'demisec',     label: 'Demi-sec' },
  { value: 'doux',        label: 'Doux' },
]

export const SPARKLING_REGISTER = [
  { value: 'frais',    label: 'Fruit frais dominant' },
  { value: 'levure',   label: 'Levure/Brioche' },
  { value: 'mur',      label: 'Fruité mûr' },
  { value: 'oxydatif', label: 'Oxydatif' },
]

// ─── Structure Orange — PhenolicBlock ────────────────────────────────────────

export const PHENOLIC_INTENSITY = [
  { value: 'absente',      label: 'Absente' },
  { value: 'discrete',     label: 'Discrète' },
  { value: 'presente',     label: 'Présente' },
  { value: 'marquee',      label: 'Marquée' },
  { value: 'tres_marquee', label: 'Très marquée' },
]

export const PHENOLIC_TYPE = [
  { value: 'orange', label: "Peau d'orange" },
  { value: 'the',    label: 'Thé noir' },
  { value: 'sec',    label: 'Tanin sec' },
  { value: 'enrob',  label: 'Enrobant' },
]

export const BITTERNESS = [
  { value: 'absents',  label: 'Absents' },
  { value: 'fins',     label: 'Fins' },
  { value: 'presents', label: 'Présents' },
  { value: 'intenses', label: 'Intenses' },
]

export const BITTERNESS_TYPE = [
  { value: 'noix',   label: 'Noix' },
  { value: 'zeste',  label: "Zeste d'agrume" },
  { value: 'the',    label: 'Thé' },
  { value: 'amande', label: 'Amande sèche' },
]

export const OXIDATIVE_REGISTER = [
  { value: 'absent',   label: 'Absent' },
  { value: 'discret',  label: 'Discret' },
  { value: 'present',  label: 'Présent' },
  { value: 'dominant', label: 'Dominant' },
]

export const RESIDUAL_ACIDITY = [
  { value: 'absente',     label: 'Absente' },
  { value: 'discrete',    label: 'Discrète' },
  { value: 'perceptible', label: 'Perceptible' },
  { value: 'vive',        label: 'Encore vive' },
]

// ─── Partagés tous types ──────────────────────────────────────────────────────

export const BODY_3 = [
  { value: 'leger', label: 'Léger' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'ample', label: 'Ample' },
]

export const FINISH_3 = [
  { value: 'courte',  label: 'Courte' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'longue',  label: 'Longue' },
]

// ─── Options spécifiques (rouge : acidité en 3 niveaux · blanc : boisé) ──────

export const ACIDITY_RED = [
  { value: 'faible',  label: 'Faible' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'fraiche', label: 'Fraîche' },
]

export const OAK = [
  { value: 'absent',   label: 'Absent' },
  { value: 'discret',  label: 'Discret' },
  { value: 'present',  label: 'Présent' },
  { value: 'dominant', label: 'Dominant' },
]
