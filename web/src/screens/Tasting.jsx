// Wizard de dégustation à l'aveugle — étape 0 = choix du type, étapes 1-4 = wizard sensoriel
// Le type de vin est une hypothèse qui pilote le contenu des étapes Perception et Structure.
// Règle anti-révélation : aucune information réelle sur la bouteille n'apparaît ici.
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Screen, Header, Body, Footer, ConfirmModal, Loading } from '../components/Layout'
import { Field, TextField, ChipGroup, TagInput, SuggestInput, Slider, RatingStars, Switch } from '../components/Inputs'
import { AppellationInput, suggestRegions } from '../components/Forms'
import * as db from '../db/db'
import {
  WINE_TYPES,
  ROBE_OPTIONS_BY_TYPE, AROMA_FAMILIES_BY_TYPE,
  TANNIN_INTENSITY, TANNIN_TEXTURE, FRUIT_MATURITY, ACIDITY_RED,
  ACIDITY_5, TEXTURE_WHITE, MINERALITY, MINERALITY_TYPE, OAK,
  VIVACITY, PERCEIVED_SWEETNESS, LIGHT_STRUCTURE,
  BUBBLE_QUALITY, PERCEIVED_DOSAGE, SPARKLING_REGISTER,
  PHENOLIC_INTENSITY, PHENOLIC_TYPE, BITTERNESS, BITTERNESS_TYPE, OXIDATIVE_REGISTER, RESIDUAL_ACIDITY,
  BODY_3, FINISH_3,
  CLIMATE_OPTIONS, SOIL_OPTIONS, COUNTRIES, STYLE_OPTIONS, PAIRING_SUGGESTIONS,
} from '../data/wineData'
import { GRAPE_VARIETIES_SORTED } from '../data/grapeVarieties'

const STEPS = [
  { label: 'Perception', subtitle: 'Ce que tu vois et sens' },
  { label: 'Structure',  subtitle: 'Ce que tu ressens en bouche' },
  { label: 'Hypothèses', subtitle: 'Tes déductions' },
  { label: 'Style',      subtitle: 'Ton impression globale' },
]
const TOTAL_STEPS = STEPS.length
const asOptions = (labels) => (labels ?? []).map(l => ({ value: l, label: l }))

