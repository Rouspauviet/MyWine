// Paramètres — sauvegarde, restauration, effacement
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { Download, Upload, Trash2, ShieldCheck, Sparkles, Share2, Users } from 'lucide-react'
import { ChipGroup } from '../components/Inputs'
import { AI_MODELS, getApiKey, setApiKey, getAiModel, setAiModel, isKeyBorrowed } from '../utils/ai'
import { createAssistantShare, assistantShareLink, shareTokenFromLink } from '../utils/aiShare'
import { isSessionSupported } from '../utils/session'
import { Screen, Header, Body, Card, InfoRow, ConfirmModal, useAsync } from '../components/Layout'
import * as db from '../db/db'
import { exportAll, importFile, lastExportDate } from '../utils/backup'
import { formatDate } from '../utils/text'

function isInstalled() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
}

const QR_SIZE = 720 // pixels du QR généré ; l'affichage est mis à l'échelle en CSS

// Partage de l'assistant avec un ami : un lien (ou QR code) chiffré + un code à donner de vive voix
function AssistantShare({ apiKey, model }) {
  const [share, setShare] = useState(null) // { code, link, qr }
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const open = async () => {
    setBusy(true)
    try {
      const { code, token } = await createAssistantShare(apiKey, model)
      const link = assistantShareLink(token)
      const qr = await QRCode.toDataURL(link, { errorCorrectionLevel: 'L', margin: 1, width: QR_SIZE }).catch(() => null)
      setShare({ code, link, qr })
      setCopied(false)
    } finally {
      setBusy(false)
    }
  }

  // Le code ne part jamais avec le lien : il se donne de vive voix
  const send = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Assistant MyWine', text: 'Je te prête mon assistant MyWine. Je te donne le code de vive voix.', url: share.link })
      } else {
        await navigator.clipboard.writeText(share.link)
        setCopied(true)
      }
    } catch { /* partage annulé */ }
  }

  if (!share) {
    return (
      <button className="btn btn-secondary block" disabled={busy} onClick={open}>
        <Users size={18} /> {busy ? 'Préparation…' : 'Partager mon assistant avec un ami'}
      </button>
    )
  }

  return (
    <>
      <p className="banner error">
        Ton ami utilisera ta clé : ce qu'il consomme est facturé sur ton compte, et tu ne pourras lui retirer l'accès qu'en révoquant la clé chez Anthropic. Ne partage qu'avec des personnes de confiance.
      </p>
      <p className="step-text">1 · Il scanne ce QR code, ou ouvre le lien que tu lui envoies.</p>
      {share.qr && <img className="qr" src={share.qr} alt="QR code de partage de l'assistant" />}
      <button className="btn btn-secondary block" onClick={send}>
        <Share2 size={18} /> {copied ? 'Lien copié' : 'Envoyer le lien'}
      </button>
      <p className="step-text">2 · Donne-lui ce code de vive voix, pas dans le même message que le lien.</p>
      <p className="reveal-code long" aria-label="Code de partage">{share.code.match(/.{1,4}/g).join(" ")}</p>
      <p className="muted left">
        Conseil : crée une clé réservée à MyWine dans un espace de travail de la console Anthropic, avec un plafond de dépense mensuel.
      </p>
      <button className="btn btn-ghost block" onClick={() => setShare(null)}>Fermer le partage</button>
    </>
  )
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
  const [savedKey, setSavedKey] = useState(getApiKey())
  const [keyDraft, setKeyDraft] = useState('')
  const [aiModel, setModel] = useState(getAiModel())

  const [borrowed, setBorrowed] = useState(isKeyBorrowed())
  // Le champ accepte aussi le lien de partage d'un ami (utile dans l'app installée, qui n'ouvre pas les liens)
  const shareToken = shareTokenFromLink(keyDraft)

  const saveKey = () => {
    if (shareToken) return navigate(`/assistant/${shareToken}`)
    setApiKey(keyDraft)
    setSavedKey(getApiKey())
    setBorrowed(false)
    setKeyDraft('')
  }
  const removeKey = () => { setApiKey(''); setSavedKey(''); setBorrowed(false) }
  const chooseModel = (model) => { if (!model) return; setAiModel(model); setModel(model) }

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

        <Card title="Assistant IA (optionnel)">
          <p className="step-text">
            Avec une clé d'API Claude, l'app peut remplir la fiche depuis une photo d'étiquette et rédiger ce qu'on attend d'un vin pour tes invités. Sans clé, tout le reste fonctionne.
          </p>
          {savedKey ? (
            <>
              <p className="banner success">
                <Sparkles size={14} /> {borrowed
                  ? 'Assistant prêté par un ami : son usage est facturé sur son compte.'
                  : `Clé enregistrée sur cet appareil (se termine par …${savedKey.slice(-4)}).`}
              </p>
              <ChipGroup options={AI_MODELS} value={aiModel} onChange={chooseModel} />
              <p className="muted left">{AI_MODELS.find(m => m.value === aiModel)?.description}</p>
              {!borrowed && isSessionSupported() && <AssistantShare apiKey={savedKey} model={aiModel} />}
              <button className="btn btn-ghost block" onClick={removeKey}>Retirer la clé de cet appareil</button>
            </>
          ) : (
            <>
              <input
                className="input"
                type="password"
                value={keyDraft}
                onChange={e => setKeyDraft(e.target.value)}
                placeholder="sk-ant-… ou lien d'un ami"
                aria-label="Clé d'API Claude ou lien de partage"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <button className="btn btn-secondary block" disabled={!keyDraft.trim()} onClick={saveKey}>
                {shareToken ? 'Ouvrir le lien de partage' : 'Enregistrer la clé'}
              </button>
              <p className="muted left">Un ami t'a prêté son assistant ? Ouvre son lien, ou colle-le ici.</p>
            </>
          )}
          <p className="muted left">
            La clé reste dans ce navigateur : elle n'est ni dans le code de l'app, ni dans la sauvegarde exportée, et n'est envoyée qu'à Anthropic. Quand tu utilises l'assistant, la photo ou la fiche concernée est envoyée à Anthropic, et l'usage est facturé sur ton compte.
          </p>
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

        <p className="muted">MyWine v{__APP_VERSION__} · aucune donnée n'est envoyée sur Internet{savedKey ? ', sauf à l\'assistant IA quand tu l\'utilises' : ''}</p>
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
