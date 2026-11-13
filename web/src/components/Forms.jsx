// Formulaires partagés — photos, identité de la bouteille, impression personnelle
import { useState } from 'react'
import { Camera, X, Sparkles } from 'lucide-react'
import { hasApiKey, readLabel, blobToImage, AiError } from '../utils/ai'
import { Field, TextField, ChipGroup, TagInput, SuggestInput, RatingStars, Switch } from './Inputs'
import { Card } from './Layout'
import { WINE_TYPES, COUNTRIES, PAIRING_SUGGESTIONS } from '../data/wineData'
import { GRAPE_VARIETIES_SORTED } from '../data/grapeVarieties'
import { searchAppellations, REGIONS } from '../data/appellations'
import { normalize } from '../utils/text'

// Appellation avec autocomplétion : choisir une suggestion renvoie aussi région et pays
export function AppellationInput({ value, onChange, onPickAppellation, placeholder }) {
  return (
    <SuggestInput
      value={value}
      onChange={onChange}
      getSuggestions={searchAppellations}
      onPick={onPickAppellation}
      renderSuggestion={a => <>{a.name} <small>· {a.region}</small></>}
      placeholder={placeholder}
    />
  )
}

function suggestFrom(list) {
  return (q) => {
    const n = normalize(q)
    if (!n) return []
    return list.filter(x => normalize(x).startsWith(n) && normalize(x) !== n).slice(0, 5)
  }
}
export const suggestRegions = suggestFrom(REGIONS)
export const suggestCountries = suggestFrom(COUNTRIES.filter(c => c !== 'Autre'))

// Photos : `draft` vient de usePhotoDraft()
export function PhotoPicker({ draft }) {
  return (
    <div className="photo-strip">
      {draft.photos.map(p => (
        <div key={p.id} className="photo-item">
          <img src={p.url} alt="Photo de la bouteille" />
          <button type="button" className="photo-remove" aria-label="Retirer la photo" onClick={() => draft.remove(p.id)}>
            <X size={16} />
          </button>
        </div>
      ))}
      <label className="photo-add">
        <Camera size={24} />
        <span>{draft.busy ? 'Ajout…' : draft.photos.length ? 'Autre photo' : 'Ajouter une photo'}</span>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={draft.busy}
          onChange={e => { draft.add(e.target.files); e.target.value = '' }}
        />
      </label>
    </div>
  )
}

// Lecture de l'étiquette par l'assistant IA — visible seulement si une clé est configurée et qu'il y a une photo.
// Ne remplit que les champs encore vides : ce que l'utilisateur a saisi n'est jamais écrasé.
function LabelReader({ value, onChange, photoDraft }) {
  const [state, setState] = useState({ busy: false, message: null, kind: null })
  if (!hasApiKey() || photoDraft.photos.length === 0) return null

  const run = async () => {
    setState({ busy: true, message: null, kind: null })
    try {
      const images = await Promise.all(photoDraft.photos.slice(0, 2).map(p => blobToImage(p.blob)))
      const { reality: found } = await readLabel(images)
      const next = { ...value }
      let filled = 0
      for (const [key, val] of Object.entries(found)) {
        const empty = Array.isArray(next[key]) ? next[key].length === 0 : !next[key]
        const useful = Array.isArray(val) ? val.length > 0 : !!val
        if (empty && useful) { next[key] = val; filled++ }
      }
      onChange(next)
      setState({
        busy: false,
        kind: filled ? 'success' : null,
        message: filled
          ? `${filled} champ${filled > 1 ? 's' : ''} rempli${filled > 1 ? 's' : ''} depuis la photo. Vérifie-les : l'assistant peut se tromper.`
          : 'L\'assistant n\'a rien trouvé de plus sur cette photo.',
      })
    } catch (err) {
      setState({ busy: false, kind: 'error', message: err instanceof AiError ? err.message : `Lecture impossible : ${err.message}` })
    }
  }

  return (
    <>
      <button type="button" className="btn btn-secondary block" disabled={state.busy || photoDraft.busy} onClick={run}>
        <Sparkles size={18} /> {state.busy ? 'Lecture de l\'étiquette…' : 'Remplir depuis la photo'}
      </button>
      {state.message && <p className={`banner ${state.kind ?? ''}`}>{state.message}</p>}
    </>
  )
}