export default function Tasting() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [rec, setRec] = useState(undefined)
  const [pendingType, setPendingType] = useState(null)
  const [confirmAbandon, setConfirmAbandon] = useState(false)
  const bodyRef = useRef(null)
  const dirty = useRef(false)

  useEffect(() => {
    db.getRecord(id).then(r => {
      if (!r) return navigate('/', { replace: true })
      if (r.status === 'done') return navigate(`/entry/${id}`, { replace: true })
      setRec(r)
    })
  }, [id, navigate])

  // Autosave : chaque modification est écrite en base après un court délai
  useEffect(() => {
    if (!rec || !dirty.current) return
    const timer = setTimeout(() => { db.saveRecord(rec); dirty.current = false }, 400)
    return () => clearTimeout(timer)
  }, [rec])

  // Retour en haut à chaque changement d'étape
  const step = rec?.step ?? 0
  useEffect(() => { bodyRef.current?.scrollTo(0, 0) }, [step])

  if (!rec) return <Loading />

  const update = (patch) => {
    dirty.current = true
    setRec(r => ({ ...r, ...(typeof patch === 'function' ? patch(r) : patch) }))
  }
  // Setter d'une section du brouillon (accepte une valeur ou une fonction de mise à jour)
  const section = (key) => (val) => update(r => ({ [key]: typeof val === 'function' ? val(r[key]) : val }))

  const goTo = async (nextStep) => {
    const saved = await db.saveRecord({ ...rec, step: nextStep })
    dirty.current = false
    setRec(saved)
  }

  const goNext = async () => {
    if (step < TOTAL_STEPS) return goTo(step + 1)
    await db.saveRecord(rec)
    navigate(`/reveal/${id}`)
  }

  const goBack = async () => {
    if (step > 0) return goTo(step - 1)
    // Étape 0 : un brouillon sans type choisi ne contient rien, on ne le garde pas
    if (!rec.wineType) await db.deleteRecord(id)
    else await db.saveRecord(rec)
    navigate('/', { replace: true })
  }

  // Changement de type : la robe, les arômes et la structure dépendent du type → remise à zéro
  const handleTypeChange = (newType) => {
    if (!newType || newType === rec.wineType) return
    const hasTypeData = rec.perception.robe?.length || rec.perception.aromaFamilies?.length || rec.structure?.data
    if (hasTypeData) setPendingType(newType)
    else update({ wineType: newType })
  }

  const applyTypeChange = () => {
    update(r => ({
      wineType: pendingType,
      perception: { ...r.perception, robe: [], aromaFamilies: [] },
      structure: {},
    }))
    setPendingType(null)
  }

  const abandon = async () => {
    await db.deleteRecord(id)
    navigate('/', { replace: true })
  }

  const structureData = rec.structure?.v === 2 ? (rec.structure.data ?? {}) : {}
  const onStructureChange = (data) => update({ structure: { v: 2, wineType: rec.wineType, data } })

  // ─── Étape 0 : type de vin ─────────────────────────────────────────────────
  if (step === 0) {
    return (
      <Screen>
        <Header title="Dégustation à l'aveugle" onBack={goBack} />
        <Body>
          <div>
            <h2 className="step-title">Quel type de vin ?</h2>
            <p className="step-subtitle">Cette hypothèse guide ton observation. Tu pourras en changer.</p>
          </div>
          <div className="type-grid">
            {WINE_TYPES.map(type => (
              <button
                key={type.value}
                className={`type-card ${rec.wineType === type.value ? 'active' : ''}`}
                aria-pressed={rec.wineType === type.value}
                onClick={() => handleTypeChange(type.value)}
              >
                <span className={`dot ${type.value}`} />
                {type.label}
              </button>
            ))}
          </div>
        </Body>
        <Footer>
          <button className="btn btn-primary grow" disabled={!rec.wineType} onClick={goNext}>
            Continuer <ArrowRight size={18} />
          </button>
        </Footer>
        <ConfirmModal
          open={!!pendingType}
          title="Changer de type ?"
          text="Tes observations de robe, d'arômes et de structure seront effacées. Le reste est conservé."
          confirmLabel="Changer"
          onConfirm={applyTypeChange}
          onCancel={() => setPendingType(null)}
        />
      </Screen>
    )
  }

  // ─── Étapes 1-4 ────────────────────────────────────────────────────────────
  const info = STEPS[step - 1]

  return (
    <Screen>
      <Header title={info.label} label={`Étape ${step} / ${TOTAL_STEPS}`} onBack={goBack} progress={step / TOTAL_STEPS} />
      <Body innerRef={bodyRef}>
        <p className="step-subtitle">{info.subtitle}</p>
        {step === 1 && <StepPerception wineType={rec.wineType} value={rec.perception} onChange={section('perception')} />}
        {step === 2 && <StepStructure wineType={rec.wineType} data={structureData} onChange={onStructureChange} />}
        {step === 3 && <StepHypotheses value={rec.hypotheses} onChange={section('hypotheses')} />}
        {step === 4 && <StepStyle value={rec.style} onChange={section('style')} />}
      </Body>
      <Footer>
        <button className="btn btn-ghost" onClick={() => setConfirmAbandon(true)}>Abandonner</button>
        <button className="btn btn-primary grow" onClick={goNext}>
          {step < TOTAL_STEPS ? <>Suivant <ArrowRight size={18} /></> : <>Terminer <Check size={18} /></>}
        </button>
      </Footer>
      <ConfirmModal
        open={confirmAbandon}
        title="Abandonner cette dégustation ?"
        text="Tes notes seront supprimées. Pour faire une pause, quitte simplement l'écran : tu pourras reprendre depuis l'accueil."
        confirmLabel="Abandonner"
        danger
        onConfirm={abandon}
        onCancel={() => setConfirmAbandon(false)}
      />
    </Screen>
  )
}

// ─── Étape 1 — Perception (selon le type) ────────────────────────────────────

function StepPerception({ wineType, value, onChange }) {
  const set = (key, val) => onChange(prev => ({ ...prev, [key]: val }))
  const robeOptions = asOptions(ROBE_OPTIONS_BY_TYPE[wineType])
  const aromaOptions = asOptions(AROMA_FAMILIES_BY_TYPE[wineType])

  return (
    <>
      {robeOptions.length > 0 && (
        <Field label="Robe" optional>
          <ChipGroup options={robeOptions} value={value.robe} onChange={v => set('robe', v)} multi />
        </Field>
      )}
      <Field label={`Intensité aromatique — ${value.aromaIntensity}/5`}>
        <Slider value={value.aromaIntensity} onChange={v => set('aromaIntensity', v)} minLabel="Discret" maxLabel="Expressif" />
      </Field>
      {aromaOptions.length > 0 && (
        <Field label="Familles aromatiques" optional>
          <ChipGroup options={aromaOptions} value={value.aromaFamilies} onChange={v => set('aromaFamilies', v)} multi />
        </Field>
      )}
      <TextField label="Autres notes" optional multiline value={value.notes} onChange={v => set('notes', v)} placeholder="Notes libres, impressions…" />
    </>
  )
}

