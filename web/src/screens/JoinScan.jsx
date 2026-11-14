// Rejoindre une dégustation depuis l'app — scanner le QR code de l'hôte ou coller son lien.
// Un QR code scanné avec l'appareil photo du téléphone ouvre le navigateur, dont le journal est séparé
// de celui de l'app installée : passer par ici range la fiche dans le bon journal.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Screen, Header, Body, Footer } from '../components/Layout'
import { Field } from '../components/Inputs'
import QrScanner from '../components/QrScanner'
import { joinTokenFromLink } from '../utils/session'
import { shareTokenFromLink } from '../utils/aiShare'

// Où mène un lien MyWine (invitation de dégustation ou assistant prêté) — null si ce n'en est pas un
function routeOf(text) {
  const join = joinTokenFromLink(text)
  if (join) return `/join/${join}`
  const share = shareTokenFromLink(text)
  return share ? `/assistant/${share}` : null
}

export default function JoinScan() {
  const navigate = useNavigate()
  const [link, setLink] = useState('')
  const [unknown, setUnknown] = useState(false)
  const pasted = routeOf(link)

  const onRead = (text) => {
    const route = routeOf(text)
    if (!route) { setUnknown(true); return false }
    navigate(route, { replace: true })
    return true
  }

  return (
    <Screen>
      <Header title="Rejoindre une dégustation" label="Dégustation à plusieurs" onBack={() => navigate(-1)} />
      <Body>
        <p className="step-subtitle">Vise le QR code affiché sur le téléphone de l'hôte.</p>
        <QrScanner onRead={onRead} />
        {unknown && <p className="banner">Ce QR code n'est pas une invitation MyWine.</p>}
        <Field label="Ou colle le lien reçu">
          <input
            className="input"
            value={link}
            onChange={e => setLink(e.target.value)}
            placeholder="https://…"
            aria-label="Lien de l'invitation"
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            inputMode="url"
          />
        </Field>
        {link.trim() && !pasted && <p className="banner">Ce lien n'est pas une invitation MyWine.</p>}
      </Body>
      <Footer>
        <button className="btn btn-primary grow" disabled={!pasted} onClick={() => navigate(pasted, { replace: true })}>
          Ouvrir l'invitation <ArrowRight size={18} />
        </button>
      </Footer>
    </Screen>
  )
}
