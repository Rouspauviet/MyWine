// Carte des saveurs — les cépages d'une couleur placés selon leur matière (horizontal) et leur
// fraîcheur (vertical). Deux cépages proches se ressemblent en bouche, et se confondent à l'aveugle.
// On y pose ce que le dégustateur a perçu (`you`), la vraie bouteille (`real`) ou son journal (`counts`).
// Ne montre que la base de connaissances : rien ici ne peut révéler la bouteille d'une dégustation.
import { GRAPES } from '../data/wineKnowledge'
import { fineProfile } from '../data/grapeProfiles'
import { flavorPoint, FLAVOR_AXES, SCALE_MAX } from '../utils/profile'

const WIDTH = 320
const HEIGHT = 300
const PAD = { left: 16, right: 16, top: 26, bottom: 26 }
const DOT = 4
const DOT_STEP = 3
const DOT_MAX = 13
const LABEL_WIDTH = 6.2    // largeur moyenne d'un caractère, pour estimer la place d'un nom
const LABEL_HEIGHT = 13
const RELAX_ROUNDS = 24

const px = (value) => PAD.left + ((value - 1) / (SCALE_MAX - 1)) * (WIDTH - PAD.left - PAD.right)
const py = (value) => HEIGHT - PAD.bottom - ((value - 1) / (SCALE_MAX - 1)) * (HEIGHT - PAD.top - PAD.bottom)
const clamp = (v, min, max) => Math.min(Math.max(v, min), max)

// Écarte les noms qui se chevauchent : chaque nom glisse verticalement, son point ne bouge pas
function layout(color) {
  const points = GRAPES.filter(g => g.color === color).map(grape => {
    const at = flavorPoint(fineProfile(grape), color)
    return at && { name: grape.name, x: px(at.x), y: py(at.y), labelY: py(at.y) - 9, half: (grape.name.length * LABEL_WIDTH) / 2 }
  }).filter(Boolean)
  // Les points superposés (même profil) sont légèrement décalés pour rester visibles tous les deux
  points.forEach((p, i) => points.slice(0, i).forEach(q => { if (Math.abs(p.x - q.x) < 2 && Math.abs(p.y - q.y) < 2) { p.x += 10; p.y += 4; p.labelY = p.y + 15 } }))
  for (let round = 0; round < RELAX_ROUNDS; round++) {
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i]
        const b = points[j]
        if (Math.abs(a.x - b.x) > a.half + b.half + 4 || Math.abs(a.labelY - b.labelY) > LABEL_HEIGHT) continue
        const push = (LABEL_HEIGHT - Math.abs(a.labelY - b.labelY)) / 2 + 0.5
        const up = a.labelY <= b.labelY ? a : b
        const down = up === a ? b : a
        up.labelY -= push
        down.labelY += push
      }
    }
  }
  return points.map(p => ({ ...p, labelX: clamp(p.x, p.half + 2, WIDTH - p.half - 2), labelY: clamp(p.labelY, 10, HEIGHT - 4) }))
}

const LAYOUTS = { rouge: layout('rouge'), blanc: layout('blanc') }

export default function FlavorMap({ color, you, real, near = [], counts, onPick }) {
  const points = LAYOUTS[color]
  if (!points) return null
  const axes = FLAVOR_AXES[color]
  const realPoint = points.find(p => p.name === real) ?? null
  const youAt = you ? { x: px(you.x), y: py(you.y) } : null
  const kindOf = (p) => (p.name === real ? 'real' : counts?.[p.name] ? 'visited' : near.includes(p.name) ? 'near' : counts ? 'idle' : 'plain')
  const radiusOf = (p) => (counts?.[p.name] ? Math.min(DOT + DOT_STEP * Math.sqrt(counts[p.name]), DOT_MAX) : p.name === real ? 7 : DOT)

  const label = [
    `Carte des saveurs des ${color === 'rouge' ? 'rouges' : 'blancs'}`,
    real && `la bouteille : ${real}`,
    you && 'ta perception y est placée',
  ].filter(Boolean).join(', ')

  return (
    <svg className="flavor" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={label}>
      <rect className="flavor-frame" x={PAD.left - 8} y={PAD.top - 8} width={WIDTH - PAD.left - PAD.right + 16} height={HEIGHT - PAD.top - PAD.bottom + 16} rx="10" />
      <line className="flavor-axis" x1={px(3)} y1={PAD.top - 8} x2={px(3)} y2={HEIGHT - PAD.bottom + 8} />
      <line className="flavor-axis" x1={PAD.left - 8} y1={py(3)} x2={WIDTH - PAD.right + 8} y2={py(3)} />
      {/* Matière : sous le cadre. Fraîcheur : en haut et en bas à gauche, pour ne pas se mêler aux noms */}
      <text className="flavor-end" x={PAD.left - 6} y={HEIGHT - 5}>← {axes.x[0]}</text>
      <text className="flavor-end" x={WIDTH - PAD.right + 6} y={HEIGHT - 5} textAnchor="end">{axes.x[1]} →</text>
      <text className="flavor-end" x={PAD.left - 6} y={12}>↑ {axes.y[1]}</text>
      <text className="flavor-end inside" x={PAD.left} y={HEIGHT - PAD.bottom}>↓ {axes.y[0]}</text>

      {youAt && realPoint && <line className="map-link" x1={youAt.x} y1={youAt.y} x2={realPoint.x} y2={realPoint.y} />}
      {points.map(p => {
        const kind = kindOf(p)
        return (
          <g key={p.name} className={`flavor-grape ${kind}`} onClick={onPick ? () => onPick(p.name) : undefined}>
            {onPick && <circle className="map-hit" cx={p.x} cy={p.y} r="16" />}
            <circle className="flavor-dot" cx={p.x} cy={p.y} r={radiusOf(p)} />
            <text className="flavor-name" x={p.labelX} y={p.labelY} textAnchor="middle">{p.name}</text>
          </g>
        )
      })}
      {youAt && (
        <g className="flavor-you">
          <circle cx={youAt.x} cy={youAt.y} r="7" />
          <text x={youAt.x} y={youAt.y + 20} textAnchor="middle">Toi</text>
        </g>
      )}
    </svg>
  )
}