// Identité réelle de la bouteille — utilisée à la Révélation, en Mémoire et en modification
export function BottleForm({ value, onChange, photoDraft }) {
  const set = (key, val) => onChange({ ...value, [key]: val })

  const pickAppellation = (a) => onChange({
    ...value,
    appellation: a.name,
    region: value.region || a.region || '',
    country: value.country || a.country || '',
  })

  return (
    <Card title="La bouteille">
      <Field label="Photos" optional>
        <PhotoPicker draft={photoDraft} />
      </Field>
      <LabelReader value={value} onChange={onChange} photoDraft={photoDraft} />

      <Field label="Type">
        <ChipGroup options={WINE_TYPES} value={value.type} onChange={v => set('type', v)} dots />
      </Field>

      <TextField label="Cuvée / Nom du vin" value={value.cuvee} onChange={v => set('cuvee', v)} placeholder="Ex : La Bergerie des Centenaires" />
      <TextField label="Producteur / Domaine" value={value.producer} onChange={v => set('producer', v)} placeholder="Ex : Clos des Centenaires" />

      <Field label="Appellation">
        <AppellationInput
          value={value.appellation}
          onChange={v => set('appellation', v)}
          onPickAppellation={pickAppellation}
          placeholder="Ex : Pommard, IGP Pays d'Oc, Barolo…"
        />
      </Field>

      <div className="input-row">
        <Field label="Région">
          <SuggestInput value={value.region} onChange={v => set('region', v)} getSuggestions={suggestRegions} onPick={v => set('region', v)} placeholder="Ex : Bourgogne" />
        </Field>
        <Field label="Pays">
          <SuggestInput value={value.country} onChange={v => set('country', v)} getSuggestions={suggestCountries} onPick={v => set('country', v)} placeholder="Ex : France" />
        </Field>
      </div>

      <div className="input-row">
        <TextField label="Millésime" value={value.vintage} onChange={v => set('vintage', v.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" placeholder="Ex : 2020" />
        <TextField label="Alcool (% vol)" value={value.abv} onChange={v => set('abv', v)} inputMode="decimal" placeholder="Ex : 13,5" />
      </div>

      <Field label="Cépage(s)">
        <TagInput tags={value.grapes} onChange={v => set('grapes', v)} suggestions={GRAPE_VARIETIES_SORTED} placeholder="Ex : Chardonnay, Pinot Noir" />
      </Field>

      <div className="input-row">
        <TextField label="Prix (€)" value={value.price} onChange={v => set('price', v)} inputMode="decimal" placeholder="Ex : 24" />
        <TextField label="Lieu d'achat" value={value.purchasePlace} onChange={v => set('purchasePlace', v)} placeholder="Caviste, domaine…" />
      </div>

      <TextField label="Vignerons" optional value={value.vignerons} onChange={v => set('vignerons', v)} placeholder="Ex : Stéphanie et Luc Baudet" />
    </Card>
  )
}

// Impression personnelle — Mémoire et modification d'une fiche
export function ImpressionForm({ value, onChange, tastedAt, onTastedAtChange }) {
  const set = (key, val) => onChange({ ...value, [key]: val })
  return (
    <Card title="Mon impression">
      <Field label="Note">
        <RatingStars value={value.rating} onChange={v => set('rating', v)} />
      </Field>
      <Switch label="Coup de cœur" value={value.favorite} onChange={v => set('favorite', v)} />
      <Field label="Accords mets" optional>
        <TagInput tags={value.pairings} onChange={v => set('pairings', v)} suggestions={PAIRING_SUGGESTIONS} placeholder="Ex : Fromages, Viandes rouges…" />
      </Field>
      <TextField label="Commentaire" optional multiline value={value.overallImpression} onChange={v => set('overallImpression', v)} placeholder="Notes libres sur ce vin…" />
      <TextField label="Occasion" optional value={value.context} onChange={v => set('context', v)} placeholder="Avec qui, où, à quelle occasion…" />
      <TextField label="Date" type="date" value={tastedAt} onChange={onTastedAtChange} />
    </Card>
  )
}
