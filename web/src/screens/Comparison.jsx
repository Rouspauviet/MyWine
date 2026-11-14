// Comparaison — hypothèses vs réalité, côte à côte
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { FileText, Lightbulb, Share2, Check, GraduationCap } from 'lucide-react'
import { buildLesson } from '../utils/pedagogy'
import { Screen, Header, Body, Footer, Card, Loading, useAsync } from '../components/Layout'
import * as db from '../db/db'
import { matchBadge } from '../utils/comparison'
import { WINE_TYPES, CLIMATE_OPTIONS, SOIL_OPTIONS } from '../data/wineData'
import { labelOf, hasReality, recordTitle, normalize } from '../utils/text'
import { LEVELS } from '../data/levels'
import { buildProfile, mainGrapeOf, perceivedOf, flavorPoint } from '../utils/profile'
import FlavorMap from '../components/FlavorMap'
import { grapePath } from './Grape'
import { ProfileChart } from '../components/Charts'
import FranceMap from '../components/FranceMap'
import RevealSequence from '../components/RevealSequence'
import { MAP_REGIONS } from '../data/franceMap'
import { usePhotoUrls } from '../utils/photos'
import { buildShareImage } from '../utils/shareCard'

// L'aide utilisée pendant la dégustation, dite sans jugement : "2 indices, aide au raisonnement" (ou null)
export function helpUsed(record) {
  const parts = []
  if (record.cluesUsed) parts.push(`${record.cluesUsed} indice${record.cluesUsed > 1 ? 's' : ''}`)
  if (record.reasoningUsed) parts.push('aide au raisonnement')
  return parts.join(', ') || null
}

// Champs comparés, dans l'ordre d'affichage
export const COMPARISON_FIELDS = [
  { key: 'type',        label: 'Type',        hypo: r => labelOf(WINE_TYPES, r.wineType), real: r => labelOf(WINE_TYPES, r.reality.type) },
  { key: 'grapes',      label: 'Cépage(s)',   hypo: r => r.hypotheses.grapes?.join(', '),  real: r => r.reality.grapes?.join(', ') },
  { key: 'country',     label: 'Pays',        hypo: r => r.hypotheses.country,             real: r => r.reality.country },
  { key: 'region',      label: 'Région',      hypo: r => r.hypotheses.region,              real: r => r.reality.region },
  { key: 'appellation', label: 'Appellation', hypo: r => r.hypotheses.appellation,         real: r => r.reality.appellation },
  { key: 'vintage',     label: 'Millésime',   hypo: r => r.hypotheses.vintage || r.hypotheses.vintageRange?.label,             real: r => r.reality.vintage },
  { key: 'producer',    label: 'Producteur',  hypo: r => r.hypotheses.producer,            real: r => r.reality.producer },
]

export function summarize(matches) {
  const values = Object.values(matches || {})
  const count = (v) => values.filter(x => x === v).length
  const parts = []
  if (count('exact')) parts.push(`${count('exact')} juste${count('exact') > 1 ? 's' : ''}`)
  if (count('close')) parts.push(`${count('close')} proche${count('close') > 1 ? 's' : ''}`)
  if (count('miss')) parts.push(`${count('miss')} à revoir`)
  return parts.join(' · ')
}

// Résumé texte à partager dans la messagerie du groupe (dégustation à plusieurs)
const SHARE_MARKS = { exact: '✔', close: '≈', miss: '✘' }

export function shareText(record) {
  const matches = record.comparison?.matches || {}
  const lines = COMPARISON_FIELDS
    .filter(f => matches[f.key])
    .map(f => `${SHARE_MARKS[matches[f.key]]} ${f.label} : ${f.hypo(record)}`)
  const level = labelOf(LEVELS, record.level)
  const clues = helpUsed(record)
  return [
    `Ma dégustation à l'aveugle — ${recordTitle(record)}`,
    [summarize(matches), level && `niveau ${level}`, clues].filter(Boolean).join(' · '),
    ...lines,
  ].filter(Boolean).join('\n')
}

