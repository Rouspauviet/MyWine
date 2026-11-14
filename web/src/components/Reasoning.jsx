// Guidage de l'écran Hypothèses à partir des notes du joueur (utils/reasoning.js).
// Débutant : trois marches — climat, style, cépage. Amateur : une aide à ouvrir si on bloque.
// Anti-révélation : tout part de ce que le joueur a noté, jamais de la vraie bouteille.
import { useState } from 'react'
import { Lightbulb, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Field, ChipGroup } from './Inputs'
import { CLIMATE_OPTIONS } from '../data/wineData'
import { STYLE_LABELS, findGrape } from '../data/wineKnowledge'
import { listInWords } from '../utils/reasoning'
import FlavorMap from './FlavorMap'

const SOLO_CHOICES = 4 // en solo, nombre de cépages proposés d'abord (les plus compatibles avec les notes)

function Insight({ children }) {
  return <p className="insight"><Lightbulb size={16} /><span>{children}</span></p>
}

// Une proposition de cépage : son style, et en quoi elle colle ou non avec les notes du joueur
function GrapeChoice({ name, fit, selected, onPick }) {
  const grape = findGrape(name)
  return (
    <button type="button" role="radio" aria-checked={selected} className={`level-card ${selected ? 'active' : ''}`} onClick={onPick}>
      <span className="level-label">{name}</span>
      {grape && <span className="level-desc">{STYLE_LABELS[grape.style]} · {grape.aromas.slice(0, 2).join(', ').toLowerCase()}</span>}
      {fit?.fits.length > 0 && <span className="level-desc fit"><Check size={14} /> Colle avec tes notes : {fit.fits.join(', ')}</span>}
      {fit?.gaps.length > 0 && <span className="level-desc">S'en écarte : {fit.gaps.join(', ')}</span>}
    </button>
  )
}

// Débutant — `grapeOptions` : propositions de l'invitation (à plusieurs), sinon null (solo)
export function GuidedGrape({ reasoning, grapeOptions, fallbackGrapes, value, onChange }) {
  const set = (patch) => onChange(prev => ({ ...prev, ...patch }))
  const [showAll, setShowAll] = useState(false)
  const { noted, climate, styles, candidates, color } = reasoning
  const styleOptions = Object.entries(STYLE_LABELS).filter(([key]) => key.startsWith(color)).map(([key, label]) => ({ value: key, label }))
  const picked = value.grapes?.[0] ?? null

  // À plusieurs : les propositions de l'hôte. En solo : les cépages les plus compatibles, puis tous.
  const solo = !grapeOptions
  const suggested = candidates.slice(0, SOLO_CHOICES).map(c => c.grape.name)
  const names = !solo ? grapeOptions
    : showAll || !suggested.length ? [...new Set([...suggested, ...fallbackGrapes])]
    : [...new Set([...suggested, ...(picked ? [picked] : [])])]

  return (
    <>
      {noted.length > 0
        ? <p className="banner">Tu as noté {listInWords(noted)}. On part de là, en trois questions.</p>
        : <p className="banner">Tu n'as pas encore noté grand-chose aux étapes précédentes : reviens-y si tu veux que l'app t'aide à raisonner.</p>}

      <Field label="1 · Un climat frais ou chaud ?" optional hintOpen
        hint="Au frais, le raisin mûrit lentement : le vin est léger et fait saliver. Au soleil, il est plus ample, plus rond, plus chaleureux.">
        {climate && <Insight>Tes notes penchent vers un climat {climate.label} ({listInWords(climate.reasons)}).</Insight>}
        <ChipGroup options={CLIMATE_OPTIONS} value={value.climate} onChange={v => set({ climate: v })} />
      </Field>

      <Field label="2 · Quel style de vin ?" optional hintOpen hint="Oublie les noms : comment décrirais-tu ce vin à un ami ?">
        {styles.length > 0 && <Insight>Tes notes font penser à un vin {listInWords(styles.map(s => STYLE_LABELS[s].toLowerCase()))}.</Insight>}
        <ChipGroup options={styleOptions} value={value.styleGuess ?? null} onChange={v => set({ styleGuess: v })} />
      </Field>

      <Field label="3 · Quel cépage ?" optional hintOpen
        hint={solo
          ? 'Le cépage est la variété de raisin. Voici ceux qui collent le mieux avec ce que tu as noté.'
          : 'Le cépage est la variété de raisin. Une seule proposition est la bonne : regarde laquelle colle le mieux avec ce que tu as noté.'}>
        {reasoning.point && (
          <>
            <Insight>Voici où tes notes te placent. Les cépages proches de toi sont de bonnes pistes.</Insight>
            <FlavorMap color={color} you={reasoning.point} near={names} />
          </>
        )}
        <div className="level-list" role="radiogroup" aria-label="Cépage">
          {names.map(name => (
            <GrapeChoice
              key={name}
              name={name}
              fit={reasoning.fitOf(name)}
              selected={picked === name}
              onPick={() => set({ grapes: picked === name ? [] : [name] })}
            />
          ))}
        </div>
        {solo && !showAll && suggested.length > 0 && (
          <button type="button" className="link-btn" onClick={() => setShowAll(true)}>Voir d'autres cépages</button>
        )}
      </Field>
    </>
  )
}

// Amateur — une aide repliée : ce que tu as noté, où ça mène. L'ouvrir figure dans le résultat.
export function ReasoningHelp({ reasoning, onUse }) {
  const [open, setOpen] = useState(false)
  if (!reasoning.available) return null
  const toggle = () => { if (!open) onUse?.(); setOpen(v => !v) }
  const top = reasoning.candidates.slice(0, 3)

  return (
    <>
      <button type="button" className="collapse-btn" onClick={toggle} aria-expanded={open}>
        Aide-moi à raisonner
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="clue-box">
          {!reasoning.enough ? (
            <Insight>Remplis d'abord Perception et Structure : l'aide part de ce que tu as noté.</Insight>
          ) : (
            <>
              <Insight>Tu as noté {listInWords(reasoning.noted)}.</Insight>
              {reasoning.climate && <Insight>Côté origine, ça penche vers un climat {reasoning.climate.label}.</Insight>}
              {reasoning.point && <FlavorMap color={reasoning.color} you={reasoning.point} near={top.map(c => c.grape.name)} />}
              {top.map(({ grape, fits, gaps }) => (
                <Insight key={grape.name}>
                  <strong>{grape.name}</strong> — {fits.length ? `colle avec tes notes (${fits.join(', ')})` : 'profil proche de tes notes'}
                  {gaps.length > 0 && `, s'en écarte (${gaps.join(', ')})`}.
                </Insight>
              ))}
              <p className="muted left">Ce sont des pistes typiques, pas la réponse : un vin peut s'écarter du profil de son cépage.</p>
            </>
          )}
        </div>
      )}
    </>
  )
}
