// Comparaison — hypothèses vs réalité, côte à côte
import { useNavigate, useParams } from 'react-router-dom'
import { FileText, Lightbulb } from 'lucide-react'
import { Screen, Header, Body, Footer, Card, Loading, useAsync } from '../components/Layout'
import * as db from '../db/db'
import { matchBadge } from '../utils/comparison'
import { WINE_TYPES, CLIMATE_OPTIONS, SOIL_OPTIONS } from '../data/wineData'
import { labelOf, hasReality } from '../utils/text'

// Champs comparés, dans l'ordre d'affichage
export const COMPARISON_FIELDS = [
  { key: 'type',        label: 'Type',        hypo: r => labelOf(WINE_TYPES, r.wineType), real: r => labelOf(WINE_TYPES, r.reality.type) },
  { key: 'grapes',      label: 'Cépage(s)',   hypo: r => r.hypotheses.grapes?.join(', '),  real: r => r.reality.grapes?.join(', ') },
  { key: 'country',     label: 'Pays',        hypo: r => r.hypotheses.country,             real: r => r.reality.country },
  { key: 'region',      label: 'Région',      hypo: r => r.hypotheses.region,              real: r => r.reality.region },
  { key: 'appellation', label: 'Appellation', hypo: r => r.hypotheses.appellation,         real: r => r.reality.appellation },
  { key: 'vintage',     label: 'Millésime',   hypo: r => r.hypotheses.vintage,             real: r => r.reality.vintage },
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
      <Header title="Comparaison" label={known ? 'Tes hypothèses vs la réalité' : 'Bouteille inconnue'} />
      <Body>
        <section className="card summary">
          <p className="summary-main">
            {summary || (known ? 'Rien à comparer' : 'Comparaison impossible')}
          </p>
          <p className="summary-sub">
            {known
              ? (summary ? `Confiance annoncée : ${record.hypotheses.confidence}/5` : 'Aucune de tes hypothèses ne porte sur un champ renseigné.')
              : 'Complète la fiche plus tard pour comparer tes hypothèses.'}
          </p>
        </section>
        <ComparisonTable record={record} />
        <Insights record={record} />
      </Body>
      <Footer className="column">
        <button className="btn btn-primary block" onClick={() => navigate(`/entry/${id}`, { replace: true })}>
          <FileText size={18} /> Voir la fiche complète
        </button>
        <button className="link-btn" onClick={() => navigate('/', { replace: true })}>Retour à l'accueil</button>
      </Footer>
    </Screen>
  )
}
