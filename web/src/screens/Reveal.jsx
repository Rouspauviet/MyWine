// Révélation — fin de la dégustation à l'aveugle : on découvre la vraie bouteille
// Solo : l'app ne la connaît pas, on va la regarder, on la photographie et on la saisit. À plusieurs (invité) : on la déchiffre avec le code annoncé par l'hôte.
// C'est le premier écran du parcours Aveugle où des informations réelles apparaissent.
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Eye, BookOpen, KeyRound, Camera } from 'lucide-react'
import { Screen, Header, Body, Footer, ConfirmModal, Loading } from '../components/Layout'
import { BottleForm } from '../components/Forms'
import * as db from '../db/db'
import { computeComparison } from '../utils/comparison'
import { usePhotoDraft } from '../utils/photos'
import { revealInvitation, normalizeCode } from '../utils/session'

export default function Reveal() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [rec, setRec] = useState(undefined)
  const [phase, setPhase] = useState('choice') // 'choice' = moment de vérité | 'form' = saisie
  const [reality, setReality] = useState(db.emptyReality())
  const [code, setCode] = useState('')
  const [confirmUnknown, setConfirmUnknown] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const photoDraft = usePhotoDraft(id)

  useEffect(() => {
    db.getRecord(id).then(r => {
      if (!r) return navigate('/', { replace: true })
      if (r.status === 'done') return navigate(`/entry/${id}`, { replace: true })
      setRec(r)
    })
  }, [id, navigate])

  if (!rec) return <Loading />

  const finish = async (finalReality, withPhotos, extra = {}) => {
    setSaving(true)
    setError(null)
    try {
      const thumb = withPhotos ? await photoDraft.commit(id) : null
      await db.saveRecord({
        ...rec,
        ...extra,
        status: 'done',
        reality: finalReality,
        comparison: computeComparison(rec, finalReality),
        thumb,
      })
      // `reveal` : la comparaison s'ouvre sur la mise en scène, réponse après réponse
      navigate(`/comparison/${id}`, { replace: true, state: { reveal: true } })
    } catch (err) {
      setError(`Impossible de sauvegarder : ${err.message}`)
      setSaving(false)
    }
  }

  // ── Invité d'une dégustation à plusieurs : saisie du code de révélation ──────
  if (rec.session?.role === 'guest') {
    const hostName = rec.session.hostName
    const unlock = async () => {
      setSaving(true)
      setError(null)
      const truth = await revealInvitation(rec.session, code)
      if (!truth) {
        setError('Ce code ne correspond pas. Vérifie les 4 lettres avec ' + hostName + '.')
        setSaving(false)
        return
      }
      const { note, ai, ...bottle } = truth
      finish({ ...db.emptyReality(), ...bottle }, false, { session: { ...rec.session, hostNote: note ?? '', aiProfile: ai ?? '' } })
    }

    return (
      <Screen>
        <Body className="centered">
          <div className="hero">
            <Eye size={32} className="hero-icon" />
            <h1 className="hero-title">Le moment de vérité</h1>
            <p className="hero-text">{`Tu as terminé ta dégustation.\nDemande le code de révélation à ${hostName}.`}</p>
          </div>
          <input
            className="input code-input"
            value={code}
            onChange={e => setCode(normalizeCode(e.target.value).slice(0, 4))}
            placeholder="ABCD"
            aria-label="Code de révélation"
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="done"
            onKeyDown={e => { if (e.key === 'Enter' && code.length === 4) unlock() }}
          />
          {error && <p className="banner error">{error}</p>}
        </Body>
        <Footer className="column bare">
          <button className="btn btn-primary btn-large block" disabled={saving || code.length < 4} onClick={unlock}>
            <KeyRound size={22} /> {saving ? 'Ouverture…' : 'Révéler la bouteille'}
          </button>
          <button className="link-btn" onClick={() => navigate(`/tasting/${id}`)}>Revenir à mes notes</button>
        </Footer>
      </Screen>
    )
  }

  // ── Solo ────────────────────────────────────────────────────────────────────
  if (phase === 'choice') {
    return (
      <Screen>
        <Body className="centered">
          <div className="hero">
            <Eye size={32} className="hero-icon" />
            <h1 className="hero-title">Le moment de vérité</h1>
            <p className="hero-text">{'Tu as terminé ta dégustation.\nVa regarder la bouteille et prends son étiquette en photo : elle rejoindra ton journal.'}</p>
          </div>
          {error && <p className="banner error">{error}</p>}
        </Body>
        <Footer className="column bare">
          {/* Un label autour du champ fichier : ouvre l'appareil photo au toucher, y compris sur iPhone */}
          <label className="btn btn-primary btn-large block">
            <Camera size={22} /> Photographier l'étiquette
            <input type="file" accept="image/*" hidden onChange={e => { photoDraft.add(e.target.files); setPhase('form') }} />
          </label>
          <button className="link-btn" onClick={() => setPhase('form')}>Saisir la bouteille sans photo</button>
          <button className="link-btn" disabled={saving} onClick={() => setConfirmUnknown(true)}>
            Je ne connais pas la bouteille
          </button>
          <button className="link-btn" onClick={() => navigate(`/tasting/${id}`)}>Revenir à mes notes</button>
        </Footer>
        <ConfirmModal
          open={confirmUnknown}
          title="Enregistrer sans la bouteille ?"
          text="Ta dégustation sera gardée au journal, sans comparaison. Tu pourras compléter la fiche plus tard."
          confirmLabel="Enregistrer"
          onConfirm={() => { setConfirmUnknown(false); finish(db.emptyReality(), false) }}
          onCancel={() => setConfirmUnknown(false)}
        />
      </Screen>
    )
  }

  return (
    <Screen>
      <Header title="La réalité" label="Révélation" onBack={() => setPhase('choice')} />
      <Body>
        {error && <p className="banner error">{error}</p>}
        <BottleForm value={reality} onChange={setReality} photoDraft={photoDraft} />
      </Body>
      <Footer>
        <button className="btn btn-primary grow" disabled={saving || photoDraft.busy} onClick={() => finish(reality, true)}>
          <BookOpen size={18} /> {saving ? 'Sauvegarde…' : 'Comparer et enregistrer'}
        </button>
      </Footer>
    </Screen>
  )
}
