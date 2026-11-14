// Graphiques de MyWine — écrits en HTML/CSS simple, sans bibliothèque.
//   ProfileChart : ta perception face au profil typique du cépage (une glissière par axe)
//   StackBar     : une barre empilée (juste / proche / à revoir, ou répartition par type)
//   BarList      : classement en barres horizontales (cépages, régions…)
import { Check } from 'lucide-react'

const POSITIONS = 3 // les axes de la base ont trois niveaux

// Une glissière : un repère "Typique" (anneau) et un repère "Toi" (plein). `you` peut être null.
function AxisTrack({ label, ends, you, typical }) {
  const at = (index) => `${(index / (POSITIONS - 1)) * 100}%`
  const verdict = you === null ? 'non noté' : you === typical ? 'comme le profil typique' : you > typical ? 'plus que le profil typique' : 'moins que le profil typique'
  return (
    <div className="track-row" role="img" aria-label={`${label} : ${verdict}`}>
      <span className="track-label">{label}</span>
      <div className="track">
        <span className="track-line" />
        {Array.from({ length: POSITIONS }, (_, i) => <span key={i} className="track-stop" style={{ left: at(i) }} />)}
        <span className="track-mark typical" style={{ left: at(typical) }} />
        {you !== null && <span className={`track-mark you ${you === typical ? 'same' : ''}`} style={{ left: at(you) }} />}
      </div>
      <div className="track-ends"><span>{ends[0]}</span><span>{ends[1]}</span></div>
    </div>
  )
}

export function ProfileChart({ profile }) {
  return (
    <div className="profile">
      <div className="legend">
        <span><span className="legend-mark you" /> Toi</span>
        <span><span className="legend-mark typical" /> Typique du cépage {profile.grape}</span>
      </div>
      {profile.axes.map(({ key, ...axis }) => <AxisTrack key={key} {...axis} />)}
      {profile.aromas.length > 0 && (
        <div className="profile-aromas">
          <span className="track-label">Arômes typiques</span>
          <div className="chips">
            {profile.aromas.map(a => (
              <span key={a.name} className={`chip static ${a.found ? 'found' : ''}`}>
                {a.found && <Check size={14} />}{a.name}
              </span>
            ))}
          </div>
          {profile.extra.length > 0 && <p className="muted left">Tu as aussi senti : {profile.extra.join(', ').toLowerCase()}.</p>}
        </div>
      )}
    </div>
  )
}

// segments : [{ key, label, value, tone }] — `tone` est une classe de couleur (match, close, miss, rouge, blanc…)
export function StackBar({ segments, label }) {
  const shown = segments.filter(s => s.value > 0)
  const total = shown.reduce((sum, s) => sum + s.value, 0)
  if (!total) return null
  return (
    <div className="stack" role="img" aria-label={`${label} : ${shown.map(s => `${s.value} ${s.label}`).join(', ')}`}>
      <div className="stack-bar">
        {shown.map(s => <span key={s.key} className={`stack-part ${s.tone}`} style={{ flexGrow: s.value }} />)}
      </div>
      <div className="stack-legend">
        {shown.map(s => <span key={s.key}><span className={`dot ${s.tone}`} />{s.value} {s.label}</span>)}
      </div>
    </div>
  )
}

// items : [{ name, value, note }] déjà triés — la plus grande valeur donne la longueur de référence
export function BarList({ items, unit }) {
  const max = Math.max(...items.map(i => i.value), 1)
  return (
    <div className="bars">
      {items.map(item => (
        <div key={item.name} className="bar-row">
          <span className="bar-name">{item.name}</span>
          <span className="bar-track"><span className="bar-fill" style={{ width: `${(item.value / max) * 100}%` }} /></span>
          <span className="bar-value">{item.note ?? `${item.value}${unit ? ` ${unit}` : ''}`}</span>
        </div>
      ))}
    </div>
  )
}
