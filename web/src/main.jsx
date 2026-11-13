import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/tokens.css'
import './styles/app.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Service worker : rend l'app utilisable hors ligne (uniquement en production et en HTTPS)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('./sw.js')
      const registration = await navigator.serviceWorker.ready
      // On transmet la liste des fichiers déjà chargés pour qu'ils soient mis en cache dès la première visite
      const urls = [
        location.href.split('#')[0],
        ...performance.getEntriesByType('resource').map(e => e.name).filter(u => u.startsWith(location.origin)),
      ]
      registration.active?.postMessage({ type: 'precache', urls })
    } catch (err) {
      console.warn('Service worker non installé :', err)
    }
  })
}
