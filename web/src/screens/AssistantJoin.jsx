// Assistant prêté par un ami — on arrive ici par son lien de partage, et on saisit le code qu'il donne
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Sparkles, KeyRound, Check } from 'lucide-react'
import { Screen, Body, Footer } from '../components/Layout'
import { hasApiKey, setApiKey, setAiModel } from '../utils/ai'
import { openAssistantShare, isShareTokenValid, SHARE_CODE_LENGTH } from '../utils/aiShare'
import { isSessionSupported, normalizeCode } from '../utils/session'

export default function AssistantJoin() {
  const navigate = useNavigate()
  const { token } = useParams()
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const [replacing] = useState(hasApiKey())

  const goHome = () => navigate('/', { replace: true })
  const usable = isSessionSupported() && isShareTokenValid(token)

  const unlock = async () => {
    setBusy(true)
    setError(null)
    const shared = await openAssistantShare(token, code)
    setBusy(false)
    if (!shared) return setError('Ce code ne correspond pas. Vérifie les 8 lettres avec ton ami.')
    setApiKey(shared.apiKey, true)
    setAiModel(shared.model)
    setDone(true)
  }

  if (done) {
    return (
      <Screen>
        <Body className="centered">
          <div className="hero">
            <Check size={32} className="hero-icon" />
            <h1 className="hero-title">Assistant activé</h1>
            <p className="hero-text">{'Ajoute une photo d\'étiquette : la fiche se remplit toute seule.\nL\'usage est facturé à ton ami, alors n\'en abuse pas.'}</p>
          </div>
          <p className="muted">L'assistant est activé dans ce navigateur. Si tu utilises MyWine depuis une icône de l'écran d'accueil, colle le lien dans ses paramètres.</p>
        </Body>
        <Footer className="column bare">
          <button className="btn btn-primary btn-large block" onClick={goHome}>Continuer</button>
        </Footer>
      </Screen>
    )
  }

  if (!usable) {
    return (
      <Screen>
        <Body className="centered">
          <div className="hero">
            <Sparkles size={32} className="hero-icon" />
            <h1 className="hero-title">Lien inutilisable</h1>
            <p className="hero-text">Ce lien de partage est incomplet ou abîmé. Demande à ton ami de te le renvoyer.</p>
          </div>
        </Body>
        <Footer className="column bare">
          <button className="btn btn-primary btn-large block" onClick={goHome}>Retour à l'accueil</button>
        </Footer>
      </Screen>
    )
  }

  const complete = code.length === SHARE_CODE_LENGTH

  return (
    <Screen>
      <Body className="centered">
        <div className="hero">
          <Sparkles size={32} className="hero-icon" />
          <h1 className="hero-title">Un ami te prête son assistant</h1>
          <p className="hero-text">{'Il lit les étiquettes et prépare les dégustations.\nSaisis le code de 8 lettres qu\'il te donne.'}</p>
        </div>
        <input
          className="input code-input"
          value={code}
          onChange={e => setCode(normalizeCode(e.target.value).slice(0, SHARE_CODE_LENGTH))}
          placeholder="ABCDEFGH"
          aria-label="Code de partage"
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="done"
          onKeyDown={e => { if (e.key === 'Enter' && complete) unlock() }}
        />
        {error && <p className="banner error">{error}</p>}
        {replacing && <p className="muted">Une clé est déjà enregistrée sur cet appareil : elle sera remplacée.</p>}
      </Body>
      <Footer className="column bare">
        <button className="btn btn-primary btn-large block" disabled={busy || !complete} onClick={unlock}>
          <KeyRound size={22} /> {busy ? 'Ouverture…' : 'Activer l\'assistant'}
        </button>
        <button className="link-btn" onClick={goHome}>Non merci</button>
      </Footer>
    </Screen>
  )
}
