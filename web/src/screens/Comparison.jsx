// Comparaison — hypothèses vs réalité, côte à côte
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { FileText, Lightbulb, Share2, Check, GraduationCap } from 'lucide-react'
import { buildLesson } from '../utils/pedagogy'
import { Screen, Header, Body, Footer, Card, Loading, useAsync } from '../components/Layout'
import * as db from '../db/db'
import { matchBadge } from '../utils/comparison'
import { WINE_TYPES, CLIMATE_OPTIONS, SOIL_OPTIONS } from '../data/wineData'
import { labelOf, hasReality, recordTitle } from '../utils/text'
import { LEVELS } from '../data/levels'

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
  const clues = record.cluesUsed ? `${record.cluesUsed} indice${record.cluesUsed > 1 ? 's' : ''}` : null
  return [
    `Ma dégustation à l'aveugle — ${recordTitle(record)}`,
    [summarize(matches), level && `niveau ${level}`, clues].filter(Boolean).join(' · '),
    ...lines,
  ].filter(Boolean).join('\n')
}

export function ShareResultButton({ record }) {
  const [copied, setCopied] = useState(false)
  const share = async () => {
    const text = shareText(record)
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
  const lesson = buildLesson(record) ?? { grapes: [], region: null, lines: [] }
  const aiProfile = record.session?.aiProfile
  if (!aiProfile && !lesson.grapes.length && !lesson.region) return null
  return (
    <Card title="Pour comprendre">
      {aiProfile && (
        <p className="lesson-text"><strong>Ce qu'on attend de ce vin.</strong> {aiProfile} <span className="ai-tag">rédigé par l'assistant IA</span></p>
      )}
      {lesson.grapes.map(g => (
        <p key={g.name} className="lesson-text"><strong>{g.name}.</strong> {g.about}</p>
      ))}
      {lesson.region && (
        <p className="lesson-text"><strong>{lesson.region.name}.</strong> {lesson.region.about}</p>
      )}
      {lesson.lines.map((line, i) => (
        <p key={i} className="insight">
          {line.kind === 'match' ? <Check size={16} /> : <GraduationCap size={16} />}
          <span>{line.text}</span>
        </p>
      ))}
      <p className="muted left">Repères généraux : chaque vin a le droit de s'en écarter.</p>
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
              ? (summary ? `Confiance annoncée : ${record.hypotheses.confidence}/5${record.cluesUsed ? ` · ${record.cluesUsed} indice${record.cluesUsed > 1 ? 's' : ''}` : ''}` : 'Aucune de tes hypothèses ne porte sur un champ renseigné.')
              : 'Complète la fiche plus tard pour comparer tes hypothèses.'}
          </p>
        </section>
        <HostNote record={record} />
        <ComparisonTable record={record} />
        <Lesson record={record} />
        <Insights record={record} />
      </Body>
      <Footer className="column">
        {record.session && known && <ShareResultButton record={record} />}
        <button className="btn btn-primary block" onClick={() => navigate(`/entry/${id}`, { replace: true })}>
          <FileText size={18} /> Voir la fiche complète
        </button>
        <button className="link-btn" onClick={() => navigate('/', { replace: true })}>Retour à l'accueil</button>
      </Footer>
    </Screen>
  )
}
