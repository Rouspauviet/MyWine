// Journal — toutes les fiches (Aveugle + Mémoire), recherche et filtres
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X, Heart, Wine, ChartNoAxesColumn } from 'lucide-react'
import { Screen, Header, Body, useAsync } from '../components/Layout'
import { ChipGroup } from '../components/Inputs'
import * as db from '../db/db'
import { normalize, formatDate, formatPrice, recordTitle, recordSubtitle } from '../utils/text'

const FILTERS = [
  { value: 'blind', label: 'À l\'aveugle' },
  { value: 'memory', label: 'Mémoire' },
  { value: 'favorite', label: 'Coups de cœur' },
]

function matchesSearch(record, query) {
  const q = normalize(query)
  if (!q) return true
  const r = record.reality || {}
  const haystack = [
    r.cuvee, r.producer, r.vignerons, r.appellation, r.region, r.country, r.vintage,
    r.purchasePlace, ...(r.grapes || []), record.style?.context, record.style?.overallImpression,
  ]
  return haystack.some(v => v && normalize(v).includes(q))
}

function matchesFilter(record, filter) {
  if (filter === 'blind') return record.mode === 'blind'
  if (filter === 'memory') return record.mode === 'memory'
  if (filter === 'favorite') return !!record.style?.favorite
  return true
}

export default function Journal() {
  const navigate = useNavigate()
  const { data: records } = useAsync(() => db.listRecords(), [])
  // `?q=` : recherche demandée depuis "Mon palais" (bouteilles d'une région)
  const [params] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') ?? '')
  const [filter, setFilter] = useState(null)

  const filtered = (records ?? []).filter(r => matchesSearch(r, search) && matchesFilter(r, filter))

  return (
    <Screen>
      <Header title="Journal" label={records ? `${records.length} ${records.length > 1 ? 'vins' : 'vin'}` : undefined} onBack={() => navigate('/', { replace: true })}
        actions={records?.length > 0 && (
          <button className="icon-btn" onClick={() => navigate('/palate')} aria-label="Mon palais"><ChartNoAxesColumn size={20} /></button>
        )}
      />

      {records?.length > 0 && (
        <div className="toolbar">
          <div className="search-bar">
            <Search size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…" aria-label="Rechercher" />
            {search && (
              <button className="hint-btn" onClick={() => setSearch('')} aria-label="Effacer la recherche"><X size={16} /></button>
            )}
          </div>
          <ChipGroup options={FILTERS} value={filter} onChange={setFilter} scroll />
        </div>
      )}

      {records === undefined ? (
        <div className="loading">Chargement…</div>
      ) : records.length === 0 ? (
        <div className="empty">
          <p className="empty-title">Aucun vin pour l'instant</p>
          <p className="empty-text">Lance ta première dégustation ou mémorise un vin depuis l'accueil.</p>
          <button className="btn btn-primary" onClick={() => navigate('/', { replace: true })}>Retour à l'accueil</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <p className="empty-title">Aucun résultat</p>
          <p className="empty-text">Aucune fiche ne correspond à ta recherche.</p>
        </div>
      ) : (
        <Body>
          <div className="list">
            {filtered.map(record => {
              const rating = record.style?.rating
              const price = formatPrice(record.reality?.price)
              return (
                <button key={record.id} className="record-card" onClick={() => navigate(`/entry/${record.id}`)}>
                  <span className="record-thumb">
                    {record.thumb ? <img src={record.thumb} alt="" /> : <Wine size={24} />}
                  </span>
                  <span className="record-main">
                    <span className="record-top">
                      {record.reality?.type && <span className={`dot ${record.reality.type}`} />}
                      <span className="record-title">{recordTitle(record)}</span>
                      {record.style?.favorite && <Heart size={14} className="fav" fill="currentColor" />}
                    </span>
                    <span className="record-sub">{recordSubtitle(record)}</span>
                    <span className="record-meta">
                      <span>{formatDate(record.tastedAt || record.createdAt)}</span>
                      {price && <span>· {price}</span>}
                      <span className="spacer" />
                      {record.mode === 'blind' && <span className="badge blind">À l'aveugle</span>}
                      {rating ? <span className="rating-text">{'★'.repeat(rating)}</span> : null}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </Body>
      )}
    </Screen>
  )
}
