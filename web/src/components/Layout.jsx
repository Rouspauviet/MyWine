// Briques de mise en page communes à tous les écrans
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'

export function Screen({ children, className = '' }) {
  return <div className={`screen ${className}`}>{children}</div>
}

export function Header({ title, label, onBack, actions, progress }) {
  return (
    <header className="header">
      <div className="header-row">
        {onBack && (
          <button className="icon-btn soft" onClick={onBack} aria-label="Retour">
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="header-text">
          {label && <div className="header-label">{label}</div>}
          <h1 className="header-title">{title}</h1>
        </div>
        {actions && <div className="header-actions">{actions}</div>}
      </div>
      {progress !== undefined && (
        <div className="progress"><div className="progress-fill" style={{ width: `${progress * 100}%` }} /></div>
      )}
    </header>
  )
}

export function Body({ children, className = '', innerRef }) {
  return <main ref={innerRef} className={`body ${className}`}>{children}</main>
}

export function Footer({ children, className = '' }) {
  return <footer className={`footer ${className}`}>{children}</footer>
}

export function Card({ title, children, tight }) {
  return (
    <section className="card">
      {title && <h2 className="card-title">{title}</h2>}
      <div className={`card-body ${tight ? 'tight' : ''}`}>{children}</div>
    </section>
  )
}

// Ligne libellé / valeur — masquée si la valeur est vide
export function InfoRow({ label, value, children }) {
  if (!children && (value === null || value === undefined || value === '')) return null
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{children ?? value}</span>
    </div>
  )
}

export function ConfirmModal({ open, title, text, confirmLabel = 'Confirmer', danger, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        {text && <p className="modal-text">{text}</p>}
        <div className="modal-actions">
          <button className="btn btn-ghost grow" onClick={onCancel}>Annuler</button>
          <button className={`btn grow ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export function Loading() {
  return <Screen><div className="loading">Chargement…</div></Screen>
}

// Charge une donnée asynchrone (IndexedDB) — data vaut undefined tant que ce n'est pas chargé
export function useAsync(loader, deps) {
  const [state, setState] = useState({ data: undefined, error: null })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let cancelled = false
    loader()
      .then(data => { if (!cancelled) setState({ data, error: null }) })
      .catch(error => { if (!cancelled) setState({ data: null, error }) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])
  return { ...state, reload: () => setTick(t => t + 1) }
}
