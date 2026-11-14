// Dégustation à plusieurs — choix du rôle : faire deviner une bouteille (hôte) ou rejoindre (invité)
import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { Screen, Header, Body } from '../components/Layout'

export default function Group() {
  const navigate = useNavigate()
  return (
    <Screen>
      <Header title="Dégustation à plusieurs" onBack={() => navigate('/', { replace: true })} />
      <Body className="centered">
        <div className="hero">
          <Users size={32} className="hero-icon" />
          <h1 className="hero-title">Qui a la bouteille ?</h1>
        </div>
        <div className="level-list">
          <button type="button" className="level-card" onClick={() => navigate('/host/new')}>
            <span className="level-label">Faire deviner une bouteille</span>
            <span className="level-desc">C'est toi qui l'apportes : tu la renseignes, puis tu invites les autres avec un QR code.</span>
          </button>
          <button type="button" className="level-card" onClick={() => navigate('/join')}>
            <span className="level-label">Rejoindre une dégustation</span>
            <span className="level-desc">Quelqu'un d'autre l'apporte : scanne son QR code d'ici, ta fiche ira dans ton journal.</span>
          </button>
        </div>
      </Body>
    </Screen>
  )
}
