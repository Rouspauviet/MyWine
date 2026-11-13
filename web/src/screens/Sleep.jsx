// Écran "En sommeil" — rituel de transition avant la dégustation à l'aveugle
// Le brouillon n'est créé qu'au clic sur "Commencer" (pas de brouillon orphelin).
import { useNavigate } from 'react-router-dom'
import { EyeOff, Play } from 'lucide-react'
import { Screen, Body, Footer } from '../components/Layout'
import * as db from '../db/db'

export default function Sleep() {
  const navigate = useNavigate()

  const start = async () => {
    const record = await db.saveRecord(db.newRecord('blind'))
    navigate(`/tasting/${record.id}`, { replace: true })
  }

  return (
    <Screen>
      <Body className="centered">
        <div className="hero">
          <EyeOff size={32} className="hero-icon" />
          <h1 className="hero-title">Avant de découvrir ce vin…</h1>
          <p className="hero-text">
            {'L\'étiquette est mise de côté.\nPrends quelques minutes pour explorer ce vin par tes propres sens et faire tes hypothèses.'}
          </p>
          <p className="hero-note">○ Tu révèleras les vraies infos à la fin</p>
        </div>
      </Body>
      <Footer className="column bare">
        <button className="btn btn-primary btn-large block" onClick={start}>
          <Play size={22} /> Commencer la dégustation
        </button>
        <button className="link-btn" onClick={() => navigate('/memory/new', { replace: true })}>
          Tu connais déjà ce vin ? → Mémorise-le
        </button>
        <button className="link-btn" onClick={() => navigate('/', { replace: true })}>Retour</button>
      </Footer>
    </Screen>
  )
}
