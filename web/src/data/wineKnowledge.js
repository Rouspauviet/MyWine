// Base de connaissances vin — profils typiques des cépages, repères par région et par pays.
// Sert à trois choses : la fiche "Pour comprendre" après la révélation, des leurres plausibles
// dans les choix multiples, et les indices de la dégustation à plusieurs.
// Ce sont des tendances générales, toujours présentées comme telles : un vin peut s'en écarter.
import { normalize } from '../utils/text'

// tannin : 'faible' | 'moyen' | 'fort' (rouges) · body : 'leger' | 'moyen' | 'ample' · acidity : 'faible' | 'moyenne' | 'haute'
// aromas : libellés des familles aromatiques de wineData.js (rouge ou blanc selon la couleur)
// style : clé de GRAPE_STYLES · confusables : cépages qu'on confond réellement à l'aveugle
export const GRAPES = [
  // ── Rouges ──
  { name: 'Pinot Noir', color: 'rouge', tannin: 'faible', body: 'leger', acidity: 'haute', style: 'rouge-leger',
    aromas: ['Fruits rouges', 'Floral', 'Terreux'], confusables: ['Gamay', 'Cabernet Franc', 'Nebbiolo'],
    about: 'Robe claire, fruits rouges (cerise, framboise), tanins fins et belle fraîcheur. Avec l\'âge viennent le sous-bois et le champignon.' },
  { name: 'Gamay', color: 'rouge', tannin: 'faible', body: 'leger', acidity: 'haute', style: 'rouge-leger',
    aromas: ['Fruits rouges', 'Floral'], confusables: ['Pinot Noir', 'Cabernet Franc', 'Grenache'],
    about: 'Très fruité et gouleyant : fraise, cerise, parfois la pivoine. Peu de tanins, beaucoup de fraîcheur.' },
  { name: 'Cabernet Franc', color: 'rouge', tannin: 'moyen', body: 'moyen', acidity: 'haute', style: 'rouge-leger',
    aromas: ['Fruits rouges', 'Végétal', 'Floral'], confusables: ['Cabernet Sauvignon', 'Merlot', 'Pinot Noir'],
    about: 'Framboise, violette et une note végétale caractéristique (poivron, feuille). Tanins présents mais fins, bouche fraîche.' },
  { name: 'Merlot', color: 'rouge', tannin: 'moyen', body: 'ample', acidity: 'moyenne', style: 'rouge-rond',
    aromas: ['Fruits noirs', 'Fruits rouges', 'Boisé'], confusables: ['Cabernet Sauvignon', 'Cabernet Franc', 'Malbec'],
    about: 'Rond et charnu : prune, cerise noire, tanins souples. Souvent élevé en fût, d\'où des notes boisées.' },
  { name: 'Cabernet Sauvignon', color: 'rouge', tannin: 'fort', body: 'ample', acidity: 'moyenne', style: 'rouge-structure',
    aromas: ['Fruits noirs', 'Végétal', 'Boisé'], confusables: ['Merlot', 'Cabernet Franc', 'Syrah'],
    about: 'Cassis, cèdre, parfois le poivron. Tanins fermes et structure droite : un cépage taillé pour la garde.' },
  { name: 'Syrah', aliases: ['Shiraz'], color: 'rouge', tannin: 'fort', body: 'ample', acidity: 'moyenne', style: 'rouge-epice',
    aromas: ['Fruits noirs', 'Épices', 'Floral', 'Animal'], confusables: ['Grenache', 'Mourvèdre', 'Malbec'],
    about: 'Fruits noirs, poivre, violette, parfois l\'olive ou le lard fumé. Robe sombre, tanins marqués.' },
  { name: 'Grenache', aliases: ['Garnacha', 'Grenache Noir'], color: 'rouge', tannin: 'moyen', body: 'ample', acidity: 'faible', style: 'rouge-rond',
    aromas: ['Fruits rouges', 'Épices'], confusables: ['Syrah', 'Mourvèdre', 'Tempranillo'],
    about: 'Généreux et chaleureux : fraise mûre, garrigue, épices douces. Peu d\'acidité, alcool souvent élevé.' },
  { name: 'Mourvèdre', aliases: ['Monastrell'], color: 'rouge', tannin: 'fort', body: 'ample', acidity: 'moyenne', style: 'rouge-epice',
    aromas: ['Fruits noirs', 'Animal', 'Épices'], confusables: ['Syrah', 'Grenache', 'Carignan'],
    about: 'Puissant et sauvage : mûre, cuir, épices. Tanins serrés qui demandent du temps.' },
  { name: 'Carignan', color: 'rouge', tannin: 'fort', body: 'ample', acidity: 'haute', style: 'rouge-structure',
    aromas: ['Fruits noirs', 'Épices', 'Terreux'], confusables: ['Syrah', 'Mourvèdre', 'Grenache'],
    about: 'Coloré, tannique et vif à la fois : fruits noirs, garrigue, notes terreuses.' },
  { name: 'Malbec', aliases: ['Cot', 'Côt'], color: 'rouge', tannin: 'fort', body: 'ample', acidity: 'moyenne', style: 'rouge-structure',
    aromas: ['Fruits noirs', 'Floral', 'Épices'], confusables: ['Merlot', 'Syrah', 'Tannat'],
    about: 'Robe presque noire, prune, mûre et violette. Tanins présents, plus veloutés en Argentine, plus fermes à Cahors.' },
  { name: 'Tannat', color: 'rouge', tannin: 'fort', body: 'ample', acidity: 'haute', style: 'rouge-structure',
    aromas: ['Fruits noirs', 'Épices', 'Boisé'], confusables: ['Malbec', 'Cabernet Sauvignon', 'Mourvèdre'],
    about: 'L\'un des cépages les plus tanniques qui soient : fruits noirs, structure massive, belle acidité.' },
  { name: 'Sangiovese', color: 'rouge', tannin: 'fort', body: 'moyen', acidity: 'haute', style: 'rouge-structure',
    aromas: ['Fruits rouges', 'Terreux', 'Épices'], confusables: ['Nebbiolo', 'Tempranillo', 'Cabernet Franc'],
    about: 'Cerise acidulée, herbes sèches, notes terreuses. Acidité vive et tanins fermes : un vin de table au sens noble.' },
  { name: 'Nebbiolo', color: 'rouge', tannin: 'fort', body: 'moyen', acidity: 'haute', style: 'rouge-structure',
    aromas: ['Fruits rouges', 'Floral', 'Terreux', 'Balsamique'], confusables: ['Sangiovese', 'Pinot Noir', 'Tempranillo'],
    about: 'Robe claire et trompeuse : rose, cerise, goudron, avec des tanins et une acidité très marqués.' },
  { name: 'Tempranillo', aliases: ['Tinta Roriz', 'Tinto Fino'], color: 'rouge', tannin: 'moyen', body: 'moyen', acidity: 'moyenne', style: 'rouge-rond',
    aromas: ['Fruits rouges', 'Boisé', 'Épices'], confusables: ['Sangiovese', 'Grenache', 'Merlot'],
    about: 'Fruits rouges, cuir, tabac. Souvent longuement élevé en fût, d\'où la vanille et la noix de coco.' },
  { name: 'Zinfandel', aliases: ['Primitivo'], color: 'rouge', tannin: 'moyen', body: 'ample', acidity: 'faible', style: 'rouge-rond',
    aromas: ['Fruits noirs', 'Épices'], confusables: ['Grenache', 'Syrah', 'Merlot'],
    about: 'Très mûr, presque confituré : mûre, pruneau, épices douces. Alcool généreux.' },

  // ── Blancs ──
  { name: 'Chardonnay', color: 'blanc', body: 'ample', acidity: 'moyenne', style: 'blanc-ample',
    aromas: ['Fruits à chair blanche', 'Agrumes', 'Boisé'], confusables: ['Chenin Blanc', 'Viognier', 'Pinot Gris'],
    about: 'Caméléon : tendu et minéral à Chablis, beurré et vanillé quand il est élevé en fût. Pomme, poire, agrumes.' },
  { name: 'Sauvignon Blanc', aliases: ['Sauvignon'], color: 'blanc', body: 'leger', acidity: 'haute', style: 'blanc-vif',
    aromas: ['Agrumes', 'Végétal', 'Fruits tropicaux', 'Minéral'], confusables: ['Chenin Blanc', 'Riesling', 'Melon de Bourgogne'],
    about: 'Très expressif : pamplemousse, buis, bourgeon de cassis, parfois fruit de la passion. Vif et tranchant.' },
  { name: 'Chenin Blanc', aliases: ['Chenin'], color: 'blanc', body: 'moyen', acidity: 'haute', style: 'blanc-vif',
    aromas: ['Fruits à chair blanche', 'Miel/Cire', 'Floral', 'Minéral'], confusables: ['Chardonnay', 'Sauvignon Blanc', 'Riesling'],
    about: 'Coing, pomme, miel et cire, portés par une acidité élevée. Existe en sec, demi-sec, moelleux et pétillant.' },
  { name: 'Riesling', color: 'blanc', body: 'leger', acidity: 'haute', style: 'blanc-vif',
    aromas: ['Agrumes', 'Minéral', 'Floral', 'Fruits à chair blanche'], confusables: ['Chenin Blanc', 'Sauvignon Blanc', 'Pinot Gris'],
    about: 'Citron, fleurs blanches et, avec l\'âge, une note minérale dite "de pétrole". Acidité très vive.' },
  { name: 'Gewurztraminer', aliases: ['Gewürztraminer'], color: 'blanc', body: 'ample', acidity: 'faible', style: 'blanc-aromatique',
    aromas: ['Floral', 'Fruits tropicaux', 'Miel/Cire'], confusables: ['Muscat', 'Viognier', 'Pinot Gris'],
    about: 'Explosif au nez : rose, litchi, épices. Bouche ample, peu acide, souvent avec un peu de sucre.' },
  { name: 'Viognier', color: 'blanc', body: 'ample', acidity: 'faible', style: 'blanc-aromatique',
    aromas: ['Fruits à chair blanche', 'Floral'], confusables: ['Gewurztraminer', 'Chardonnay', 'Muscat'],
    about: 'Abricot, pêche, violette. Bouche grasse et ronde, peu d\'acidité.' },
  { name: 'Pinot Gris', aliases: ['Pinot Grigio'], color: 'blanc', body: 'ample', acidity: 'moyenne', style: 'blanc-ample',
    aromas: ['Fruits à chair blanche', 'Miel/Cire'], confusables: ['Chardonnay', 'Gewurztraminer', 'Riesling'],
    about: 'Poire, fruits jaunes, notes fumées et miellées. Rond en Alsace, plus léger et neutre en Italie.' },
  { name: 'Melon de Bourgogne', aliases: ['Muscadet', 'Melon'], color: 'blanc', body: 'leger', acidity: 'haute', style: 'blanc-vif',
    aromas: ['Agrumes', 'Minéral'], confusables: ['Sauvignon Blanc', 'Aligoté', 'Chardonnay'],
    about: 'Le cépage du Muscadet : discret, citronné, salin, souvent avec un léger perlant.' },
  { name: 'Aligoté', color: 'blanc', body: 'leger', acidity: 'haute', style: 'blanc-vif',
    aromas: ['Agrumes', 'Fruits à chair blanche'], confusables: ['Chardonnay', 'Melon de Bourgogne', 'Sauvignon Blanc'],
    about: 'Vif et droit : citron, pomme verte. Le blanc de soif de la Bourgogne.' },
  { name: 'Sémillon', color: 'blanc', body: 'ample', acidity: 'faible', style: 'blanc-ample',
    aromas: ['Miel/Cire', 'Fruits à chair blanche'], confusables: ['Chardonnay', 'Chenin Blanc', 'Viognier'],
    about: 'Gras et cireux : miel, fruits jaunes. Base des grands liquoreux de Bordeaux, souvent assemblé au Sauvignon.' },
  { name: 'Vermentino', aliases: ['Rolle'], color: 'blanc', body: 'moyen', acidity: 'moyenne', style: 'blanc-vif',
    aromas: ['Agrumes', 'Floral', 'Végétal'], confusables: ['Sauvignon Blanc', 'Viognier', 'Chardonnay'],
    about: 'Agrumes, fleurs blanches, herbes fraîches et une pointe d\'amertume en finale. Le blanc de la Méditerranée.' },
  { name: 'Muscat', aliases: ['Muscat Blanc', 'Muscat à Petits Grains'], color: 'blanc', body: 'leger', acidity: 'moyenne', style: 'blanc-aromatique',
    aromas: ['Floral', 'Fruits tropicaux'], confusables: ['Gewurztraminer', 'Viognier', 'Riesling'],
    about: 'Le seul vin qui sent vraiment le raisin frais : fleur d\'oranger, rose, raisin croquant.' },
  { name: 'Romorantin', color: 'blanc', body: 'moyen', acidity: 'haute', style: 'blanc-vif',
    aromas: ['Fruits à chair blanche', 'Miel/Cire', 'Minéral'], confusables: ['Chenin Blanc', 'Chardonnay', 'Sauvignon Blanc'],
    about: 'Cépage rare, presque réservé à Cour-Cheverny : coing, miel, acacia, avec une acidité vive qui le fait bien vieillir.' },
  { name: 'Albariño', aliases: ['Alvarinho'], color: 'blanc', body: 'leger', acidity: 'haute', style: 'blanc-vif',
    aromas: ['Agrumes', 'Fruits à chair blanche', 'Minéral'], confusables: ['Sauvignon Blanc', 'Riesling', 'Vermentino'],
    about: 'Pêche, citron et une salinité marine. Vif et parfumé.' },
]

