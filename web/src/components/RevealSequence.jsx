// Révélation mise en scène — les réponses se dévoilent une à une, de la plus large à la plus précise,
// puis la bouteille elle-même. Le dégustateur avance au toucher ; "Tout révéler" saute la séquence.
// Jouée une seule fois, à la sortie de l'écran Révélation.
import { useEffect, useRef, useState } from 'react'
import { Eye, ArrowRight, Wine } from 'lucide-react'
import { Screen, Body, Footer } from './Layout'
import { matchBadge } from '../utils/comparison'
import { recordTitle, recordSubtitle } from '../utils/text'

// Du plus large au plus précis : chaque réponse resserre le champ
const ORDER = ['type', 'country', 'region', 'appellation', 'grapes', 'vintage', 'producer']

export default function RevealSequence({ record, fields, photo, onDone }) {
  const steps = ORDER
    .map(key => fields.find(f => f.key === key))
    .filter(Boolean)
    .map(f => ({ key: f.key, label: f.label, hypo: f.hypo(record) || null, real: f.real(record) || null }))
    .filter(s => s.real)
  const [shown, setShown] = useState(0)
  const lastRef = useRef(null)
  const bottleShown = shown > steps.length
  const matches = record.comparison?.matches ?? {}

  // La carte qui vient de s'ouvrir, ou la suivante à ouvrir, reste visible
  useEffect(() => { lastRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }) }, [shown])

  return (
    <Screen>
      <Body>
        <div className="hero compact">
          <h1 className="hero-title">Le moment de vérité</h1>
          <p className="hero-text">Une réponse à la fois.</p>
        </div>
        <div className="reveal-list">
          {steps.slice(0, shown + 1).map((step, i) => {
            const open = i < shown
            const badge = open && step.hypo ? matchBadge(matches[step.key]) : null
            return (
              <div key={step.key} ref={i === Math.min(shown, steps.length - 1) ? lastRef : null} className={`reveal-card ${open ? 'open' : 'closed'}`}>
                <span className="reveal-label">{step.label}</span>
                <span className="reveal-hypo">{step.hypo ? `Tu pensais : ${step.hypo}` : 'Tu n\'avais rien proposé'}</span>
                {open ? (
                  <span className="reveal-real">
                    <span>{step.real}</span>
                    {badge && <span className={`badge ${badge.color}`}>{badge.label}</span>}
                  </span>
                ) : (
                  <span className="reveal-mystery" aria-label="Pas encore révélé">?</span>
                )}
              </div>
            )
          })}
          {bottleShown && (
            <div ref={lastRef} className="reveal-card open bottle">
              {photo ? <img src={photo} alt="Étiquette de la bouteille" /> : <Wine size={32} />}
              <span className="reveal-bottle-name">{recordTitle(record)}</span>
              <span className="reveal-hypo">{recordSubtitle(record)}</span>
            </div>
          )}
        </div>
      </Body>
      <Footer className="column">
        {bottleShown ? (
          <button className="btn btn-primary btn-large block" onClick={onDone}>
            Voir ce que ça m'apprend <ArrowRight size={20} />
          </button>
        ) : (
          <>
            <button className="btn btn-primary btn-large block" onClick={() => setShown(n => n + 1)}>
              <Eye size={22} /> {shown < steps.length ? `Révéler : ${steps[shown].label.toLowerCase()}` : 'Révéler la bouteille'}
            </button>
            <button className="link-btn" onClick={onDone}>Tout révéler</button>
          </>
        )}
      </Footer>
    </Screen>
  )
}