// ─── Étape 2 — Structure (une grammaire par type) ────────────────────────────

function StepStructure({ wineType, data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val })
  const chips = (key, options, multi) => (
    <ChipGroup options={options} value={data[key]} onChange={v => set(key, v)} multi={multi} />
  )

  switch (wineType) {
    case 'rouge':
      return (
        <>
          <Field label="Tanins" hint="Sensation de sécheresse / prise sur les gencives. Très marqués = bouche asséchée.">
            {chips('taninIntensity', TANNIN_INTENSITY)}
          </Field>
          {data.taninIntensity && data.taninIntensity !== 't1' && (
            <Field label="Texture des tanins" optional>{chips('taninTexture', TANNIN_TEXTURE, true)}</Field>
          )}
          <Field label="Maturité du fruit" optional>{chips('fruitMaturity', FRUIT_MATURITY)}</Field>
          <Field label="Corps" hint="Corps ample = sensation de volume et de densité en bouche.">{chips('body', BODY_3)}</Field>
          <Field label="Acidité" optional>{chips('acidity', ACIDITY_RED)}</Field>
          <Field label="Longueur" optional>{chips('finish', FINISH_3)}</Field>
        </>
      )

    case 'blanc':
      return (
        <>
          <Field label="Acidité" hint="Tranchante = salivation nette, tension forte. Plate = impression molle, manque de fraîcheur.">
            {chips('acidity', ACIDITY_5)}
          </Field>
          <Field label="Texture / Gras" hint="Onctueuse = richesse qui contrebalance l'acidité. Légère et sèche = vin tendu, nerveux.">
            {chips('texture', TEXTURE_WHITE)}
          </Field>
          <Field label="Minéralité" hint="Craie, silex, iode — impression de minéral humide ou de pierre. Marqueur d'origine fort.">
            {chips('minerality', MINERALITY)}
          </Field>
          {data.minerality && data.minerality !== 'absente' && (
            <Field label="Type de minéralité" optional>{chips('mineralityType', MINERALITY_TYPE, true)}</Field>
          )}
          <Field label="Boisé" optional>{chips('boise', OAK)}</Field>
          <Field label="Longueur" optional>{chips('finish', FINISH_3)}</Field>
        </>
      )

    case 'rose':
      return (
        <>
          <Field label="Vivacité / Fraîcheur">{chips('vivacity', VIVACITY)}</Field>
          <Field label="Corps" optional>{chips('body', BODY_3)}</Field>
          <Field label="Sucrosité perçue">{chips('perceivedSweetness', PERCEIVED_SWEETNESS)}</Field>
          <Field label="Structure légère" optional>{chips('lightStructure', LIGHT_STRUCTURE)}</Field>
          <Field label="Longueur" optional>{chips('finish', FINISH_3)}</Field>
        </>
      )

    case 'petillant':
      return (
        <>
          <Field label="Qualité des bulles" hint="Très fines et persistantes = signe de qualité (méthode traditionnelle). Grossières = méthode cuve.">
            {chips('bubbleQuality', BUBBLE_QUALITY)}
          </Field>
          <Field label="Dosage perçu" hint="Difficile à deviner à l'aveugle, mais l'exercice est pertinent. Brut nature = très sec, minéral.">
            {chips('perceivedDosage', PERCEIVED_DOSAGE)}
          </Field>
          <Field label="Registre aromatique" optional>{chips('sparklingRegister', SPARKLING_REGISTER)}</Field>
          <Field label="Vivacité" optional>{chips('vivacity', VIVACITY)}</Field>
          <Field label="Corps sous-jacent" optional>{chips('body', BODY_3)}</Field>
        </>
      )

    case 'orange':
      return (
        <>
          <Field label="Texture phénolique" hint="Tanin de peau, différent d'un rouge. Grippage type peau d'orange ou thé — pas de sécheresse agressive.">
            {chips('phenolicIntensity', PHENOLIC_INTENSITY)}
          </Field>
          {data.phenolicIntensity && data.phenolicIntensity !== 'absente' && (
            <Field label="Type de texture" optional>{chips('phenolicType', PHENOLIC_TYPE, true)}</Field>
          )}
          <Field label="Amers">{chips('bitterness', BITTERNESS)}</Field>
          {data.bitterness && data.bitterness !== 'absents' && (
            <Field label="Type d'amers" optional>{chips('bitternessType', BITTERNESS_TYPE, true)}</Field>
          )}
          <Field label="Registre oxydatif">{chips('oxidativeRegister', OXIDATIVE_REGISTER)}</Field>
          <Field label="Acidité résiduelle" optional>{chips('residualAcidity', RESIDUAL_ACIDITY)}</Field>
          <Field label="Longueur" optional>{chips('finish', FINISH_3)}</Field>
        </>
      )

    // Clairet, Autre : pas de grammaire dédiée → saisie libre
    default:
      return (
        <>
          <p className="banner">Pas de grille dédiée pour ce type de vin : décris librement ce que tu ressens en bouche.</p>
          <Field label="Corps" optional>{chips('body', BODY_3)}</Field>
          <Field label="Longueur" optional>{chips('finish', FINISH_3)}</Field>
          <TextField label="Notes libres — bouche" optional multiline value={data.paletteFree} onChange={v => set('paletteFree', v)} placeholder="Texture, structure, impressions…" />
        </>
      )
  }
}