// Phrases d'indice selon le style du cépage (dégustation à plusieurs)
export const GRAPE_STYLES = {
  'rouge-leger': 'un cépage qui donne des rouges plutôt légers, portés par le fruit et la fraîcheur',
  'rouge-rond': 'un cépage qui donne des rouges ronds et souples',
  'rouge-structure': 'un cépage qui donne des rouges structurés, aux tanins fermes',
  'rouge-epice': 'un cépage qui donne des rouges puissants et épicés',
  'blanc-vif': 'un cépage qui donne des blancs vifs et tendus',
  'blanc-ample': 'un cépage qui donne des blancs amples et ronds',
  'blanc-aromatique': 'un cépage très aromatique, reconnaissable au nez',
}

// climate : 'frais' | 'tempere' | 'chaud' · neighbors : régions qu'on confond volontiers
export const REGIONS = {
  'Alsace': { climate: 'frais', neighbors: ['Jura', 'Savoie', 'Loire'], about: 'Vins de cépage, surtout blancs et aromatiques, à l\'abri des Vosges.' },
  'Beaujolais': { climate: 'tempere', neighbors: ['Bourgogne', 'Loire', 'Rhône'], about: 'Le royaume du Gamay sur granit : des rouges fruités, du plus simple aux crus de garde.' },
  'Bordeaux': { climate: 'tempere', neighbors: ['Sud-Ouest', 'Loire', 'Languedoc'], about: 'Assemblages de Merlot et de Cabernet, souvent élevés en fût. Rive gauche plus tannique, rive droite plus ronde.' },
  'Bourgogne': { climate: 'frais', neighbors: ['Beaujolais', 'Jura', 'Loire'], about: 'Deux cépages, une mosaïque de terroirs : Pinot Noir en rouge, Chardonnay en blanc.' },
  'Champagne': { climate: 'frais', neighbors: ['Bourgogne', 'Loire', 'Alsace'], about: 'Le vignoble le plus septentrional : Chardonnay, Pinot Noir et Meunier pour des vins vifs.' },
  'Corse': { climate: 'chaud', neighbors: ['Provence', 'Languedoc', 'Roussillon'], about: 'Cépages locaux (Niellucciu, Sciaccarellu, Vermentinu) entre mer et montagne.' },
  'Jura': { climate: 'frais', neighbors: ['Bourgogne', 'Savoie', 'Alsace'], about: 'Petite région singulière : Savagnin, vins oxydatifs, rouges clairs de Poulsard et Trousseau.' },
  'Languedoc': { climate: 'chaud', neighbors: ['Roussillon', 'Rhône', 'Provence'], about: 'Rouges solaires de Syrah, Grenache, Carignan et Mourvèdre, aux arômes de garrigue.' },
  'Loire': { climate: 'frais', neighbors: ['Bourgogne', 'Bordeaux', 'Beaujolais'], about: 'Fraîcheur avant tout : Sauvignon, Chenin et Melon en blanc, Cabernet Franc en rouge.' },
  'Provence': { climate: 'chaud', neighbors: ['Rhône', 'Languedoc', 'Corse'], about: 'Rosés pâles en tête, mais aussi des rouges structurés comme à Bandol.' },
  'Rhône': { climate: 'chaud', neighbors: ['Languedoc', 'Provence', 'Beaujolais'], about: 'Syrah seule au nord, plus tendue ; assemblages à base de Grenache au sud, plus chaleureux.' },
  'Roussillon': { climate: 'chaud', neighbors: ['Languedoc', 'Rhône', 'Sud-Ouest'], about: 'Le vignoble le plus ensoleillé de France : rouges puissants et vins doux naturels.' },
  'Savoie': { climate: 'frais', neighbors: ['Jura', 'Alsace', 'Bourgogne'], about: 'Vins de montagne, légers et vifs : Jacquère, Altesse, Mondeuse.' },
  'Sud-Ouest': { climate: 'tempere', neighbors: ['Bordeaux', 'Languedoc', 'Roussillon'], about: 'Une mosaïque de cépages locaux : Malbec à Cahors, Tannat à Madiran, Manseng à Jurançon.' },
}

