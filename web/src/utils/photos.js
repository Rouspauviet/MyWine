// Photos d'étiquettes — compression, vignettes et brouillon de photos pour les formulaires
import { useEffect, useRef, useState } from 'react'
import * as db from '../db/db'
import { generateId } from './text'

function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image illisible')) }
    img.src = url
  })
}

function drawScaled(img, maxSize) {
  const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas
}

// Réduit une photo à 1600 px max (JPEG) : ~300 Ko au lieu de plusieurs Mo
export async function compressImage(file, maxSize = 1600, quality = 0.82) {
  const img = await loadImage(file)
  const canvas = drawScaled(img, maxSize)
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob) throw new Error('Compression impossible')
  return blob
}

// Vignette carrée-ish en data URL, stockée directement sur la fiche
export async function makeThumb(blob, maxSize = 240) {
  const img = await loadImage(blob)
  return drawScaled(img, maxSize).toDataURL('image/jpeg', 0.7)
}

// Brouillon de photos d'un formulaire : rien n'est écrit en base avant commit()
// photos : [{ id, blob, url, isNew }]
export function usePhotoDraft(recordId) {
  const [photos, setPhotos] = useState([])
  const [busy, setBusy] = useState(false)
  const removed = useRef([])
  const urls = useRef([])

  const track = (blob) => {
    const url = URL.createObjectURL(blob)
    urls.current.push(url)
    return url
  }

  useEffect(() => {
    let cancelled = false
    removed.current = []
    if (!recordId) { setPhotos([]); return }
    db.getPhotos(recordId).then(rows => {
      if (cancelled) return
      setPhotos(rows.map(p => {
        const blob = new Blob([p.data], { type: p.type })
        return { id: p.id, blob, url: track(blob), isNew: false }
      }))
    })
    return () => { cancelled = true }
  }, [recordId])

  // Libère les URLs objet à la fermeture de l'écran
  useEffect(() => () => { urls.current.forEach(u => URL.revokeObjectURL(u)) }, [])

  const add = async (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    setBusy(true)
    try {
      const added = []
      for (const file of files) {
        const blob = await compressImage(file)
        added.push({ id: generateId(), blob, url: track(blob), isNew: true })
      }
      setPhotos(p => [...p, ...added])
    } finally {
      setBusy(false)
    }
  }

  const remove = (id) => {
    setPhotos(p => {
      const photo = p.find(x => x.id === id)
      if (photo && !photo.isNew) removed.current.push(id)
      return p.filter(x => x.id !== id)
    })
  }

  // Écrit les changements en base et renvoie la vignette à stocker sur la fiche
  const commit = async (targetRecordId) => {
    for (const id of removed.current) await db.deletePhoto(id)
    removed.current = []
    for (let i = 0; i < photos.length; i++) {
      const p = photos[i]
      await db.putPhoto({
        id: p.id,
        recordId: targetRecordId,
        order: i,
        type: p.blob.type || 'image/jpeg',
        data: await p.blob.arrayBuffer(),
      })
    }
    return photos.length ? await makeThumb(photos[0].blob) : null
  }

  return { photos, busy, add, remove, commit }
}

// Photos d'une fiche en lecture seule (URLs objet)
export function usePhotoUrls(recordId) {
  const [urls, setUrls] = useState([])
  useEffect(() => {
    if (!recordId) return
    let created = []
    let cancelled = false
    db.getPhotos(recordId).then(rows => {
      if (cancelled) return
      created = rows.map(p => URL.createObjectURL(new Blob([p.data], { type: p.type })))
      setUrls(created)
    })
    return () => { cancelled = true; created.forEach(u => URL.revokeObjectURL(u)) }
  }, [recordId])
  return urls
}
