// Carte de France stylisée — contour simplifié et position des régions viticoles de la base.
// Dessinée dans l'app à partir de coordonnées approximatives : c'est un repère visuel, pas un fond de carte.
// Projection simple : la longitude est resserrée par le cosinus de la latitude moyenne.

const SCALE = 30            // unités de dessin par degré de latitude
const LON_FACTOR = 0.69     // cos(46,5°)
const WEST = -5.3
const NORTH = 51.4

const project = ([lat, lon]) => [
  Math.round((lon - WEST) * LON_FACTOR * SCALE * 10) / 10,
  Math.round((NORTH - lat) * SCALE * 10) / 10,
]

export const MAP_WIDTH = 312
export const MAP_HEIGHT = 310

// [latitude, longitude], dans le sens des aiguilles d'une montre depuis Dunkerque
const MAINLAND = [
  [51.05, 2.4], [50.75, 3.15], [50.3, 4.1], [50.15, 4.83], [49.55, 5.8], [49.45, 6.35], [49.2, 6.75],
  [49.05, 7.6], [48.97, 8.23], [48.0, 7.6], [47.59, 7.59], [47.45, 7.0], [46.9, 6.45], [46.45, 6.1],
  [46.15, 5.97], [46.4, 6.8], [45.92, 7.04], [45.1, 6.65], [44.4, 6.95], [44.1, 7.65], [43.79, 7.53],
  [43.55, 7.0], [43.2, 6.65], [43.07, 6.1], [43.2, 5.35], [43.35, 4.85], [43.45, 4.4], [43.4, 3.7],
  [43.2, 3.2], [42.7, 3.03], [42.43, 3.17], [42.45, 2.0], [42.6, 1.45], [42.85, 0.7], [42.7, 0.0],
  [42.95, -0.75], [43.3, -1.78], [43.5, -1.52], [44.65, -1.25], [45.57, -1.1], [46.15, -1.2],
  [46.5, -1.8], [47.0, -2.1], [47.28, -2.5], [47.6, -3.1], [47.8, -4.35], [48.05, -4.75], [48.38, -4.78],
  [48.65, -4.4], [48.8, -3.5], [48.83, -3.0], [48.6, -2.6], [48.65, -2.0], [48.63, -1.5], [49.2, -1.6],
  [49.72, -1.95], [49.67, -1.25], [49.35, -1.1], [49.3, -0.3], [49.5, 0.1], [49.75, 0.4], [49.93, 1.08],
  [50.2, 1.55], [50.72, 1.6], [50.95, 1.85],
]
const CORSICA = [
  [43.0, 9.4], [42.55, 9.53], [41.9, 9.4], [41.4, 9.2], [41.6, 8.8], [42.0, 8.6], [42.4, 8.6], [42.7, 9.1],
]

const toPath = (points) => `${points.map((p, i) => `${i ? 'L' : 'M'}${project(p).join(' ')}`).join(' ')} Z`

export const OUTLINES = [toPath(MAINLAND), toPath(CORSICA)]

// Position de chaque région (son cœur viticole) et côté où écrire son nom
// side : 'left' | 'right' | 'below' (sous le point) — dy : décalage vertical du nom, pour éviter les chevauchements dans l'est
const REGION_POINTS = {
  'Alsace':     { at: [48.2, 7.4],   side: 'left' },
  'Champagne':  { at: [49.05, 4.0],  side: 'left' },
  'Bourgogne':  { at: [47.25, 4.75], side: 'left' },
  'Jura':       { at: [46.8, 5.8],   side: 'right' },
  'Beaujolais': { at: [46.1, 4.6],   side: 'left' },
  'Savoie':     { at: [45.6, 6.1],   side: 'right', dy: 4 },
  'Loire':      { at: [47.3, 0.3],   side: 'below' },
  'Bordeaux':   { at: [44.9, -0.5],  side: 'left' },
  'Sud-Ouest':  { at: [43.9, 1.0],   side: 'below' },
  'Rhône':      { at: [44.7, 4.8],   side: 'left' },
  'Languedoc':  { at: [43.55, 3.2],  side: 'left', dy: -6 },
  'Roussillon': { at: [42.7, 2.7],   side: 'left', dy: 6 },
  'Provence':   { at: [43.5, 6.0],   side: 'right', dy: 10 },
  'Corse':      { at: [42.15, 9.1],  side: 'left' },
}

export const MAP_REGIONS = Object.entries(REGION_POINTS).map(([name, { at, side, dy = 0 }]) => {
  const [x, y] = project(at)
  return { name, x, y, side, dy }
})
