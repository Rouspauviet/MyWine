// Logique de comparaison hypothèses ↔ réalité — MyWine
import { normalize } from './text'

// Compare deux listes de cépages
function matchGrapes(hypoList, realList) {
  if (!hypoList?.length || !realList?.length) return null
  const hypoNorm = hypoList.map(normalize)
  const realNorm = realList.map(normalize)

  if (hypoNorm.some(h => realNorm.includes(h))) return 'exact'
  if (hypoNorm.some(h => realNorm.some(r => r.includes(h) || h.includes(r)))) return 'close'
  return 'miss'
}

// Compare deux champs texte simples
function matchField(hypo, real) {
  if (!hypo || !real) return null
  const h = normalize(hypo)
  const r = normalize(real)
  if (h === r) return 'exact'
  if (r.includes(h) || h.includes(r)) return 'close'
  return 'miss'
}

// Millésime : juste si identique, proche à ± 2 ans
function matchVintage(hypo, real) {
  const h = parseInt(hypo, 10)
  const r = parseInt(real, 10)
  if (isNaN(h) || isNaN(r)) return null
  if (h === r) return 'exact'
  return Math.abs(h - r) <= 2 ? 'close' : 'miss'
}

// Indices déterministes tirés de la structure perçue (format v2 : { v, wineType, data })
function buildInsights(wineType, data) {
  const out = []
  const is = (key, ...values) => values.includes(data[key])

  if (wineType === 'rouge') {
    if (is('taninIntensity', 't4', 't5') && is('body', 'ample')) {
      out.push('Tanins marqués + corps ample : cépage à forte extraction ou élevage en bois présent.')
    }
    if (is('fruitMaturity', 'cuit') && is('body', 'ample')) {
      out.push('Fruit cuit + corps ample : souvent un climat chaud, une vendange très mûre.')
    }
    if (is('acidity', 'fraiche') && is('body', 'leger')) {
      out.push('Acidité fraîche + corps léger : souvent un climat frais ou un cépage peu extrait (Pinot Noir, Gamay…).')
    }
    if (is('fruitMaturity', 'tertiaire')) {
      out.push('Tertiaire dominant : souvent le signe d\'un vin déjà évolué.')
    }
  }

  if (wineType === 'blanc') {
    if (is('acidity', 'vive', 'tranchante') && is('texture', 'legere')) {
      out.push('Acidité vive + texture légère : souvent un climat frais ou un cépage naturellement acide (Riesling, Sauvignon, Chenin…).')
    }
    if (is('texture', 'onctueuse', 'grasse') && is('boise', 'present', 'dominant')) {
      out.push('Gras + boisé : élevage en fût probable, style souvent associé au Chardonnay.')
    }
    if (is('minerality', 'marquee')) {
      out.push('Minéralité marquée : souvent un terroir frais, sols calcaires ou siliceux.')
    }
  }

  if (wineType === 'rose') {
    if (is('vivacity', 'fraiche', 'vive') && is('perceivedSweetness', 'sec')) {
      out.push('Vif et sec : profil de rosé de pressurage direct, type Provence.')
    }
    if (is('lightStructure', 'presente', 'nette')) {
      out.push('Structure perceptible : rosé de saignée ou de gastronomie plutôt que d\'apéritif.')
    }
  }

  if (wineType === 'petillant') {
    if (is('bubbleQuality', 'tres_fines', 'fines') && is('sparklingRegister', 'levure')) {
      out.push('Bulles fines + notes de levure/brioche : méthode traditionnelle avec élevage sur lattes probable.')
    }
    if (is('bubbleQuality', 'grossieres', 'vives') && is('sparklingRegister', 'frais')) {
      out.push('Bulles vives + fruit frais dominant : souvent une méthode en cuve close (type Prosecco).')
    }
  }

  if (wineType === 'orange') {
    if (is('phenolicIntensity', 'marquee', 'tres_marquee')) {
      out.push('Texture phénolique marquée : macération pelliculaire longue.')
    }
    if (is('oxidativeRegister', 'present', 'dominant')) {
      out.push('Registre oxydatif présent : élevage peu protégé (amphore, ouillage limité).')
    }
  }

  return out.slice(0, 2)
}

// Calcule la comparaison et les indices
export function computeComparison(record, reality) {
  const h = record.hypotheses || {}
  const matches = {}
  const set = (key, result) => { if (result) matches[key] = result }

  if (record.wineType && reality.type) {
    matches.type = record.wineType === reality.type ? 'exact' : 'miss'
  }
  set('grapes', matchGrapes(h.grapes, reality.grapes))
  set('country', matchField(h.country, reality.country))
  set('region', matchField(h.region, reality.region))
  set('appellation', matchField(h.appellation, reality.appellation))
  set('vintage', matchVintage(h.vintage, reality.vintage))
  set('producer', matchField(h.producer, reality.producer))

  return {
    matches,
    insights: buildInsights(record.wineType, record.structure?.data ?? {}),
  }
}

// Libellé et couleur du badge selon le résultat
export function matchBadge(matchResult) {
  switch (matchResult) {
    case 'exact': return { label: 'Juste', color: 'match' }
    case 'close': return { label: 'Proche', color: 'close' }
    case 'miss': return { label: 'À revoir', color: 'miss' }
    default: return null
  }
}
