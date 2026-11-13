// Helpers texte, dates et libellés — partagés par tous les écrans

// Normalise une chaîne pour comparaison / recherche (accents, casse)
export function normalize(str) {
  if (!str) return ''
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

export function generateId() {
  // crypto.randomUUID n'existe qu'en contexte sécurisé (HTTPS) — repli pour le test en HTTP local
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12)
}

// Date du jour au format YYYY-MM-DD (heure locale)
export function today() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatDate(iso, long = false) {
  if (!iso) return ''
  // "YYYY-MM-DD" seul serait interprété en UTC : on force midi local
  const d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: long ? 'long' : 'short', year: 'numeric' })
}

export function formatPrice(price) {
  if (price === null || price === undefined || price === '') return null
  const n = Number(String(price).replace(',', '.'))
  if (isNaN(n)) return null
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: n % 1 ? 2 : 0 })
}

// Libellé d'une valeur dans une liste d'options [{ value, label }]
export function labelOf(options, value) {
  if (value === null || value === undefined || value === '') return null
  return options.find(o => o.value === value)?.label ?? value
}

export function labelsOf(options, values) {
  if (!values?.length) return null
  return values.map(v => labelOf(options, v)).join(', ')
}

export function recordTitle(record) {
  const r = record.reality || {}
  return r.cuvee || r.producer || r.appellation || 'Vin inconnu'
}

export function recordSubtitle(record) {
  const r = record.reality || {}
  const first = r.cuvee && r.producer ? r.producer : (r.appellation || r.region)
  const parts = [first, r.cuvee && r.producer ? r.appellation : null, r.vintage].filter(Boolean)
  return parts.join(' · ') || 'Informations non renseignées'
}

// Une réalité est "renseignée" dès qu'un champ a une valeur
export function hasReality(reality) {
  return Object.values(reality || {}).some(v =>
    v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
  )
}
