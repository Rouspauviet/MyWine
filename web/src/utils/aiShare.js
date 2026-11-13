// Partage de l'assistant IA avec un ami, sans serveur.
// La clé d'API est chiffrée (AES-GCM) avec une clé dérivée d'un code de 8 lettres ; le lien transporte
// le texte chiffré, le code se donne de vive voix. C'est un partage de confiance : l'ami détient
// ensuite réellement la clé. Voir docs/60_Decisions/2026-11-14-partage-assistant.md
import { bytesToBase64Url, base64UrlToBytes, deriveKey, randomCode } from './session'
import { AI_MODELS, DEFAULT_AI_MODEL } from './ai'

export const SHARE_CODE_LENGTH = 8
// Plus d'itérations que pour une bouteille : ce lien protège une clé, pas une surprise
const SHARE_ITERATIONS = 600000
const SHARE_PATH = '#/assistant/'

// Chez celui qui partage : renvoie { code, token }
export async function createAssistantShare(apiKey, model) {
  const code = randomCode(SHARE_CODE_LENGTH)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(code, salt, SHARE_ITERATIONS)
  const plain = new TextEncoder().encode(JSON.stringify({ k: apiKey, m: model }))
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain)
  const token = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({
    v: 1,
    s: bytesToBase64Url(salt),
    i: bytesToBase64Url(iv),
    c: bytesToBase64Url(new Uint8Array(cipher)),
  })))
  return { code, token }
}

export function assistantShareLink(token) {
  return `${location.origin}${location.pathname}${SHARE_PATH}${token}`
}

// Retrouve le jeton dans un lien collé (ou renvoie null si ce n'en est pas un)
export function shareTokenFromLink(text) {
  const value = String(text ?? '').trim()
  const at = value.indexOf(SHARE_PATH)
  if (at < 0) return null
  const token = value.slice(at + SHARE_PATH.length).split(/[\s?&]/)[0]
  return token || null
}

function parseToken(token) {
  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(token)))
    return data?.v === 1 && data.s && data.i && data.c ? data : null
  } catch {
    return null
  }
}

export function isShareTokenValid(token) {
  return parseToken(token) !== null
}

// Chez l'ami : renvoie { apiKey, model }, ou null si le code est faux ou le lien abîmé
export async function openAssistantShare(token, code) {
  const data = parseToken(token)
  if (!data) return null
  try {
    const key = await deriveKey(code, base64UrlToBytes(data.s), SHARE_ITERATIONS)
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64UrlToBytes(data.i) }, key, base64UrlToBytes(data.c))
    const { k, m } = JSON.parse(new TextDecoder().decode(plain))
    if (!k) return null
    return { apiKey: k, model: AI_MODELS.some(option => option.value === m) ? m : DEFAULT_AI_MODEL }
  } catch {
    return null
  }
}
