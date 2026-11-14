// Saisie sensorielle — on désigne ce qu'on voit et sent plutôt que de choisir un mot dans une liste.
//   RobePicker : nuancier de pastilles colorées
//   AromaWheel : roue des arômes, une part par famille
//   Gauge      : jauge pour une échelle ordonnée (tanins, acidité, corps, longueur…)
// Les valeurs renvoyées sont les mêmes que celles des pastilles de texte : le modèle de données ne change pas.
import { robeToken, aromaToken } from '../data/sensory'

const toggleIn = (list, value) => {
  const current = Array.isArray(list) ? list : []
  return current.includes(value) ? current.filter(v => v !== value) : [...current, value]
}

// ─── Robe ────────────────────────────────────────────────────────────────────

export function RobePicker({ options, value, onChange }) {
  const selected = Array.isArray(value) ? value : []
  return (
    <div className="swatches">
      {options.map(name => {
        const active = selected.includes(name)
        return (
          <button type="button" key={name} className={`swatch ${active ? 'active' : ''}`} aria-pressed={active} onClick={() => onChange(toggleIn(selected, name))}>
            <span className="swatch-color" style={{ background: `var(${robeToken(name) ?? '--surface-alt'})` }} />
            <span className="swatch-name">{name}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Roue des arômes ─────────────────────────────────────────────────────────

const SIZE = 320
const CENTER = SIZE / 2
const OUTER = 156
const INNER = 50
const LABEL_RADIUS = 108
const GAP = 1.2          // degrés laissés entre deux parts
const LINE_HEIGHT = 12
const LINE_CHARS = 10    // longueur visée d'une ligne de libellé

const point = (radius, degrees) => {
  const rad = ((degrees - 90) * Math.PI) / 180
  return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)]
}

// Part d'anneau entre deux angles
function sectorPath(from, to) {
  const [x1, y1] = point(OUTER, from)
  const [x2, y2] = point(OUTER, to)
  const [x3, y3] = point(INNER, to)
  const [x4, y4] = point(INNER, from)
  const large = to - from > 180 ? 1 : 0
  return `M${x1} ${y1} A${OUTER} ${OUTER} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${INNER} ${INNER} 0 ${large} 0 ${x4} ${y4} Z`
}

// "Fruits à chair blanche" → ["Fruits à", "chair", "blanche"] : le libellé reste horizontal, sur quelques lignes
function wrapLabel(label) {
  const words = label.replace('/', ' / ').split(' ')
  const lines = []
  for (const word of words) {
    const last = lines[lines.length - 1]
    if (last !== undefined && (last + ' ' + word).length <= LINE_CHARS) lines[lines.length - 1] = `${last} ${word}`
    else if (word === '/' && last !== undefined) lines[lines.length - 1] = `${last} /`
    else lines.push(word)
  }
  return lines
}

export function AromaWheel({ options, value, onChange }) {
  const selected = Array.isArray(value) ? value : []
  const step = 360 / options.length
  return (
    <svg className="wheel" viewBox={`0 0 ${SIZE} ${SIZE}`} role="group" aria-label="Roue des arômes">
      {options.map((name, i) => {
        const active = selected.includes(name)
        const [lx, ly] = point(LABEL_RADIUS, (i + 0.5) * step)
        const lines = wrapLabel(name)
        const toggle = () => onChange(toggleIn(selected, name))
        return (
          <g
            key={name}
            className={`wheel-part ${active ? 'active' : ''}`}
            style={{ color: `var(${aromaToken(name)})` }}
            role="checkbox" aria-checked={active} aria-label={name} tabIndex={0}
            onClick={toggle}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() } }}
          >
            <path d={sectorPath(i * step + GAP, (i + 1) * step - GAP)} />
            <text x={lx} y={ly - ((lines.length - 1) * LINE_HEIGHT) / 2} textAnchor="middle" dominantBaseline="central">
              {lines.map((line, j) => <tspan key={j} x={lx} dy={j ? LINE_HEIGHT : 0}>{line}</tspan>)}
            </text>
          </g>
        )
      })}
      <text className="wheel-count" x={CENTER} y={CENTER - 6} textAnchor="middle" dominantBaseline="central">{selected.length || ''}</text>
      <text className="wheel-hint" x={CENTER} y={CENTER + (selected.length ? 14 : 0)} textAnchor="middle" dominantBaseline="central">
        {selected.length ? (selected.length > 1 ? 'familles' : 'famille') : 'Touche'}
      </text>
    </svg>
  )
}

// ─── Jauge ───────────────────────────────────────────────────────────────────

// Hauteur de la barre du premier et du dernier niveau, en % de la case : jamais vide, jamais pleine
const BAR_MIN = 18
const BAR_MAX = 82

// options : [{ value, label }] du plus faible au plus fort. Retoucher le niveau choisi l'efface.
export function Gauge({ options, value, onChange }) {
  const index = options.findIndex(o => o.value === value)
  return (
    <div className="gauge-box">
      <div className="gauge" role="radiogroup">
        {options.map((opt, i) => (
          <button
            type="button" key={opt.value} role="radio" aria-checked={i === index} aria-label={opt.label}
            className={`gauge-step ${index >= 0 && i <= index ? 'on' : ''}`}
            onClick={() => onChange(i === index ? null : opt.value)}
          >
            {/* La barre grandit avec le niveau : on lit l'intensité avant de lire le mot */}
            <span className="gauge-bar" style={{ height: `${BAR_MIN + (i / (options.length - 1)) * (BAR_MAX - BAR_MIN)}%` }} />
          </button>
        ))}
      </div>
      <div className="gauge-labels">
        <span>{options[0].label}</span>
        <span className="gauge-value">{index >= 0 ? options[index].label : ''}</span>
        <span>{options[options.length - 1].label}</span>
      </div>
    </div>
  )
}