export const COUNTRIES = {
  'France': { climate: 'tempere', neighbors: ['Italie', 'Espagne', 'Allemagne'] },
  'Italie': { climate: 'tempere', neighbors: ['France', 'Espagne', 'Grèce'] },
  'Espagne': { climate: 'chaud', neighbors: ['Portugal', 'Italie', 'France'] },
  'Portugal': { climate: 'chaud', neighbors: ['Espagne', 'Italie', 'France'] },
  'Allemagne': { climate: 'frais', neighbors: ['Autriche', 'Suisse', 'France'] },
  'Autriche': { climate: 'frais', neighbors: ['Allemagne', 'Hongrie', 'Suisse'] },
  'Suisse': { climate: 'frais', neighbors: ['Autriche', 'Allemagne', 'France'] },
  'Grèce': { climate: 'chaud', neighbors: ['Italie', 'Espagne', 'Géorgie'] },
  'Hongrie': { climate: 'tempere', neighbors: ['Autriche', 'Allemagne', 'Géorgie'] },
  'Géorgie': { climate: 'tempere', neighbors: ['Grèce', 'Hongrie', 'Italie'] },
  'États-Unis': { climate: 'tempere', neighbors: ['Chili', 'Australie', 'Argentine'] },
  'Argentine': { climate: 'chaud', neighbors: ['Chili', 'États-Unis', 'Afrique du Sud'] },
  'Chili': { climate: 'tempere', neighbors: ['Argentine', 'États-Unis', 'Afrique du Sud'] },
  'Afrique du Sud': { climate: 'chaud', neighbors: ['Australie', 'Chili', 'Argentine'] },
  'Australie': { climate: 'chaud', neighbors: ['Afrique du Sud', 'Nouvelle-Zélande', 'États-Unis'] },
  'Nouvelle-Zélande': { climate: 'frais', neighbors: ['Australie', 'Chili', 'États-Unis'] },
  'Maroc': { climate: 'chaud', neighbors: ['Espagne', 'Portugal', 'Grèce'] },
}

export const CLIMATE_CLUES = {
  frais: 'Ce vin vient d\'un climat plutôt frais.',
  tempere: 'Ce vin vient d\'un climat tempéré.',
  chaud: 'Ce vin vient d\'un climat plutôt chaud et ensoleillé.',
}

function findIn(table, name) {
  const key = normalize(name)
  if (!key) return null
  const entry = Object.entries(table).find(([k]) => normalize(k) === key)
  return entry ? { name: entry[0], ...entry[1] } : null
}

export function findGrape(name) {
  const key = normalize(name)
  if (!key) return null
  return GRAPES.find(g => [g.name, ...(g.aliases ?? [])].some(n => normalize(n) === key)) ?? null
}
export const findRegion = (name) => findIn(REGIONS, name)
export const findCountry = (name) => findIn(COUNTRIES, name)

// Climat d'origine d'une bouteille : la région prime, sinon le pays
export function climateOf(reality) {
  return findRegion(reality.region)?.climate ?? findCountry(reality.country)?.climate ?? null
}
