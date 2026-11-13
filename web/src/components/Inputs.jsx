// Contrôles de saisie — Field, TextField, ChipGroup, TagInput, SuggestInput, Slider, RatingStars, Switch
import { useEffect, useRef, useState } from 'react'
import { HelpCircle, Star, X } from 'lucide-react'
import { normalize } from '../utils/text'

export const RATING_LABELS = ['', 'Bof', 'Bien', 'Très bien', 'Excellent', 'Parfait']

// Champ avec libellé — `hint` ajoute une aide affichée à la demande
// `hintOpen` l'affiche d'office (niveau Débutant)
export function Field({ label, optional, hint, hintOpen = false, children }) {
  const [showHint, setShowHint] = useState(hintOpen)
  return (
    <div className="field">
      <div className="field-header">
        <span className="field-label">
          {label}
          {optional && <span className="field-optional"> • optionnel</span>}
        </span>
        {hint && (
          <button
            type="button"
            className={`hint-btn ${showHint ? 'active' : ''}`}
            onClick={() => setShowHint(v => !v)}
            aria-label={`Aide : ${label}`}
          >
            <HelpCircle size={18} />
          </button>
        )}
      </div>
      {hint && showHint && <p className="field-hint">{hint}</p>}
      {children}
    </div>
  )
}

export function TextField({ label, optional, value, onChange, multiline, ...rest }) {
  return (
    <Field label={label} optional={optional}>
      {multiline ? (
        <textarea className="textarea" value={value ?? ''} onChange={e => onChange(e.target.value)} rows={3} {...rest} />
      ) : (
        <input className="input" value={value ?? ''} onChange={e => onChange(e.target.value)} autoCorrect="off" autoComplete="off" {...rest} />
      )}
    </Field>
  )
}

// Sélection par chips — value : valeur seule, ou tableau si `multi`
export function ChipGroup({ options = [], value, onChange, multi = false, scroll = false, dots = false }) {
  const isSelected = (v) => (multi ? Array.isArray(value) && value.includes(v) : value === v)

  const toggle = (v) => {
    if (multi) {
      const current = Array.isArray(value) ? value : []
      onChange(current.includes(v) ? current.filter(x => x !== v) : [...current, v])
    } else {
      onChange(value === v ? null : v)
    }
  }

  return (
    <div className={`chips ${scroll ? 'scroll' : ''}`}>
      {options.map(opt => (
        <button
          type="button"
          key={opt.value}
          className={`chip ${isSelected(opt.value) ? 'active' : ''}`}
          aria-pressed={isSelected(opt.value)}
          onClick={() => toggle(opt.value)}
        >
          {dots && <span className={`dot ${opt.value}`} />}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// Champ texte avec suggestions cliquables sous le champ
// Sur iPhone, toucher une suggestion fait d'abord perdre le focus au champ : si la liste disparaissait
// aussitôt, le toucher tomberait dans le vide. On laisse donc la liste affichée un court instant après
// la perte de focus. `onLeave` est appelé quand le champ est réellement quitté (sans choix de suggestion).
const BLUR_DELAY_MS = 250

export function SuggestInput({ value, onChange, getSuggestions, onPick, onLeave, renderSuggestion, ...rest }) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)
  const blurTimer = useRef(null)
  const onLeaveRef = useRef(onLeave)
  onLeaveRef.current = onLeave

  useEffect(() => () => clearTimeout(blurTimer.current), [])

  const handleFocus = () => {
    clearTimeout(blurTimer.current)
    setOpen(true)
  }

  const handleBlur = () => {
    clearTimeout(blurTimer.current)
    blurTimer.current = setTimeout(() => {
      setOpen(false)
      onLeaveRef.current?.()
    }, BLUR_DELAY_MS)
  }

  const pick = (suggestion) => {
    clearTimeout(blurTimer.current)
    onPick(suggestion)
    setOpen(document.activeElement === inputRef.current)
  }

  const suggestions = open ? getSuggestions(value ?? '') : []

  return (
    <div className="suggest">
      <input
        ref={inputRef}
        className="input"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoCorrect="off"
        autoComplete="off"
        {...rest}
      />
      {suggestions.length > 0 && (
        <div className="suggest-list">
          {suggestions.map((s, i) => (
            <button
              type="button"
              key={i}
              className="suggest-item"
              // Sur ordinateur, empêche le champ de perdre le focus au clic
              onMouseDown={e => e.preventDefault()}
              onClick={() => pick(s)}
            >
              {renderSuggestion ? renderSuggestion(s) : s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Liste d'étiquettes libres avec autocomplétion (cépages, accords…)
export function TagInput({ tags = [], onChange, suggestions = [], placeholder }) {
  const [text, setText] = useState('')

  const addTag = (raw) => {
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean)
    if (!parts.length) return
    const existing = tags.map(normalize)
    const next = [...tags]
    for (const p of parts) {
      if (!existing.includes(normalize(p))) { next.push(p); existing.push(normalize(p)) }
    }
    onChange(next)
    setText('')
  }

  const getSuggestions = (q) => {
    const n = normalize(q)
    if (!n) return []
    const taken = tags.map(normalize)
    return suggestions
      .filter(s => normalize(s).includes(n) && !taken.includes(normalize(s)))
      .sort((a, b) => normalize(a).indexOf(n) - normalize(b).indexOf(n))
      .slice(0, 6)
  }

  return (
    <div className="field">
      {tags.length > 0 && (
        <div className="chips">
          {tags.map(tag => (
            <span key={tag} className="chip tag">
              {tag}
              <button type="button" className="chip-remove" aria-label={`Retirer ${tag}`} onClick={() => onChange(tags.filter(t => t !== tag))}>
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
      <SuggestInput
        value={text}
        onChange={v => (v.endsWith(',') ? addTag(v) : setText(v))}
        getSuggestions={getSuggestions}
        onPick={addTag}
        placeholder={placeholder}
        enterKeyHint="done"
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(text) } }}
        // Sur mobile on quitte souvent le champ sans valider : le texte en cours devient une étiquette
        onLeave={() => addTag(text)}
      />
    </div>
  )
}

export function Slider({ value, onChange, min = 1, max = 5, minLabel, maxLabel }) {
  return (
    <div>
      <input
        type="range"
        className="slider"
        min={min} max={max} step={1}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      <div className="slider-labels"><span>{minLabel}</span><span>{maxLabel}</span></div>
    </div>
  )
}

export function RatingStars({ value, onChange }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          type="button"
          key={n}
          className={`star ${value >= n ? 'on' : ''}`}
          aria-label={`${n} sur 5`}
          onClick={() => onChange(value === n ? null : n)}
        >
          <Star size={28} fill={value >= n ? 'currentColor' : 'none'} />
        </button>
      ))}
      {value ? <span className="stars-label">{RATING_LABELS[value]}</span> : null}
    </div>
  )
}

export function Switch({ label, value, onChange }) {
  return (
    <button type="button" className="switch-row" role="switch" aria-checked={!!value} onClick={() => onChange(!value)}>
      <span>{label}</span>
      <span className={`switch ${value ? 'on' : ''}`} />
    </button>
  )
}
