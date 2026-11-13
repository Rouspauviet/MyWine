// Paramètres — sauvegarde, restauration, effacement
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Upload, Trash2, ShieldCheck } from 'lucide-react'
import { Screen, Header, Body, Card, InfoRow, ConfirmModal, useAsync } from '../components/Layout'
import * as db from '../db/db'
import { exportAll, importFile, lastExportDate } from '../utils/backup'
import { formatDate } from '../utils/text'

function isInstalled() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
}

export default function Settings() {
  const navigate = useNavigate()
  const { data, reload } = useAsync(async () => {
    const { records, photos } = await db.getEverything()
    return { records: records.filter(r => r.status === 'done').length, photos: photos.length }
  }, [])
  const [message, setMessage] = useState(null) // { kind: 'success' | 'error', text }
  const [confirmClear, setConfirmClear] = useState(false)
  const [persisted, setPersisted] = useState(null)
  const [lastExport, setLastExport] = useState(lastExportDate())

  // Demande au navigateur de ne pas purger les données de l'app
  useEffect(() => {
    if (!navigator.storage?.persist) return
    navigator.storage.persisted()
      .then(already => already || navigator.storage.persist())
      .then(setPersisted)
      .catch(() => {})
  }, [])

  const handleExport = async () => {
    try {
      if (await exportAll()) {
        setLastExport(lastExportDate())
        setMessage({ kind: 'success', text: 'Sauvegarde créée. Range ce fichier en lieu sûr (Fichiers, iCloud, e-mail…).' })
      }
    } catch (err) {
      setMessage({ kind: 'error', text: `Export impossible : ${err.message}` })
    }
  }

  const handleImport = async (file) => {
    if (!file) return
    try {
      const result = await importFile(file)
      setMessage({ kind: 'success', text: `${result.records} fiche(s) et ${result.photos} photo(s) importées.` })
      reload()
    } catch (err) {
      setMessage({ kind: 'error', text: err.message })
    }
  }

  const handleClear = async () => {
    await db.clearEverything()
    setConfirmClear(false)
    setMessage({ kind: 'success', text: 'Toutes les données ont été effacées.' })
    reload()
  }

  return (
    <Screen>
      <Header title="Paramètres" onBack={() => navigate('/', { replace: true })} />
      <Body>
        {message && <p className={`banner ${message.kind}`}>{message.text}</p>}

        <Card title="Journal" tight>
          <InfoRow label="Vins enregistrés" value={String(data?.records ?? '…')} />
          <InfoRow label="Photos" value={String(data?.photos ?? '…')} />
          <InfoRow label="Dernière sauvegarde" value={lastExport ? formatDate(lastExport, true) : 'Jamais'} />
        </Card>

        <Card title="Sauvegarde" tight>
          <button className="action-row" onClick={handleExport}>
            <Download size={20} />
            <span className="action-text">
              <span className="action-label">Exporter mon journal</span>
              <span className="action-sub">Un seul fichier avec toutes les fiches et les photos</span>
            </span>
          </button>
          <label className="action-row">
            <Upload size={20} />
            <span className="action-text">
              <span className="action-label">Importer une sauvegarde</span>
              <span className="action-sub">Fusionne le fichier avec le journal actuel</span>
            </span>
            <input type="file" accept="application/json,.json" onChange={e => { handleImport(e.target.files[0]); e.target.value = '' }} />
          </label>
        </Card>

        <Card title="Stockage" tight>
          <div className="action-row static">
            <ShieldCheck size={20} />
            <span className="action-text">
              <span className="action-label">Tes données restent sur cet appareil</span>
              <span className="action-sub">
                {isInstalled()
                  ? 'App installée sur l\'écran d\'accueil : le stockage est conservé.'
                  : 'Sur iPhone, ajoute l\'app à l\'écran d\'accueil (Partager → Sur l\'écran d\'accueil), sinon Safari peut effacer les données après quelques semaines sans visite.'}
                {persisted === true && ' Stockage persistant accordé par le navigateur.'}
              </span>
            </span>
          </div>
        </Card>

        <Card title="Zone dangereuse" tight>
          <button className="action-row danger" onClick={() => setConfirmClear(true)}>
            <Trash2 size={20} />
            <span className="action-text">
              <span className="action-label">Effacer toutes les données</span>
              <span className="action-sub">Irréversible — exporte d'abord si nécessaire</span>
            </span>
          </button>
        </Card>

        <p className="muted">MyWine v{__APP_VERSION__} · aucune donnée n'est envoyée sur Internet</p>
      </Body>

      <ConfirmModal
        open={confirmClear}
        title="Tout effacer ?"
        text="Toutes les fiches, photos et dégustations en cours seront supprimées définitivement de cet appareil."
        confirmLabel="Tout effacer"
        danger
        onConfirm={handleClear}
        onCancel={() => setConfirmClear(false)}
      />
    </Screen>
  )
}
