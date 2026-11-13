// Fiche bouteille en saisie — sert à "Mémoriser un vin" (/memory/new) et à modifier une fiche existante
// En mode Aveugle, seules la réalité et l'impression sont modifiables : les hypothèses restent figées.
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BookOpen, Check } from 'lucide-react'
import { Screen, Header, Body, Footer, Loading } from '../components/Layout'
import { BottleForm, ImpressionForm } from '../components/Forms'
import * as db from '../db/db'
import { computeComparison } from '../utils/comparison'
import { usePhotoDraft } from '../utils/photos'
import { today } from '../utils/text'

export default function RecordEdit() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isNew = !id
  const [rec, setRec] = useState(isNew ? db.newRecord('memory') : undefined)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const photoDraft = usePhotoDraft(id)

  useEffect(() => {
    if (isNew) return
    db.getRecord(id).then(r => {
      if (!r) return navigate('/journal', { replace: true })
      // Les fiches créées avant l'ajout d'un champ héritent des valeurs par défaut
      setRec({ ...r, reality: { ...db.emptyReality(), ...r.reality }, style: { ...db.emptyStyle(), ...r.style } })
    })
  }, [id, isNew, navigate])

  if (!rec) return <Loading />

  const save = async () => {
    const r = rec.reality
    if (isNew && !r.cuvee && !r.producer && !r.appellation && photoDraft.photos.length === 0) {
      setError('Ajoute au moins un nom, un producteur, une appellation ou une photo pour retrouver ce vin.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const thumb = await photoDraft.commit(rec.id)
      const comparison = rec.mode === 'blind' ? computeComparison(rec, r) : {}
      await db.saveRecord({ ...rec, status: 'done', tastedAt: rec.tastedAt || today(), comparison, thumb })
      if (isNew) navigate(`/entry/${rec.id}`, { replace: true })
      else navigate(-1)
    } catch (err) {
      setError(`Impossible de sauvegarder : ${err.message}`)
      setSaving(false)
    }
  }

  return (
    <Screen>
      <Header
        title={isNew ? 'Infos & impression' : 'Modifier la fiche'}
        label={isNew ? 'Mémoriser un vin' : undefined}
        onBack={() => navigate(-1)}
      />
      <Body>
        {error && <p className="banner error">{error}</p>}
        <BottleForm value={rec.reality} onChange={reality => setRec(r => ({ ...r, reality }))} photoDraft={photoDraft} />
        <ImpressionForm
          value={rec.style}
          onChange={style => setRec(r => ({ ...r, style }))}
          tastedAt={rec.tastedAt}
          onTastedAtChange={tastedAt => setRec(r => ({ ...r, tastedAt }))}
        />
        {!isNew && rec.mode === 'blind' && (
          <p className="banner">Tes notes et hypothèses de dégustation à l'aveugle restent figées : la comparaison sera recalculée avec la réalité corrigée.</p>
        )}
      </Body>
      <Footer>
        <button className="btn btn-primary grow" disabled={saving || photoDraft.busy} onClick={save}>
          {isNew ? <BookOpen size={18} /> : <Check size={18} />}
          {saving ? 'Sauvegarde…' : isNew ? 'Ajouter au journal' : 'Enregistrer'}
        </button>
      </Footer>
    </Screen>
  )
}
