// Profils fins des cépages — complète wineKnowledge.js sans le modifier.
// tannin, body, acidity : de 1 (très faible) à 5 (très marqué) · notes : arômes précis les plus typiques
// regions : régions françaises de la carte où on le trouve · abroad : principaux pays hors de France
// Ce sont des tendances générales : un vin peut s'en écarter (terroir, millésime, vinification).
import { findGrape } from './wineKnowledge'

const PROFILES = {
  // ── Rouges ──
  'Pinot Noir':         { tannin: 2, body: 2, acidity: 4, notes: ['Cerise', 'Framboise', 'Sous-bois', 'Champignon'], regions: ['Bourgogne', 'Champagne', 'Alsace', 'Loire', 'Jura'], abroad: ['Allemagne', 'Nouvelle-Zélande', 'États-Unis'] },
  'Gamay':              { tannin: 1, body: 2, acidity: 4, notes: ['Fraise', 'Cerise', 'Pivoine', 'Bonbon'], regions: ['Beaujolais', 'Loire', 'Savoie'], abroad: ['Suisse'] },
  'Cabernet Franc':     { tannin: 3, body: 3, acidity: 4, notes: ['Framboise', 'Violette', 'Poivron', 'Graphite'], regions: ['Loire', 'Bordeaux', 'Sud-Ouest'], abroad: ['Italie', 'Argentine'] },
  'Merlot':             { tannin: 3, body: 4, acidity: 3, notes: ['Prune', 'Cerise noire', 'Chocolat', 'Vanille'], regions: ['Bordeaux', 'Sud-Ouest', 'Languedoc'], abroad: ['Italie', 'États-Unis', 'Chili'] },
  'Cabernet Sauvignon': { tannin: 5, body: 5, acidity: 3, notes: ['Cassis', 'Cèdre', 'Poivron', 'Tabac'], regions: ['Bordeaux', 'Sud-Ouest', 'Languedoc', 'Provence'], abroad: ['États-Unis', 'Chili', 'Australie'] },
  'Syrah':              { tannin: 4, body: 5, acidity: 3, notes: ['Mûre', 'Poivre', 'Violette', 'Olive noire'], regions: ['Rhône', 'Languedoc', 'Roussillon', 'Provence'], abroad: ['Australie', 'Afrique du Sud'] },
  'Grenache':           { tannin: 3, body: 4, acidity: 2, notes: ['Fraise mûre', 'Garrigue', 'Épices douces', 'Réglisse'], regions: ['Rhône', 'Languedoc', 'Roussillon', 'Provence'], abroad: ['Espagne', 'Australie'] },
  'Mourvèdre':          { tannin: 5, body: 5, acidity: 3, notes: ['Mûre', 'Cuir', 'Gibier', 'Poivre'], regions: ['Provence', 'Languedoc', 'Roussillon', 'Rhône'], abroad: ['Espagne'] },
  'Carignan':           { tannin: 4, body: 4, acidity: 4, notes: ['Fruits noirs', 'Garrigue', 'Réglisse', 'Terre'], regions: ['Languedoc', 'Roussillon', 'Provence'], abroad: ['Espagne', 'Italie'] },
  'Malbec':             { tannin: 4, body: 5, acidity: 3, notes: ['Prune', 'Mûre', 'Violette', 'Cacao'], regions: ['Sud-Ouest', 'Loire'], abroad: ['Argentine', 'Chili'] },
  'Tannat':             { tannin: 5, body: 5, acidity: 4, notes: ['Mûre', 'Cassis', 'Réglisse', 'Fumé'], regions: ['Sud-Ouest'], abroad: ['Uruguay'] },
  'Sangiovese':         { tannin: 4, body: 3, acidity: 5, notes: ['Cerise acidulée', 'Herbes sèches', 'Tomate séchée', 'Cuir'], regions: ['Corse'], abroad: ['Italie'] },
  'Nebbiolo':           { tannin: 5, body: 4, acidity: 5, notes: ['Rose', 'Cerise', 'Goudron', 'Truffe'], regions: [], abroad: ['Italie'] },
  'Tempranillo':        { tannin: 3, body: 3, acidity: 3, notes: ['Cerise', 'Cuir', 'Tabac', 'Vanille'], regions: [], abroad: ['Espagne', 'Portugal'] },
  'Zinfandel':          { tannin: 3, body: 5, acidity: 2, notes: ['Mûre confite', 'Pruneau', 'Poivre', 'Cannelle'], regions: [], abroad: ['États-Unis', 'Italie'] },

  // ── Blancs ──
  'Chardonnay':         { body: 4, acidity: 3, notes: ['Pomme', 'Citron', 'Beurre', 'Noisette'], regions: ['Bourgogne', 'Champagne', 'Jura', 'Languedoc'], abroad: ['États-Unis', 'Australie', 'Chili'] },
  'Sauvignon Blanc':    { body: 2, acidity: 5, notes: ['Pamplemousse', 'Buis', 'Bourgeon de cassis', 'Fruit de la passion'], regions: ['Loire', 'Bordeaux', 'Sud-Ouest'], abroad: ['Nouvelle-Zélande', 'Chili', 'Afrique du Sud'] },
  'Chenin Blanc':       { body: 3, acidity: 5, notes: ['Coing', 'Pomme', 'Miel', 'Cire'], regions: ['Loire'], abroad: ['Afrique du Sud'] },
  'Riesling':           { body: 2, acidity: 5, notes: ['Citron vert', 'Fleurs blanches', 'Pêche', 'Pétrole'], regions: ['Alsace'], abroad: ['Allemagne', 'Autriche', 'Australie'] },
  'Gewurztraminer':     { body: 5, acidity: 2, notes: ['Litchi', 'Rose', 'Gingembre', 'Miel'], regions: ['Alsace'], abroad: ['Allemagne', 'Italie'] },
  'Viognier':           { body: 5, acidity: 2, notes: ['Abricot', 'Pêche', 'Violette', 'Fleur d\'oranger'], regions: ['Rhône', 'Languedoc'], abroad: ['États-Unis', 'Australie'] },
  'Pinot Gris':         { body: 4, acidity: 3, notes: ['Poire', 'Fruits jaunes', 'Fumé', 'Miel'], regions: ['Alsace'], abroad: ['Italie', 'Allemagne'] },
  'Melon de Bourgogne': { body: 1, acidity: 4, notes: ['Citron', 'Pomme verte', 'Iode', 'Levure'], regions: ['Loire'], abroad: [] },
  'Aligoté':            { body: 2, acidity: 4, notes: ['Citron', 'Pomme verte', 'Fleurs blanches', 'Noisette fraîche'], regions: ['Bourgogne'], abroad: [] },
  'Sémillon':           { body: 4, acidity: 2, notes: ['Miel', 'Cire', 'Abricot', 'Citron confit'], regions: ['Bordeaux', 'Sud-Ouest'], abroad: ['Australie'] },
  'Vermentino':         { body: 3, acidity: 3, notes: ['Citron', 'Fleurs blanches', 'Fenouil', 'Amande'], regions: ['Corse', 'Provence', 'Languedoc'], abroad: ['Italie'] },
  'Muscat':             { body: 2, acidity: 3, notes: ['Raisin frais', 'Fleur d\'oranger', 'Rose', 'Litchi'], regions: ['Alsace', 'Roussillon', 'Languedoc'], abroad: ['Italie', 'Grèce'] },
  'Romorantin':         { body: 3, acidity: 4, notes: ['Coing', 'Miel', 'Acacia', 'Pierre mouillée'], regions: ['Loire'], abroad: [] },
  'Albariño':           { body: 2, acidity: 4, notes: ['Pêche', 'Citron', 'Abricot', 'Iode'], regions: [], abroad: ['Espagne', 'Portugal'] },
}

