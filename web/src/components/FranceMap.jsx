// Carte de France des régions viticoles — deux usages :
//   Comparaison : `real` (région de la bouteille) et `guess` (région supposée), reliées par un trait
//   Mon palais  : `counts` (bouteilles par région), la taille du point suit le nombre ; `onPick` au toucher
import { OUTLINES, MAP_REGIONS, MAP_WIDTH, MAP_HEIGHT } from '../data/franceMap'
import { normalize } from '../utils/text'

const DOT = 4          // point d'une région non concernée
const DOT_ACTIVE = 8   // région mise en avant
const DOT_STEP = 3     // agrandissement par bouteille (en racine carrée)
const DOT_MAX = 15

const same = (a, b) => !!a && !!b && normalize(a) === normalize(b)

export default function FranceMap({ real, guess, counts, selected, onPick }) {
  const find = (name) => MAP_REGIONS.find(r => same(r.name, name)) ?? null
  const realPoint = find(real)
  const guessPoint = find(guess)
  const apart = realPoint && guessPoint && realPoint !== guessPoint

  const radiusOf = (region) => {
    if (counts) {
      const n = counts[region.name] ?? 0
      return n ? Math.min(DOT + DOT_STEP * Math.sqrt(n), DOT_MAX) : DOT
    }
    return region === realPoint || region === guessPoint ? DOT_ACTIVE : DOT
  }
  const kindOf = (region) => {
    if (counts) return (counts[region.name] ?? 0) > 0 ? (same(region.name, selected) ? 'real' : 'visited') : 'idle'
    if (region === realPoint) return 'real'
    if (region === guessPoint) return 'guess'
    return 'idle'
  }

  const label = [
    real && `Région de la bouteille : ${real}`,
    guess && `Ton hypothèse : ${guess}`,
    counts && `Régions goûtées : ${Object.keys(counts).join(', ') || 'aucune'}`,
  ].filter(Boolean).join('. ')

  return (
    <svg className="map" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label={`Carte de France. ${label}`}>
      {OUTLINES.map((d, i) => <path key={i} className="map-land" d={d} />)}
      {apart && <line className="map-link" x1={guessPoint.x} y1={guessPoint.y} x2={realPoint.x} y2={realPoint.y} />}
      {MAP_REGIONS.map(region => {
        const kind = kindOf(region)
        const r = radiusOf(region)
        const named = kind !== 'idle'
        const left = region.side === 'left'
        const below = region.side === 'below'
        const nameX = below ? region.x : region.x + (left ? -r - 4 : r + 4)
        const nameY = below ? region.y + r + 12 : region.y + 4 + region.dy
        return (
          <g key={region.name} className={`map-region ${kind}`} onClick={onPick && named ? () => onPick(region.name) : undefined}>
            {/* Zone de toucher plus large que le point */}
            {onPick && named && <circle className="map-hit" cx={region.x} cy={region.y} r={Math.max(r, 18)} />}
            <circle className="map-dot" cx={region.x} cy={region.y} r={r} />
            {named && (
              <text className="map-name" x={nameX} y={nameY} textAnchor={below ? 'middle' : left ? 'end' : 'start'}>
                {region.name}{counts ? ` · ${counts[region.name]}` : ''}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
