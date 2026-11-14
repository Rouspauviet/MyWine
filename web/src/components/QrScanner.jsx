// Lecteur de QR code — caméra arrière du téléphone, lecture image par image.
// `onRead(texte)` renvoie true si le code est accepté (la lecture s'arrête), false sinon (elle continue).
// La bibliothèque de lecture n'est chargée qu'à l'ouverture de cet écran.
import { useEffect, useRef, useState } from 'react'

const SCAN_INTERVAL = 150 // ms entre deux lectures
const SCAN_SIZE = 720     // plus grand côté de l'image analysée, en pixels

export default function QrScanner({ onRead }) {
  const videoRef = useRef(null)
  const onReadRef = useRef(onRead)
  onReadRef.current = onRead
  const [state, setState] = useState('starting') // 'starting' | 'scanning' | 'denied' | 'unavailable'

  useEffect(() => {
    let stream = null
    let timer = null
    let stopped = false
    const stop = () => {
      stopped = true
      clearTimeout(timer)
      stream?.getTracks().forEach(track => track.stop())
    }

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) return setState('unavailable')
      try {
        const [{ default: jsQR }, media] = await Promise.all([
          import('jsqr'),
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }),
        ])
        stream = media
        if (stopped) return stop()
        const video = videoRef.current
        video.srcObject = media
        await video.play()
        setState('scanning')

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d', { willReadFrequently: true })
        const scan = () => {
          if (stopped) return
          if (video.videoWidth) {
            const scale = Math.min(1, SCAN_SIZE / Math.max(video.videoWidth, video.videoHeight))
            canvas.width = Math.round(video.videoWidth * scale)
            canvas.height = Math.round(video.videoHeight * scale)
            context.drawImage(video, 0, 0, canvas.width, canvas.height)
            const image = context.getImageData(0, 0, canvas.width, canvas.height)
            const found = jsQR(image.data, image.width, image.height, { inversionAttempts: 'dontInvert' })
            if (found?.data && onReadRef.current(found.data)) return stop()
          }
          timer = setTimeout(scan, SCAN_INTERVAL)
        }
        scan()
      } catch (err) {
        if (!stopped) setState(err?.name === 'NotAllowedError' ? 'denied' : 'unavailable')
        stop()
      }
    }
    start()
    return stop
  }, [])

  if (state === 'denied') {
    return <p className="banner">L'appareil photo n'est pas autorisé pour MyWine. Autorise-le dans les réglages du téléphone, ou colle le lien ci-dessous.</p>
  }
  if (state === 'unavailable') {
    return <p className="banner">L'appareil photo n'est pas disponible ici. Colle le lien de l'invitation ci-dessous.</p>
  }
  return (
    <div className="scanner">
      {/* playsInline : sans lui, l'iPhone ouvre la vidéo en plein écran */}
      <video ref={videoRef} playsInline muted aria-label="Aperçu de l'appareil photo" />
      {state === 'starting' && <p className="scanner-wait">Ouverture de l'appareil photo…</p>}
    </div>
  )
}
