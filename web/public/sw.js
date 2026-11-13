// Service worker MyWine — met l'application en cache pour un usage hors ligne.
// Les données utilisateur (IndexedDB) ne passent jamais par ici.
const CACHE = 'mywine-app-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    await self.clients.claim()
  })())
})

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'precache') return
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    await Promise.all(event.data.urls.map(url => cache.add(url).catch(() => {})))
  })())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Fichiers à nom haché (immuables) : cache d'abord
  if (url.pathname.includes('/assets/')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE)
      const cached = await cache.match(request)
      if (cached) return cached
      const response = await fetch(request)
      if (response.ok) cache.put(request, response.clone())
      return response
    })())
    return
  }

  // Page et fichiers racine : réseau d'abord (mises à jour immédiates), cache en secours hors ligne
  event.respondWith((async () => {
    const cache = await caches.open(CACHE)
    try {
      const response = await fetch(request)
      if (response.ok) cache.put(request, response.clone())
      return response
    } catch {
      const cached = await cache.match(request, { ignoreSearch: true })
      if (cached) return cached
      return Response.error()
    }
  })())
})
