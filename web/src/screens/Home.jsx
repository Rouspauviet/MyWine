// Accueil — deux intentions (Aveugle / Mémoire) + journal
import { useNavigate } from 'react-router-dom'
import { Eye, Bookmark, BookOpen, Settings, Play, Users } from 'lucide-react'
import { Screen, Body, Footer, useAsync } from '../components/Layout'
import * as db from '../db/db'
import { WINE_TYPES } from '../data/wineData'
import { labelOf, formatDate } from '../utils/text'
import { daysSinceExport } from '../utils/backup'

const BACKUP_REMINDER_DAYS = 30
const BACKUP_REMINDER_MIN_RECORDS = 5

export default function Home() {
  const navigate = useNavigate()
  const { data } = useAsync(async () => ({
    records: await db.listRecords(),
    drafts: await db.listDrafts(),
  }), [])

  const count = data?.records.length ?? 0
  const draft = data?.drafts[0] ?? null
  const days = daysSinceExport()
  const needsBackup = count >= BACKUP_REMINDER_MIN_RECORDS && (days === null || days > BACKUP_REMINDER_DAYS)

  return (
    <Screen>
      <div className="home-top">
        <button className="icon-btn" onClick={() => navigate('/settings')} aria-label="Paramètres">
          <Settings size={22} />
        </button>
      </div>

      <Body className="centered">
        <div className="hero">
          <h1 className="hero-app">MyWine</h1>
          <p className="hero-text">Goûte, mémorise, progresse.</p>
          {count > 0 && (
            <p className="hero-note">{count} {count === 1 ? 'vin' : 'vins'} au journal</p>
          )}
        </div>

        {draft && (
          <div className="card">
            <button className="resume-card" onClick={() => navigate(`/tasting/${draft.id}`)}>
              <Play size={20} />
              <span className="resume-text">
                <span className="resume-title">Reprendre la dégustation en cours</span>
                <span className="resume-sub">
                  {draft.session ? `Chez ${draft.session.hostName} · ` : ''}{labelOf(WINE_TYPES, draft.wineType) ?? 'Type à choisir'} · étape {Math.max(draft.step, 1)}/4 · {formatDate(draft.updatedAt)}
                </span>
              </span>
            </button>
          </div>
        )}

        {needsBackup && (
          <button className="banner warn" onClick={() => navigate('/settings')}>
            {days === null
              ? 'Ton journal n\'a jamais été sauvegardé. Exporte-le depuis les paramètres.'
              : `Dernière sauvegarde il y a ${days} jours. Pense à exporter ton journal.`}
          </button>
        )}
      </Body>

      <Footer className="column bare">
        <button className="btn btn-primary btn-large block" onClick={() => navigate('/sleep')}>
          <Eye size={22} /> Dégustation à l'aveugle
        </button>
        <button className="btn btn-secondary block" onClick={() => navigate('/host/new')}>
          <Users size={20} /> Dégustation à plusieurs
        </button>
        <button className="btn btn-secondary block" onClick={() => navigate('/memory/new')}>
          <Bookmark size={20} /> Mémoriser un vin
        </button>
        <div className="link-row">
          <button className="link-btn" onClick={() => navigate('/journal')}>
            <BookOpen size={14} /> Mon journal
          </button>
          <button className="link-btn" onClick={() => navigate('/settings')}>
            <Settings size={14} /> Paramètres
          </button>
        </div>
        <p className="muted">v{__APP_VERSION__}</p>
      </Footer>
    </Screen>
  )
}
