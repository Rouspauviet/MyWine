// Révélation — fin de la dégustation à l'aveugle : on découvre et on saisit la vraie bouteille
// C'est le premier écran du parcours Aveugle où des informations réelles apparaissent.
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Eye, BookOpen } from 'lucide-react'
import { Screen, Header, Body, Footer, ConfirmModal, Loading } from '../components/Layout'
import { BottleForm } from '../components/Forms'
import * as db from '../db/db'
import { computeComparison } from '../utils/comparison'
import { usePhotoDraft } from '../utils/photos'

export default function Reveal() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [rec, setRec] = useState(undefined)
  const [phase, setPhase] = useState('choice') // 'choice' = moment de vérité | 'form' = saisie
  const [reality, setReality] = useState(db.emptyReality())
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

  const finish = async (finalReality, withPhotos) => {
    setSaving(true)
    setError(null)
    try {
      const thumb = withPhotos ? await photoDraft.commit(id) : null
      await db.saveRecord({
        ...rec,
        status: 'done',
        reality: finalReality,
        comparison: computeComparison(rec, finalReality),
        thumb,
      })
      navigate(`/comparison/${id}`, { replace: true })
    } catch (err) {
      setError(`Impossible de sauvegarder : ${err.message}`)
      setSaving(false)
    }
  }

  if (phase === 'choice') {
    return (
      <Screen>
        <Body className="centered">
          <div className="hero">
            <Eye size={32} className="hero-icon" />
            <h1 className="hero-title">Le moment de vérité</h1>
            <p className="hero-text">{'Tu as terminé ta dégustation.\nRetourne la bouteille et découvre ce que tu as bu.'}</p>
          </div>
          {error && <p className="banner error">{error}</p>}
        </Body>
        <Footer className="column bare">
          <button className="btn btn-primary btn-large block" onClick={() => setPhase('form')}>
            <Eye size={22} /> Révéler la bouteille
          </button>
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