// Partage du résultat : une image quand le téléphone sait en partager une, sinon le texte
export function ShareResultButton({ record }) {
  const [copied, setCopied] = useState(false)
  const share = async () => {
    const text = shareText(record)
    const matches = record.comparison?.matches || {}
    try {
      const blob = await buildShareImage(record, {
        rows: COMPARISON_FIELDS.filter(f => matches[f.key]).map(f => ({ label: f.label, hypo: f.hypo(record), match: matches[f.key] })),
        summary: summarize(matches),
        footer: [labelOf(LEVELS, record.level) && `Niveau ${labelOf(LEVELS, record.level)}`, helpUsed(record)].filter(Boolean).join(' · '),
      })
      const file = blob && new File([blob], 'mywine-resultat.png', { type: 'image/png' })
      if (file && navigator.canShare?.({ files: [file] })) return await navigator.share({ files: [file] })
    } catch (err) {
      if (err?.name === 'AbortError') return // partage annulé
    }
    try {
      if (navigator.share) await navigator.share({ text })
      else { await navigator.clipboard.writeText(text); setCopied(true) }
    } catch { /* partage annulé */ }
  }
  return (
    <button className="btn btn-secondary block" onClick={share}>
      <Share2 size={18} /> {copied ? 'Résultat copié' : 'Partager mon résultat'}
    </button>
  )
}

// Le mot que l'hôte a écrit pour la révélation (dégustation à plusieurs)
export function HostNote({ record }) {
  const note = record.session?.hostNote
  if (!note) return null
  return (
    <Card title={record.session.role === 'host' ? 'Ton mot pour la révélation' : `Le mot de ton hôte, ${record.session.hostName}`}>
      <p className="quote">{note}</p>
    </Card>
  )
}

// Fiche pédagogique : le profil typique du cépage et de la région, rapproché de ce qui a été perçu
export function Lesson({ record }) {
  const navigate = useNavigate()
  const lesson = buildLesson(record) ?? { grapes: [], region: null, lines: [] }
  const aiProfile = record.session?.aiProfile
  const profile = buildProfile(record)
  // Le graphique montre déjà les points d'accord : en texte, on ne garde que l'explication des écarts
  const lines = profile ? lesson.lines.filter(line => line.kind === 'gap') : lesson.lines
  if (!aiProfile && !lesson.grapes.length && !lesson.region) return null
  return (
    <Card title="Pour comprendre">
      {profile && <ProfileChart profile={profile} />}
      {aiProfile && (
        <p className="lesson-text"><strong>Ce qu'on attend de ce vin.</strong> {aiProfile} <span className="ai-tag">rédigé par l'assistant IA</span></p>
      )}
      {lesson.grapes.map(g => (
        <p key={g.name} className="lesson-text">
          <button type="button" className="text-link strong" onClick={() => navigate(grapePath(g.name))}>{g.name}</button>. {g.about}
        </p>
      ))}
      {lesson.region && (
        <p className="lesson-text"><strong>{lesson.region.name}.</strong> {lesson.region.about}</p>
      )}
      {lines.map((line, i) => (
        <p key={i} className="insight">
          {line.kind === 'match' ? <Check size={16} /> : <GraduationCap size={16} />}
          <span>{line.text}</span>
        </p>
      ))}
      <p className="muted left">Repères généraux : chaque vin a le droit de s'en écarter.</p>
    </Card>
  )
}

