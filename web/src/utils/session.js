// Dégustation à plusieurs, sans serveur.
// L'hôte produit une invitation : la vraie bouteille y est chiffrée (AES-GCM) avec une clé dérivée
// d'un code de révélation de 4 lettres. Les invités ne peuvent la lire qu'une fois le code annoncé.
// Les propositions de choix multiples (niveau Débutant) voyagent en clair : bonne réponse + leurres.
import { generateId, normalize } from './text'
import { COUNTRIES } from '../data/wineData'
import { REGIONS } from '../data/appellations'
import { commonGrapesFor } from '../data/levels'
import { findGrape, findRegion, findCountry, climateOf, GRAPE_STYLES, CLIMATE_CLUES } from '../data/wineKnowledge'

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ' // sans I ni O, trop faciles à confondre à l'oral
const CODE_LENGTH = 4
const PBKDF2_ITERATIONS = 100000
// Champs de la bouteille transmis aux invités (les photos restent chez l'hôte)
export const NOTE_MAX_LENGTH = 280 // mot de l'hôte : court, pour garder un lien (et un QR code) raisonnable
const REALITY_FIELDS = ['type', 'cuvee', 'producer', 'vignerons', 'vintage', 'grapes', 'appellation', 'region', 'country', 'abv', 'price', 'purchasePlace']

// Le chiffrement du navigateur n'existe qu'en HTTPS (ou sur localhost)
export function isSessionSupported() {
  return !!globalThis.crypto?.subtle
}

// ─── Encodage ────────────────────────────────────────────────────────────────

function bytesToBase64Url(bytes) {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(text) {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))
  return Uint8Array.from(bin, c => c.charCodeAt(0))
}

const encodeJson = (obj) => bytesToBase64Url(new TextEncoder().encode(JSON.stringify(obj)))
const decodeJson = (text) => JSON.parse(new TextDecoder().decode(base64UrlToBytes(text)))

// ─── Chiffrement ─────────────────────────────────────────────────────────────

export function normalizeCode(code) {
  return String(code ?? '').toUpperCase().replace(/[^A-Z]/g, '')
}

function randomCode() {
  const values = crypto.getRandomValues(new Uint8Array(CODE_LENGTH))
  return Array.from(values, v => CODE_ALPHABET[v % CODE_ALPHABET.length]).join('')
}

async function deriveKey(code, salt) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(normalizeCode(code)), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

// ─── Choix multiples ─────────────────────────────────────────────────────────

function shuffle(list) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// La bonne réponse + 3 leurres, dans un ordre aléatoire.
// Les leurres "plausibles" (cépages qu'on confond, régions voisines) passent d'abord : l'hésitation
// doit être instructive. On complète au hasard dans la liste générale si besoin.
function withDecoys(answer, plausible, pool, excluded = []) {
  const taken = [answer, ...excluded].map(normalize)
  const free = (list) => list.filter(p => !taken.includes(normalize(p)))
  const first = shuffle(free(plausible ?? []))
  const rest = shuffle(free(pool).filter(p => !first.map(normalize).includes(normalize(p))))
  const decoys = [...first, ...rest].slice(0, 3)
  return decoys.length === 3 ? shuffle([answer, ...decoys]) : null
}

// Tranches de millésime : toujours les 4 mêmes, donc elles ne révèlent rien
export function vintageRanges(year = new Date().getFullYear()) {
  return [
    { label: `${year - 2} ou plus récent`, min: year - 2, max: 9999 },
    { label: `${year - 5} à ${year - 3}`, min: year - 5, max: year - 3 },
    { label: `${year - 10} à ${year - 6}`, min: year - 10, max: year - 6 },
    { label: `${year - 11} ou plus ancien`, min: 0, max: year - 11 },
  ]
}

export function buildMcq(reality) {
  const mcq = {}
  const grape = reality.grapes?.[0]
  if (grape) {
    const options = withDecoys(grape, findGrape(grape)?.confusables, commonGrapesFor(reality.type), reality.grapes)
    if (options) mcq.grape = options
  }
  if (normalize(reality.country) === 'france' && reality.region) {
    const options = withDecoys(reality.region, findRegion(reality.region)?.neighbors, REGIONS.filter(r => r !== 'Île-de-France'))
    if (options) mcq.region = options
  } else if (reality.country) {
    const options = withDecoys(reality.country, findCountry(reality.country)?.neighbors, COUNTRIES.filter(c => c !== 'Autre'))
    if (options) mcq.country = options
  }
  // Le millésime n'a pas besoin de propositions : les tranches sont toujours les 4 mêmes (vintageRanges)
  return mcq
}

