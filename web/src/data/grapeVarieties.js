// Liste des cépages (~100) pour l'autocomplete
// Cépages français + internationaux courants

export const GRAPE_VARIETIES = [
  // Rouges français
  'Cabernet Sauvignon', 'Merlot', 'Cabernet Franc', 'Pinot Noir', 'Syrah',
  'Grenache', 'Mourvèdre', 'Cinsault', 'Carignan', 'Malbec',
  'Petit Verdot', 'Tannat', 'Cot', 'Gamay', 'Poulsard',
  'Trousseau', 'Pinot Meunier', 'Mondeuse',

  // Blancs français
  'Chardonnay', 'Sauvignon Blanc', 'Riesling', 'Gewurztraminer', 'Pinot Gris',
  'Muscat Blanc', 'Chenin Blanc', 'Viognier', 'Roussanne', 'Marsanne',
  'Grenache Blanc', 'Clairette', 'Bourboulenc', 'Rolle / Vermentino',
  'Ugni Blanc', 'Muscadet / Melon de Bourgogne', 'Picpoul',
  'Aligoté', 'Pinot Blanc', 'Auxerrois', 'Savagnin', 'Jacquère',
  'Romorantin', 'Menu Pineau',
  'Gros Manseng', 'Petit Manseng', 'Petit Courbu',

  // Italiens
  'Sangiovese', 'Nebbiolo', 'Barbera', 'Dolcetto', 'Montepulciano',
  'Primitivo', 'Aglianico', "Nero d'Avola", 'Corvina', 'Garganega',
  'Pinot Grigio', 'Fiano', 'Greco di Tufo', 'Falanghina', 'Trebbiano',
  'Glera',

  // Espagnols & Portugais
  'Tempranillo', 'Garnacha', 'Monastrell', 'Bobal', 'Graciano',
  'Albariño', 'Godello', 'Verdejo', 'Macabeo',
  'Touriga Nacional', 'Baga', 'Trincadeira', 'Alvarinho',

  // Allemands & Autrichiens
  'Riesling', 'Müller-Thurgau', 'Silvaner', 'Grüner Veltliner',
  'Blaufränkisch', 'Zweigelt', 'Sankt Laurent',

  // Nouveaux Mondes
  'Zinfandel', 'Petite Sirah', 'Carménère', 'Torrontés',
  'Pinotage', 'Xinomavro',

  // Autres
  'Chasselas', 'Savatiano', 'Assyrtiko', 'Agiorgitiko',
  'Furmint', 'Rkatsiteli', 'Mtsvane',
]

// Dédupliqué et trié alphabétiquement
export const GRAPE_VARIETIES_SORTED = [...new Set(GRAPE_VARIETIES)].sort((a, b) =>
  a.localeCompare(b, 'fr', { sensitivity: 'base' })
)
