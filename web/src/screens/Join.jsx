// Dégustation à plusieurs — côté invité : arrivée par le lien ou le QR code de l'hôte
// La vraie bouteille reste chiffrée dans la fiche jusqu'à la saisie du code de révélation.
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EyeOff, Play } from 'lucide-react'
import { Screen, Body, Footer, Loading } from '../components/Layout'
import LevelPicker from '../components/LevelPicker'
import * as db from '../db/db'
import { readInvitation, isSessionSupported } from '../utils/session'
import { getPreferredLevel, setPreferredLevel } from '../data/levels'

// Vrai quand l'app tourne depuis l'écran d'accueil (iPhone : navigator.standalone)
function isInstalledApp() {
  return !!navigator.standalone || !!window.matchMedia?.('(display-mode: standalone)').matches
}

export default function Join() {
  const navigate = useNavigate()
  const { token } = useParams()
  const [level, setLevel] = useState(getPreferredLevel())
  const [checked, setChecked] = useState(false)
  const [invitation, setInvitation] = useState(null)

  // Lien déjà ouvert sur cet appareil : on reprend la dégustation au lieu d'en créer une seconde
  useEffect(() => {
    let cancelled = false
    setChecked(false)
    readInvitation(token).then(async (inv) => {
      if (cancelled) return
      setInvitation(inv)
      if (!inv) return setChecked(true)
      const existing = await db.findBySession(inv.id, 'guest')
      if (cancelled) return
      if (!existing) return setChecked(true)
      navigate(existing.status === 'done' ? `/entry/${existing.id}` : `/tasting/${existing.id}`, { replace: true })
    })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  if (!checked) return <Loading />

  if (!invitation || !isSessionSupported()) {
    return (
      <Screen>
        <Body className="centered">
          <div className="hero">
            <h1 className="hero-title">Invitation illisible</h1>
            <p className="hero-text">
              {invitation
                ? 'Cette adresse ne permet pas de rejoindre une dégustation à plusieurs.'
                : 'Le lien est incomplet ou abîmé. Demande à l\'hôte de te le renvoyer ou scanne à nouveau son QR code.'}
            </p>
          </div>
        </Body>
        <Footer className="column bare">
          <button className="btn btn-secondary block" onClick={() => navigate('/', { replace: true })}>Aller à l'accueil</button>
        </Footer>
      </Screen>
    )
  }

  const start = async () => {
    setPreferredLevel(level)
    const record = await db.saveRecord({
      ...db.newRecord('blind'),
      level,
      session: {
        role: 'guest',
        id: invitation.id,
        hostName: invitation.host,
        mcq: invitation.mcq ?? {},
        k: invitation.k ?? {},      // codes des indices
        a: invitation.a ?? null,    // indices et pistes d'attention rédigés par l'assistant de l'hôte
        s: invitation.s, i: invitation.i, c: invitation.c, // bouteille chiffrée
      },
    })
    navigate(`/tasting/${record.id}`, { replace: true })
  }

  return (
    <Screen>
      <Body className="centered">
        <div className="hero">
          <EyeOff size={32} className="hero-icon" />
          <h1 className="hero-title">{invitation.host} t'invite à déguster à l'aveugle</h1>
          <p className="hero-text">
            {'Ne regarde pas la bouteille.\nGoûte, note ce que tu perçois, fais tes hypothèses.'}
          </p>
          <p className="hero-note">○ {invitation.host} révèlera la bouteille à la fin</p>
        </div>
        <LevelPicker value={level} onChange={setLevel} />
      </Body>
      <Footer className="column bare">
        <button className="btn btn-primary btn-large block" onClick={start}>
          <Play size={22} /> Commencer la dégustation
        </button>
        {/* Dans le navigateur, la fiche n'ira pas dans le journal de l'app installée : on le dit avant de commencer */}
        {!isInstalledApp() && (
          <p className="muted">Tu as déjà MyWine sur ton écran d'accueil ? Ouvre plutôt l'app, puis Dégustation à plusieurs → Rejoindre : ta fiche ira dans ton journal.</p>
        )}
      </Footer>
    </Screen>
  )
}