// Le profil fin d'un cépage (objet de wineKnowledge ou nom), ou null s'il n'est pas dans la base
export function fineProfile(grape) {
  const entry = typeof grape === 'string' ? findGrape(grape) : grape
  return entry ? (PROFILES[entry.name] ?? null) : null
}

// Arômes précis proposés sous chaque famille de la roue (rouges et blancs)
export const AROMA_DETAILS = {
  'Fruits noirs': ['Cassis', 'Mûre', 'Myrtille', 'Prune'],
  'Fruits rouges': ['Fraise', 'Framboise', 'Cerise', 'Groseille'],
  'Floral': ['Violette', 'Rose', 'Pivoine', 'Fleurs blanches', 'Acacia'],
  'Épices': ['Poivre', 'Réglisse', 'Clou de girofle', 'Cannelle'],
  'Terreux': ['Sous-bois', 'Champignon', 'Humus', 'Truffe'],
  'Animal': ['Cuir', 'Gibier', 'Fumé'],
  'Végétal': ['Poivron', 'Herbe coupée', 'Buis', 'Menthe'],
  'Boisé': ['Vanille', 'Grillé', 'Cèdre', 'Café'],
  'Balsamique': ['Résine', 'Eucalyptus', 'Goudron'],
  'Agrumes': ['Citron', 'Pamplemousse', 'Orange', 'Zeste'],
  'Fruits à chair blanche': ['Pomme', 'Poire', 'Pêche', 'Coing'],
  'Fruits tropicaux': ['Ananas', 'Mangue', 'Litchi', 'Fruit de la passion'],
  'Minéral': ['Silex', 'Craie', 'Pierre mouillée', 'Iode'],
  'Miel/Cire': ['Miel', 'Cire d\'abeille', 'Amande'],
  'Oxydatif': ['Noix', 'Pomme blette', 'Curry'],
}