// ─── Indices ─────────────────────────────────────────────────────────────────
// L'invitation ne transporte que des codes courts ; les phrases sont reconstruites chez l'invité.
//   c : climat d'origine · s : style du cépage · i : initiale de la région (ou du pays, p: 'pays')
//   x : positions de deux leurres à écarter dans les propositions de cépage
function buildClueData(reality, mcq) {
  const data = {}
  const climate = climateOf(reality)
  if (climate) data.c = climate
  const style = findGrape(reality.grapes?.[0])?.style
  if (style) data.s = style
  const french = normalize(reality.country) === 'france' && reality.region
  const place = french ? reality.region : reality.country
  if (place) { data.i = place.trim().charAt(0).toUpperCase(); if (!french) data.p = 'pays' }
  if (mcq.grape) {
    const answer = normalize(reality.grapes[0])
    data.x = shuffle(mcq.grape.map((g, index) => ({ g, index })).filter(o => normalize(o.g) !== answer)).slice(0, 2).map(o => o.index)
  }
  return data
}

// Indices proposés à un invité, du plus vague au plus précis. Le dernier dépend du niveau :
// le Débutant voit deux cépages écartés, les autres reçoivent une initiale.
export function buildClues(session, level) {
  const k = session?.k
  if (!k) return []
  const clues = []
  if (CLIMATE_CLUES[k.c]) clues.push({ text: CLIMATE_CLUES[k.c] })
  if (GRAPE_STYLES[k.s]) clues.push({ text: `C'est ${GRAPE_STYLES[k.s]}.` })
  const grapes = session.mcq?.grape
  if (level === 'debutant' && grapes && k.x?.length) {
    const removed = k.x.map(index => grapes[index]).filter(Boolean)
    clues.push({ text: `Ce n'est ni ${removed.join(' ni ')}.`, removeGrapes: removed })
  } else if (k.i) {
    clues.push({ text: `${k.p === 'pays' ? 'Le pays' : 'La région'} commence par la lettre ${k.i}.` })
  }
  return clues
}

// ─── Invitation ──────────────────────────────────────────────────────────────

// Côté hôte : renvoie { id, code, token } — `token` est la partie du lien à partager
export async function createInvitation(reality, hostName, note = '', aiProfile = '') {
  const code = randomCode()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  // Seuls les champs renseignés voyagent : un lien court donne un QR code plus facile à scanner
  const truth = Object.fromEntries(REALITY_FIELDS.map(k => [k, reality[k]]).filter(([, v]) => v && v.length !== 0))
  // Le mot de l'hôte est chiffré avec la bouteille : il n'apparaît qu'à la révélation
  if (note.trim()) truth.note = note.trim().slice(0, NOTE_MAX_LENGTH)
  if (aiProfile.trim()) truth.ai = aiProfile.trim()
  const key = await deriveKey(code, salt)
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(truth)))
  const id = generateId()
  const mcq = buildMcq(reality)
  const token = encodeJson({
    v: 1,
    id,
    host: hostName,
    mcq,
    k: buildClueData(reality, mcq),
    s: bytesToBase64Url(salt),
    i: bytesToBase64Url(iv),
    c: bytesToBase64Url(new Uint8Array(cipher)),
  })
  return { id, code, token }
}

export function invitationLink(token) {
  return `${location.origin}${location.pathname}#/join/${token}`
}

// Côté invité : lit la partie en clair de l'invitation (null si le lien est abîmé)
export function readInvitation(token) {
  try {
    const data = decodeJson(token)
    if (data?.v !== 1 || !data.id || !data.c) return null
    return data
  } catch {
    return null
  }
}

// Déchiffre la bouteille avec le code annoncé par l'hôte — renvoie null si le code est faux
export async function revealInvitation(invitation, code) {
  try {
    const key = await deriveKey(code, base64UrlToBytes(invitation.s))
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64UrlToBytes(invitation.i) }, key, base64UrlToBytes(invitation.c))
    return JSON.parse(new TextDecoder().decode(plain))
  } catch {
    return null
  }
}