// D'où vient le vin, et où le dégustateur le situait — seulement pour une région présente sur la carte
export function OriginMap({ record }) {
  const onMap = (name) => MAP_REGIONS.some(r => normalize(r.name) === normalize(name ?? ''))
  const real = record.reality?.region
  if (!onMap(real)) return null
  const guess = record.mode === 'blind' ? (record.hypotheses?.region || null) : null
  const right = guess && normalize(guess) === normalize(real)
  return (
    <Card title="D'où il vient">
      <FranceMap real={real} guess={right ? null : guess} />
      <div className="legend">
        <span><span className="legend-mark real" /> La bouteille : {real}</span>
        {guess && !right && <span><span className="legend-mark guess" /> Ton hypothèse : {guess}</span>}
        {right && <span>Tu l'avais située au bon endroit.</span>}
      </div>
    </Card>
  )
}

// La bouteille sur la carte des saveurs, et l'endroit où la perception du dégustateur le plaçait
export function FlavorCard({ record }) {
  const navigate = useNavigate()
  const grape = mainGrapeOf(record)
  if (!grape) return null
  const you = record.mode === 'blind' && record.wineType === grape.color ? flavorPoint(perceivedOf(record), grape.color) : null
  return (
    <Card title="Sur la carte des saveurs">
      <FlavorMap color={grape.color} real={grape.name} you={you} onPick={name => navigate(grapePath(name))} />
      <div className="legend">
        <span><span className="legend-mark real" /> Typique du cépage {grape.name}</span>
        {you && <span><span className="legend-mark you-map" /> Ce que tu as perçu</span>}
      </div>
      <p className="muted left">Deux cépages proches sur la carte se ressemblent en bouche. Touche un cépage pour ouvrir sa fiche.</p>
    </Card>
  )
}

export function ComparisonTable({ record }) {
  const known = hasReality(record.reality)
  const matches = record.comparison?.matches || {}
  const rows = COMPARISON_FIELDS
    .map(f => ({ ...f, hypoValue: f.hypo(record) || null, realValue: known ? (f.real(record) || null) : null }))
    .filter(f => f.hypoValue || f.realValue)

  if (!rows.length) return null

  return (
    <section className="card">
      {known && (
        <div className="comp-head"><span>Mes hypothèses</span><span /><span>La réalité</span></div>
      )}
      {rows.map(row => {
        const badge = row.hypoValue ? matchBadge(matches[row.key]) : null
        return (
          <div key={row.key} className="comp-row">
            <div className="comp-label">{row.label}</div>
            <div className={`comp-body ${known ? '' : 'single'}`}>
              <span className={row.hypoValue ? '' : 'comp-missing'}>{row.hypoValue || '—'}</span>
              {known && <span>{badge && <span className={`badge ${badge.color}`}>{badge.label}</span>}</span>}
              {known && <span className={`comp-real ${row.realValue ? '' : 'comp-missing'}`}>{row.realValue || '—'}</span>}
            </div>
          </div>
        )
      })}
    </section>
  )
}

export function Insights({ record }) {
  const insights = record.comparison?.insights || []
  const h = record.hypotheses || {}
  const observations = []
  if (h.climate) observations.push(`Climat perçu : ${labelOf(CLIMATE_OPTIONS, h.climate)}`)
  if (h.soil && h.soil !== 'nsp') observations.push(`Sol perçu : ${labelOf(SOIL_OPTIONS, h.soil)}`)
  if (!insights.length && !observations.length) return null
  return (
    <Card title="À retenir">
      {insights.map((text, i) => (
        <p key={i} className="insight"><Lightbulb size={16} /><span>{text}</span></p>
      ))}
      {observations.map((text, i) => (
        <p key={`o${i}`} className="insight"><span>• {text}</span></p>
      ))}
    </Card>
  )
}

export default function Comparison() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data: record } = useAsync(() => db.getRecord(id), [id])
  const location = useLocation()
  const photos = usePhotoUrls(id)
  // La mise en scène ne joue qu'à la sortie de la Révélation, pas quand on rouvre la comparaison
  const [revealing, setRevealing] = useState(!!location.state?.reveal)

  if (record === undefined) return <Loading />
  if (!record) {
    return (
      <Screen>
        <Header title="Comparaison" onBack={() => navigate('/journal', { replace: true })} />
        <div className="empty"><p className="empty-title">Fiche introuvable</p></div>
      </Screen>
    )
  }

  const known = hasReality(record.reality)
  const summary = summarize(record.comparison?.matches)

  if (revealing && known) {
    const done = () => { setRevealing(false); navigate(location.pathname, { replace: true }) }
    return <RevealSequence record={record} fields={COMPARISON_FIELDS} photo={photos[0] ?? null} onDone={done} />
  }

  return (
    <Screen>
      <Header title="Comparaison" label={record.session ? `Hôte : ${record.session.hostName}` : known ? 'Tes hypothèses vs la réalité' : 'Bouteille inconnue'} />
      <Body>
        <section className="card summary">
          <p className="summary-main">
            {summary || (known ? 'Rien à comparer' : 'Comparaison impossible')}
          </p>
          <p className="summary-sub">
            {known
              ? (summary ? `Confiance annoncée : ${record.hypotheses.confidence}/5${helpUsed(record) ? ` · ${helpUsed(record)}` : ''}` : 'Aucune de tes hypothèses ne porte sur un champ renseigné.')
              : 'Complète la fiche plus tard pour comparer tes hypothèses.'}
          </p>
        </section>
        <HostNote record={record} />
        <ComparisonTable record={record} />
        <OriginMap record={record} />
        <FlavorCard record={record} />
        <Lesson record={record} />
        <Insights record={record} />
      </Body>
      <Footer className="column">
        {known && summary && <ShareResultButton record={record} />}
        <button className="btn btn-primary block" onClick={() => navigate(`/entry/${id}`, { replace: true })}>
          <FileText size={18} /> Voir la fiche complète
        </button>
        <button className="link-btn" onClick={() => navigate('/', { replace: true })}>Retour à l'accueil</button>
      </Footer>
    </Screen>
  )
}