// ─── Étape 3 — Hypothèses ────────────────────────────────────────────────────

function StepHypotheses({ value, onChange }) {
  const set = (key, val) => onChange(prev => ({ ...prev, [key]: val }))
  const hasAdvanced = !!(value.appellation || value.producer || value.vintage || value.climate || value.soil)
  const [showAdvanced, setShowAdvanced] = useState(hasAdvanced)

  return (
    <>
      <Field label="Cépage(s)" optional>
        <TagInput tags={value.grapes} onChange={v => set('grapes', v)} suggestions={GRAPE_VARIETIES_SORTED} placeholder="Ex : Pinot Noir…" />
      </Field>
      <Field label={`Confiance — ${value.confidence}/5`} optional>
        <Slider value={value.confidence} onChange={v => set('confidence', v)} minLabel="Incertain" maxLabel="Sûr" />
      </Field>
      <Field label="Pays" optional>
        <ChipGroup options={asOptions(COUNTRIES)} value={value.country} onChange={v => set('country', v ?? '')} scroll />
      </Field>
      <Field label="Région" optional>
        <SuggestInput value={value.region} onChange={v => set('region', v)} getSuggestions={suggestRegions} onPick={v => set('region', v)} placeholder="Ex : Bourgogne, Rioja…" />
      </Field>

      <button type="button" className="collapse-btn" onClick={() => setShowAdvanced(v => !v)} aria-expanded={showAdvanced}>
        Tu veux pousser l'exercice ?
        {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {showAdvanced && (
        <>
          <Field label="Climat perçu" optional>
            <ChipGroup options={CLIMATE_OPTIONS} value={value.climate} onChange={v => set('climate', v)} />
          </Field>
          <Field label="Sol" optional>
            <ChipGroup options={SOIL_OPTIONS} value={value.soil} onChange={v => set('soil', v)} />
          </Field>
          <Field label="Appellation" optional>
            <AppellationInput
              value={value.appellation}
              onChange={v => set('appellation', v)}
              onPickAppellation={a => set('appellation', a.name)}
              placeholder="Ex : Pommard, Barolo…"
            />
          </Field>
          <TextField label="Producteur" optional value={value.producer} onChange={v => set('producer', v)} placeholder="Ex : Domaine de la Romanée-Conti…" />
          <TextField label="Millésime" optional value={value.vintage} onChange={v => set('vintage', v.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" placeholder="Ex : 2019" />
        </>
      )}
    </>
  )
}

// ─── Étape 4 — Style ─────────────────────────────────────────────────────────

function StepStyle({ value, onChange }) {
  const set = (key, val) => onChange(prev => ({ ...prev, [key]: val }))
  return (
    <>
      <Field label="Style" optional>
        <ChipGroup options={STYLE_OPTIONS} value={value.category} onChange={v => set('category', v)} />
      </Field>
      <Field label="Note" optional>
        <RatingStars value={value.rating} onChange={v => set('rating', v)} />
      </Field>
      <Switch label="Coup de cœur" value={value.favorite} onChange={v => set('favorite', v)} />
      <Field label="Accords" optional>
        <TagInput tags={value.pairings} onChange={v => set('pairings', v)} suggestions={PAIRING_SUGGESTIONS} placeholder="Ex : Fromages, Viandes rouges…" />
      </Field>
      <TextField label="Impression globale" optional multiline value={value.overallImpression} onChange={v => set('overallImpression', v)} placeholder="En une phrase…" />
      <TextField label="Occasion" optional value={value.context} onChange={v => set('context', v)} placeholder="Avec qui, où, à quelle occasion…" />
    </>
  )
}
