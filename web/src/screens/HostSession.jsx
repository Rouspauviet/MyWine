// Dégustation à plusieurs — côté hôte : QR code d'invitation à montrer, puis code de révélation à annoncer
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { Share2, Eye, EyeOff, FileText } from 'lucide-react'
import { Screen, Header, Body, Footer, Card, Loading, useAsync } from '../components/Layout'
import * as db from '../db/db'
import { invitationLink } from '../utils/session'
import { recordTitle } from '../utils/text'

const QR_SIZE = 720 // pixels du QR généré ; l'affichage est mis à l'échelle en CSS

export default function HostSession() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data: record } = useAsync(() => db.getRecord(id), [id])
  const [qr, setQr] = useState(null)
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)

  const session = record?.session?.role === 'host' ? record.session : null
  const link = session ? invitationLink(session.token) : null

  useEffect(() => {
    if (!link) return
    QRCode.toDataURL(link, { errorCorrectionLevel: 'L', margin: 1, width: QR_SIZE }).then(setQr).catch(() => setQr(null))
  }, [link])

  if (record === undefined) return <Loading />
  if (!session) {
    return (
      <Screen>
        <Header title="Dégustation introuvable" onBack={() => navigate('/', { replace: true })} />
      </Screen>
    )
  }

  const share = async () => {
    const text = `${session.hostName} t'invite à une dégustation à l'aveugle sur MyWine.`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Dégustation à l\'aveugle', text, url: link })
      } else {
        await navigator.clipboard.writeText(link)
        setCopied(true)
      }
    } catch { /* partage annulé */ }
  }

  return (
    <Screen>
      <Header title={recordTitle(record)} label="Dégustation à plusieurs" onBack={() => navigate('/', { replace: true })} />
      <Body>
        <Card title="1 · Invite tes convives">
          <p className="step-text">Chacun scanne ce QR code avec l'appareil photo de son téléphone, ou ouvre le lien que tu partages.</p>
          {qr ? <img className="qr" src={qr} alt="QR code d'invitation" /> : <p className="muted">Génération du QR code…</p>}
          <p className="muted">Si le QR code a du mal à passer, monte la luminosité ou partage le lien.</p>
          <button className="btn btn-secondary block" onClick={share}>
            <Share2 size={18} /> {copied ? 'Lien copié' : 'Partager le lien'}
          </button>
        </Card>

        <Card title="2 · Laisse-les déguster">
          <p className="step-text">Sers le vin sans montrer la bouteille. Chacun choisit son niveau et remplit sa dégustation sur son téléphone.</p>
        </Card>

        <Card title="3 · Révèle la bouteille">
          <p className="step-text">Quand tout le monde a terminé, annonce ce code. Chacun le saisit pour découvrir la bouteille et sa comparaison.</p>
          {showCode && <p className="reveal-code" aria-label="Code de révélation">{session.code}</p>}
          <button className="btn btn-primary block" onClick={() => setShowCode(v => !v)}>
            {showCode ? <><EyeOff size={18} /> Masquer le code</> : <><Eye size={18} /> Afficher le code de révélation</>}
          </button>
        </Card>
      </Body>
      <Footer>
        <button className="btn btn-ghost grow" onClick={() => navigate(`/entry/${id}`)}>
          <FileText size={18} /> Voir la fiche de la bouteille
        </button>
      </Footer>
    </Screen>
  )
}
