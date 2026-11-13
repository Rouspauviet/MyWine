// Base locale IndexedDB — MyWine
// Deux magasins : `records` (fiches, brouillons compris) et `photos` (images compressées).
// Aucune donnée ne quitte l'appareil.

import { openDB } from 'idb'
import { generateId, today } from '../utils/text'
import { DEFAULT_LEVEL } from '../data/levels'

const dbPromise = openDB('mywine', 1, {
  upgrade(db) {
    const records = db.createObjectStore('records', { keyPath: 'id' })
    records.createIndex('status', 'status')
    const photos = db.createObjectStore('photos', { keyPath: 'id' })
    photos.createIndex('recordId', 'recordId')
  },
})

// ─── Modèle ──────────────────────────────────────────────────────────────────

export function emptyReality() {
  return {
    type: null, cuvee: '', producer: '', vignerons: '', vintage: '',
    grapes: [], appellation: '', region: '', country: '', abv: '',
    price: '', purchasePlace: '',
  }
}

export function emptyStyle() {
  return { category: null, overallImpression: '', rating: null, favorite: false, pairings: [], context: '' }
}

// mode : 'blind' | 'memory' · status : 'draft' (dégustation en cours) | 'done' (au journal)
export function newRecord(mode) {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    mode,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    tastedAt: today(),
    level: DEFAULT_LEVEL,   // 'debutant' | 'amateur' | 'expert' — adapte le formulaire à l'aveugle
    session: null,          // dégustation à plusieurs : { role: 'host' | 'guest', id, hostName, … }
    // Mode Aveugle uniquement
    step: 0,
    wineType: null,
    perception: { robe: [], aromaIntensity: 3, aromaFamilies: [], notes: '' },
    structure: {},
    hypotheses: {
      grapes: [], confidence: 3, country: '', region: '',
      appellation: '', vintage: '', vintageRange: null, producer: '', climate: null, soil: null,
    },
    comparison: {},
    cluesUsed: 0,           // indices demandés pendant une dégustation à plusieurs
    // Commun aux deux modes
    style: emptyStyle(),
    reality: emptyReality(),
    thumb: null, // vignette (data URL) de la première photo — évite de charger les photos dans le journal
  }
}

// ─── Fiches ──────────────────────────────────────────────────────────────────

export async function getRecord(id) {
  return (await (await dbPromise).get('records', id)) ?? null
}

export async function saveRecord(record) {
  const toSave = { ...record, updatedAt: new Date().toISOString() }
  await (await dbPromise).put('records', toSave)
  return toSave
}

export async function deleteRecord(id) {
  const db = await dbPromise
  const tx = db.transaction(['records', 'photos'], 'readwrite')
  const photoKeys = await tx.objectStore('photos').index('recordId').getAllKeys(id)
  await Promise.all(photoKeys.map(k => tx.objectStore('photos').delete(k)))
  await tx.objectStore('records').delete(id)
  await tx.done
}

function byDateDesc(a, b) {
  return (b.tastedAt || '').localeCompare(a.tastedAt || '') || (b.createdAt || '').localeCompare(a.createdAt || '')
}

// Fiches du journal (les brouillons en sont exclus)
export async function listRecords() {
  const all = await (await dbPromise).getAllFromIndex('records', 'status', 'done')
  return all.sort(byDateDesc)
}

// Dégustations à l'aveugle interrompues, la plus récente d'abord
// Fiche (brouillon ou terminée) déjà rattachée à une dégustation à plusieurs
export async function findBySession(sessionId, role) {
  const all = await (await dbPromise).getAll('records')
  return all.find(r => r.session?.id === sessionId && r.session?.role === role) ?? null
}

export async function listDrafts() {
  const all = await (await dbPromise).getAllFromIndex('records', 'status', 'draft')
  return all.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
}

// ─── Photos ──────────────────────────────────────────────────────────────────
// Stockées en ArrayBuffer + type MIME (plus fiable que Blob sur Safari iOS).

export async function getPhotos(recordId) {
  const all = await (await dbPromise).getAllFromIndex('photos', 'recordId', recordId)
  return all.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export async function putPhoto(photo) {
  await (await dbPromise).put('photos', photo)
}

export async function deletePhoto(id) {
  await (await dbPromise).delete('photos', id)
}

// ─── Sauvegarde / restauration ───────────────────────────────────────────────

export async function getEverything() {
  const db = await dbPromise
  return { records: await db.getAll('records'), photos: await db.getAll('photos') }
}

// Fusion par identifiant : une fiche importée remplace la fiche locale de même id
export async function importEverything({ records = [], photos = [] }) {
  const db = await dbPromise
  const tx = db.transaction(['records', 'photos'], 'readwrite')
  await Promise.all([
    ...records.map(r => tx.objectStore('records').put(r)),
    ...photos.map(p => tx.objectStore('photos').put(p)),
  ])
  await tx.done
}

export async function clearEverything() {
  const db = await dbPromise
  const tx = db.transaction(['records', 'photos'], 'readwrite')
  await tx.objectStore('records').clear()
  await tx.objectStore('photos').clear()
  await tx.done
}
