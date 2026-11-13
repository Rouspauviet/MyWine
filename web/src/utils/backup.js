// Sauvegarde complète (fiches + photos) dans un seul fichier JSON, et restauration
import * as db from '../db/db'
import { today } from './text'

const LAST_EXPORT_KEY = 'mywine.lastExport'

function bufferToDataUrl(buffer, type) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(new Blob([buffer], { type }))
  })
}

async function dataUrlToBuffer(dataUrl) {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

export async function buildExportFile() {
  const { records, photos } = await db.getEverything()
  const payload = {
    app: 'mywine',
    version: 3,
    exportedAt: new Date().toISOString(),
    records,
    photos: await Promise.all(photos.map(async p => ({
      id: p.id, recordId: p.recordId, order: p.order ?? 0, type: p.type,
      dataUrl: await bufferToDataUrl(p.data, p.type),
    }))),
  }
  return new File([JSON.stringify(payload)], `mywine-sauvegarde-${today()}.json`, { type: 'application/json' })
}

// Sur iPhone, la feuille de partage permet "Enregistrer dans Fichiers" ; ailleurs, téléchargement classique
export async function exportAll() {
  const file = await buildExportFile()
  let shared = false
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Sauvegarde MyWine' })
      shared = true
    } catch (err) {
      if (err.name === 'AbortError') return false // annulé par l'utilisateur
    }
  }
  if (!shared) {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }
  localStorage.setItem(LAST_EXPORT_KEY, new Date().toISOString())
  return true
}

export async function importFile(file) {
  let payload
  try {
    payload = JSON.parse(await file.text())
  } catch {
    throw new Error('Ce fichier n\'est pas un JSON valide.')
  }
  if (payload?.app !== 'mywine' || !Array.isArray(payload.records)) {
    throw new Error('Ce fichier n\'est pas une sauvegarde MyWine.')
  }
  const photos = await Promise.all((payload.photos ?? []).map(async p => ({
    id: p.id, recordId: p.recordId, order: p.order ?? 0, type: p.type,
    data: await dataUrlToBuffer(p.dataUrl),
  })))
  await db.importEverything({ records: payload.records, photos })
  return { records: payload.records.length, photos: photos.length }
}

export function lastExportDate() {
  try { return localStorage.getItem(LAST_EXPORT_KEY) } catch { return null }
}

// Nombre de jours depuis la dernière sauvegarde (null si jamais)
export function daysSinceExport() {
  const last = lastExportDate()
  if (!last) return null
  return Math.floor((Date.now() - new Date(last).getTime()) / 86400000)
}
