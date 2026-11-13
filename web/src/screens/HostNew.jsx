// Dégustation à plusieurs — côté hôte : saisie de la bouteille que les invités dégusteront à l'aveugle
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { Screen, Header, Body, Footer, Card } from '../components/Layout'
import { TextField, Switch } from '../components/Inputs'
import { hasApiKey, describeWine } from '../utils/ai'
import { BottleForm } from '../components/Forms'
import * as db from '../db/db'
import { usePhotoDraft } from '../utils/photos'
import { createInvitation, isSessionSupported, NOTE_MAX_LENGTH } from '../utils/session'
import { getPreferredName, setPreferredName } from '../data/levels'

export default function HostNew() {
  const navigate = useNavigate()
  const [rec, setRec] = useState(() => db.newRecord('memory'))
  const [hostName, setHostName] = useState(getPreferredName())
  const [note, setNote] = useState('')
  const aiAvailable = hasApiKey()
  const [withAi, setWithAi] = useState(aiAvailable)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const photoDraft = usePhotoDraft(undefined)
  const supported = isSessionSupported()

  const create = async () => {
    const r = rec.reality
    if (!hostName.trim()) return setError('Indique ton prénom : il s\'affichera chez tes invités.')
    if (!r.cuvee && !r.producer && !r.appellation) return setError('Renseigne au moins le nom du vin, le producteur ou l\'appellation.')
    setSaving(true)
    setError(null)
    try {
      const name = hostName.trim()
      setPreferredName(name)
      // Profil attendu : un échec de l'assistant ne doit jamais empêcher de créer l'invitation
      let aiProfile = ''
      if (aiAvailable && withAi) {
        try { aiProfile = (await describeWine(r)).profile } catch { aiProfile = '' }
      }
      const invitation = await createInvitation(r, name, note, aiProfile)
      const thumb = await photoDraft.commit(rec.id)
      await db.saveRecord({
        ...rec,
        status: 'done',
        thumb,
        session: { role: 'host', id: invitation.id, hostName: name, code: invitation.code, token: invitation.token, hostNote: note.trim(), aiProfile },
      })
      navigate(`/host/${rec.id}`, { replace: true })
    } catch (err) {
      setError(`Impossible de créer la dégustation : ${err.message}`)
      setSaving(false)
    }
  }

  return (
    <Screen>
      <Header title="La bouteille à faire deviner" label="Dégustation à plusieurs" onBack={() => navigate(-1)} />
      <Body>
        {!supported && (
          <p className="banner error">La dégustation à plusieurs nécessite la version en ligne de l'app (HTTPS). Elle ne fonctionne pas sur cette adresse de test.</p>
        )}
        {error && <p className="banner error">{error}</p>}
        <p className="banner">
          Plus tu renseignes la bouteille, plus la comparaison de tes invités sera riche. Cépage, région (ou pays) et millésime servent aux choix multiples des débutants.
        </p>
        <Card title="L'hôte">
          <TextField label="Ton prénom" value={hostName} onChange={setHostName} placeholder="Ex : Camille" autoCapitalize="words" />
        </Card>
        <BottleForm value={rec.reality} onChange={reality => setRec(r => ({ ...r, reality }))} photoDraft={photoDraft} />
        <Card title="Ton mot pour la révélation">
          <TextField
            label="Pourquoi cette bouteille ?"
            optional
            multiline
            value={note}
            onChange={v => setNote(v.slice(0, NOTE_MAX_LENGTH))}
            placeholder="Une anecdote, où tu l'as trouvée, ce que tu en penses… Tes invités le liront en découvrant la bouteille."
          />
          <p className="muted">{note.length} / {NOTE_MAX_LENGTH}</p>
        </Card>
        {aiAvailable && (
          <Card title="Assistant IA">
            <Switch label="Ajouter ce qu'on attend de ce vin" value={withAi} onChange={setWithAi} />
            <p className="muted left">Un court texte rédigé par l'assistant à partir de la fiche, que tes invités liront après la révélation. Les informations de la bouteille sont envoyées à Anthropic.</p>
          </Card>
        )}
      </Body>
      <Footer>
        <button className="btn btn-primary grow" disabled={saving || photoDraft.busy || !supported} onClick={create}>
          <Users size={18} /> {saving ? 'Création…' : 'Créer l\'invitation'}
        </button>
      </Footer>
    </Screen>
  )
}
