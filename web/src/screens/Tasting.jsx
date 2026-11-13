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
import { commonGrapesFor, DEFAULT_LEVEL } from '../data/levels'
import { vintageRanges, buildClues, focusFor } from '../utils/session'
import { Lightbulb, Sparkles } from 'lucide-react'

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

  const level = rec.level ?? DEFAULT_LEVEL
  const mcq = rec.session?.mcq ?? null
  // Indices de la dégustation à plusieurs : ceux déjà demandés restent affichés
  const focus = focusFor(rec.session, level)
  const clues = buildClues(rec.session, level)
  const shownClues = clues.slice(0, rec.cluesUsed ?? 0)
  const removedGrapes = shownClues.flatMap(c => c.removeGrapes ?? [])
  const structureData = rec.structure?.v === 2 ? (rec.structure.data ?? {}) : {}
  const onStructureChange = (data) => update({ structure: { v: 2, wineType: rec.wineType, data } })

  // ─── Étape 0 : type de vin ─────────────────────────────────────────────────
  if (step === 0) {
    return (
      <Screen>
        <Header title="Dégustation à l'aveugle" label={rec.session ? `Organisée par ${rec.session.hostName}` : undefined} onBack={goBack} />
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
        {/* Piste d'attention préparée par l'assistant de l'hôte : affichée pendant qu'on regarde et qu'on goûte */}
        {focus && step <= 2 && <p className="banner focus"><Sparkles size={14} /> {focus}</p>}
        {step === 1 && <StepPerception wineType={rec.wineType} level={level} value={rec.perception} onChange={section('perception')} />}
        {step === 2 && <StepStructure wineType={rec.wineType} level={level} data={structureData} onChange={onStructureChange} />}
        {step === 3 && clues.length > 0 && (
          <ClueBox clues={clues} shown={shownClues.length} onAsk={() => update(r => ({ cluesUsed: (r.cluesUsed ?? 0) + 1 }))} />
        )}
        {step === 3 && <StepHypotheses wineType={rec.wineType} level={level} mcq={mcq} removedGrapes={removedGrapes} value={rec.hypotheses} onChange={section('hypotheses')} />}
        {step === 4 && <StepStyle level={level} value={rec.style} onChange={section('style')} />}
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

function StepPerception({ wineType, level, value, onChange }) {
  const set = (key, val) => onChange(prev => ({ ...prev, [key]: val }))
  const robeOptions = asOptions(ROBE_OPTIONS_BY_TYPE[wineType])
  const aromaOptions = asOptions(AROMA_FAMILIES_BY_TYPE[wineType])
  const beginner = level === 'debutant'

  return (
    <>
      {robeOptions.length > 0 && (
        <Field label={beginner ? 'Sa couleur' : 'Robe'} optional>
          <ChipGroup options={robeOptions} value={value.robe} onChange={v => set('robe', v)} multi />
        </Field>
      )}
      {!beginner && (
        <Field label={`Intensité aromatique — ${value.aromaIntensity}/5`}>
          <Slider value={value.aromaIntensity} onChange={v => set('aromaIntensity', v)} minLabel="Discret" maxLabel="Expressif" />
        </Field>
      )}
      {aromaOptions.length > 0 && (
        <Field label={beginner ? 'Ce que tu sens' : 'Familles aromatiques'} optional>
          <ChipGroup options={aromaOptions} value={value.aromaFamilies} onChange={v => set('aromaFamilies', v)} multi />
        </Field>
      )}
      <TextField label="Autres notes" optional multiline value={value.notes} onChange={v => set('notes', v)} placeholder="Notes libres, impressions…" />
    </>
  )
}

// ─── Étape 2 — Structure (une grammaire par type) ────────────────────────────
// Chaque champ : key, label, options · hint (aide) · multi · optional · showIf(data) · beginner (gardé au niveau Débutant)

const FINISH_HINT = 'Combien de temps le goût reste en bouche après avoir avalé.'

const STRUCTURE_FIELDS = {
  rouge: [
    { key: 'taninIntensity', label: 'Tanins', options: TANNIN_INTENSITY, beginner: true, hint: 'Sensation de sécheresse / prise sur les gencives. Très marqués = bouche asséchée.' },
    { key: 'taninTexture', label: 'Texture des tanins', options: TANNIN_TEXTURE, multi: true, optional: true, showIf: d => d.taninIntensity && d.taninIntensity !== 't1' },
    { key: 'fruitMaturity', label: 'Maturité du fruit', options: FRUIT_MATURITY, optional: true },
    { key: 'body', label: 'Corps', options: BODY_3, beginner: true, hint: 'Corps ample = sensation de volume et de densité en bouche.' },
    { key: 'acidity', label: 'Acidité', options: ACIDITY_RED, optional: true },
    { key: 'finish', label: 'Longueur', options: FINISH_3, optional: true, beginner: true, hint: FINISH_HINT },
  ],
  blanc: [
    { key: 'acidity', label: 'Acidité', options: ACIDITY_5, beginner: true, hint: 'Tranchante = salivation nette, tension forte. Plate = impression molle, manque de fraîcheur.' },
    { key: 'texture', label: 'Texture / Gras', options: TEXTURE_WHITE, beginner: true, hint: "Onctueuse = richesse qui contrebalance l'acidité. Légère et sèche = vin tendu, nerveux." },
    { key: 'minerality', label: 'Minéralité', options: MINERALITY, hint: "Craie, silex, iode — impression de minéral humide ou de pierre. Marqueur d'origine fort." },
    { key: 'mineralityType', label: 'Type de minéralité', options: MINERALITY_TYPE, multi: true, optional: true, showIf: d => d.minerality && d.minerality !== 'absente' },
    { key: 'boise', label: 'Boisé', options: OAK, optional: true },
    { key: 'finish', label: 'Longueur', options: FINISH_3, optional: true, beginner: true, hint: FINISH_HINT },
  ],
  rose: [
    { key: 'vivacity', label: 'Vivacité / Fraîcheur', options: VIVACITY, beginner: true, hint: 'Vif = le vin fait saliver et rafraîchit. Plat = il paraît mou.' },
    { key: 'body', label: 'Corps', options: BODY_3, optional: true },
    { key: 'perceivedSweetness', label: 'Sucrosité perçue', options: PERCEIVED_SWEETNESS, beginner: true, hint: 'Sec = aucune impression de sucre.' },
    { key: 'lightStructure', label: 'Structure légère', options: LIGHT_STRUCTURE, optional: true },
    { key: 'finish', label: 'Longueur', options: FINISH_3, optional: true },
  ],
  petillant: [
    { key: 'bubbleQuality', label: 'Qualité des bulles', options: BUBBLE_QUALITY, beginner: true, hint: 'Très fines et persistantes = signe de qualité (méthode traditionnelle). Grossières = méthode cuve.' },
    { key: 'perceivedDosage', label: 'Dosage perçu', options: PERCEIVED_DOSAGE, beginner: true, hint: "Difficile à deviner à l'aveugle, mais l'exercice est pertinent. Brut nature = très sec, minéral." },
    { key: 'sparklingRegister', label: 'Registre aromatique', options: SPARKLING_REGISTER, optional: true },
    { key: 'vivacity', label: 'Vivacité', options: VIVACITY, optional: true },
    { key: 'body', label: 'Corps sous-jacent', options: BODY_3, optional: true },
  ],
  orange: [
    { key: 'phenolicIntensity', label: 'Texture phénolique', options: PHENOLIC_INTENSITY, beginner: true, hint: "Tanin de peau, différent d'un rouge. Grippage type peau d'orange ou thé — pas de sécheresse agressive." },
    { key: 'phenolicType', label: 'Type de texture', options: PHENOLIC_TYPE, multi: true, optional: true, showIf: d => d.phenolicIntensity && d.phenolicIntensity !== 'absente' },
    { key: 'bitterness', label: 'Amers', options: BITTERNESS, beginner: true, hint: 'Amertume en fin de bouche, comme un zeste ou une amande.' },
    { key: 'bitternessType', label: "Type d'amers", options: BITTERNESS_TYPE, multi: true, optional: true, showIf: d => d.bitterness && d.bitterness !== 'absents' },
    { key: 'oxidativeRegister', label: 'Registre oxydatif', options: OXIDATIVE_REGISTER },
    { key: 'residualAcidity', label: 'Acidité résiduelle', options: RESIDUAL_ACIDITY, optional: true },
    { key: 'finish', label: 'Longueur', options: FINISH_3, optional: true },
  ],
}

function StepStructure({ wineType, level, data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val })
  const beginner = level === 'debutant'
  const fields = STRUCTURE_FIELDS[wineType]

  // Clairet, Autre : pas de grammaire dédiée → saisie libre
  if (!fields) {
    return (
      <>
        <p className="banner">Pas de grille dédiée pour ce type de vin : décris librement ce que tu ressens en bouche.</p>
        <Field label="Corps" optional><ChipGroup options={BODY_3} value={data.body} onChange={v => set('body', v)} /></Field>
        <Field label="Longueur" optional><ChipGroup options={FINISH_3} value={data.finish} onChange={v => set('finish', v)} /></Field>
        <TextField label="Notes libres — bouche" optional multiline value={data.paletteFree} onChange={v => set('paletteFree', v)} placeholder="Texture, structure, impressions…" />
      </>
    )
  }

  return fields
    .filter(f => (!beginner || f.beginner) && (!f.showIf || f.showIf(data)))
    .map(f => (
      // Débutant : les aides sont affichées d'office
      <Field key={f.key} label={f.label} optional={f.optional} hint={f.hint} hintOpen={beginner}>
        <ChipGroup options={f.options} value={data[f.key]} onChange={v => set(f.key, v)} multi={f.multi} />
      </Field>
    ))
}

// ─── Étape 3 — Hypothèses ────────────────────────────────────────────────────

// Indices à la demande : l'invité choisit d'être aidé, et le nombre d'indices figure dans son résultat
function ClueBox({ clues, shown, onAsk }) {
  const left = clues.length - shown
  return (
    <div className="clue-box">
      {clues.slice(0, shown).map((clue, i) => (
        <p key={i} className="insight"><Lightbulb size={16} /><span>{clue.text}</span></p>
      ))}
      {left > 0 && (
        <button type="button" className="btn btn-ghost block" onClick={onAsk}>
          <Lightbulb size={18} /> {shown === 0 ? 'Demander un indice' : 'Un autre indice'} ({left} {left > 1 ? 'restants' : 'restant'})
        </button>
      )}
    </div>
  )
}

function StepHypotheses({ wineType, level, mcq, removedGrapes, value, onChange }) {
  if (level === 'debutant') return <BeginnerHypotheses wineType={wineType} mcq={mcq} removedGrapes={removedGrapes} value={value} onChange={onChange} />
  return <FullHypotheses expert={level === 'expert'} value={value} onChange={onChange} />
}

// Débutant : des choix à cocher. En dégustation à plusieurs, les propositions viennent de l'invitation
// (bonne réponse + leurres) ; en solo, ce sont les cépages et pays les plus courants.
function BeginnerHypotheses({ wineType, mcq, removedGrapes = [], value, onChange }) {
  const set = (patch) => onChange(prev => ({ ...prev, ...patch }))
  const grapeOptions = asOptions((mcq?.grape ?? commonGrapesFor(wineType)).filter(g => !removedGrapes.includes(g)))
  const placeKey = mcq?.region ? 'region' : 'country'
  const placeOptions = asOptions(mcq?.region ?? mcq?.country ?? COUNTRIES)
  const ranges = vintageRanges()
  const hasChoices = !!(mcq?.grape || mcq?.region || mcq?.country)

  return (
    <>
      {hasChoices && <p className="banner">Parmi les propositions de cépage et d'origine, une seule est la bonne. Fie-toi à ce que tu as senti.</p>}
      <Field label="Quel cépage ?" optional hint="Le cépage est la variété de raisin. C'est lui qui donne l'essentiel du goût." hintOpen>
        <ChipGroup options={grapeOptions} value={value.grapes?.[0] ?? null} onChange={v => set({ grapes: v ? [v] : [] })} />
      </Field>
      <Field label={placeKey === 'region' ? 'Quelle région ?' : 'Quel pays ?'} optional>
        <ChipGroup options={placeOptions} value={value[placeKey] || null} onChange={v => set({ [placeKey]: v ?? '' })} />
      </Field>
      <Field label="Quel âge ?" optional hint="Un vin jeune a des arômes de fruit frais. Avec l'âge viennent le sous-bois, le cuir, les fruits secs.">
        <ChipGroup
          options={ranges.map(r => ({ value: r.label, label: r.label }))}
          value={value.vintageRange?.label ?? null}
          onChange={label => set({ vintageRange: ranges.find(r => r.label === label) ?? null, vintage: '' })}
        />
      </Field>
      <Field label={`Tu es sûr de toi ? — ${value.confidence}/5`} optional>
        <Slider value={value.confidence} onChange={v => set({ confidence: v })} minLabel="Pas du tout" maxLabel="Certain" />
      </Field>
    </>
  )
}

function FullHypotheses({ expert, value, onChange }) {
  const set = (key, val) => onChange(prev => ({ ...prev, [key]: val }))
  const hasAdvanced = !!(value.appellation || value.producer || value.vintage || value.climate || value.soil)
  const [showAdvanced, setShowAdvanced] = useState(expert || hasAdvanced)

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

      {!expert && (
        <button type="button" className="collapse-btn" onClick={() => setShowAdvanced(v => !v)} aria-expanded={showAdvanced}>
          Tu veux pousser l'exercice ?
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}

      {showAdvanced && (
        <>
          <Field label="Appellation" optional>
            <AppellationInput
              value={value.appellation}
              onChange={v => set('appellation', v)}
              onPickAppellation={a => set('appellation', a.name)}
              placeholder="Ex : Pommard, Barolo…"
            />
          </Field>
          <TextField label="Millésime" optional value={value.vintage} onChange={v => onChange(prev => ({ ...prev, vintage: v.replace(/\D/g, '').slice(0, 4), vintageRange: null }))} inputMode="numeric" placeholder="Ex : 2019" />
          <TextField label="Producteur" optional value={value.producer} onChange={v => set('producer', v)} placeholder="Ex : Domaine de la Romanée-Conti…" />
          <Field label="Climat perçu" optional>
            <ChipGroup options={CLIMATE_OPTIONS} value={value.climate} onChange={v => set('climate', v)} />
          </Field>
          <Field label="Sol" optional>
            <ChipGroup options={SOIL_OPTIONS} value={value.soil} onChange={v => set('soil', v)} />
          </Field>
        </>
      )}
    </>
  )
}

// ─── Étape 4 — Style ─────────────────────────────────────────────────────────

function StepStyle({ level, value, onChange }) {
  const set = (key, val) => onChange(prev => ({ ...prev, [key]: val }))
  const beginner = level === 'debutant'
  return (
    <>
      {!beginner && (
        <Field label="Style" optional>
          <ChipGroup options={STYLE_OPTIONS} value={value.category} onChange={v => set('category', v)} />
        </Field>
      )}
      <Field label={beginner ? 'Tu as aimé ?' : 'Note'} optional>
        <RatingStars value={value.rating} onChange={v => set('rating', v)} />
      </Field>
      <Switch label="Coup de cœur" value={value.favorite} onChange={v => set('favorite', v)} />
      {!beginner && (
        <Field label="Accords" optional>
          <TagInput tags={value.pairings} onChange={v => set('pairings', v)} suggestions={PAIRING_SUGGESTIONS} placeholder="Ex : Fromages, Viandes rouges…" />
        </Field>
      )}
      <TextField label={beginner ? 'Ton impression, en une phrase' : 'Impression globale'} optional multiline value={value.overallImpression} onChange={v => set('overallImpression', v)} placeholder="En une phrase…" />
      {!beginner && (
        <TextField label="Occasion" optional value={value.context} onChange={v => set('context', v)} placeholder="Avec qui, où, à quelle occasion…" />
      )}
    </>
  )
}
