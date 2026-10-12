import { useEffect, useId, useRef, useState } from 'react'
import type { SakuraQrScene } from '../lib/sakuraQrRenderer'
import './styling/SakuraQrCard.css'

interface SakuraQrCardProps {
  qrDataUrl?: string | null
  guestName: string
}

function SakuraQrObject({ qrDataUrl, guestName }: { qrDataUrl: string; guestName: string }) {
  const id = useId()
  const canvas = useRef<HTMLCanvasElement>(null)
  const scene = useRef<SakuraQrScene | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback' | 'error'>('loading')
  const [angle, setAngle] = useState(0)
  const [pinned, setPinned] = useState(false)
  const [rotating, setRotating] = useState(false)

  useEffect(() => {
    let cancelled = false
    const element = canvas.current
    const image = new Image()
    const contextLost = (event: Event) => {
      event.preventDefault()
      scene.current?.dispose()
      scene.current = null
      setStatus('fallback')
    }
    element?.addEventListener('webglcontextlost', contextLost)
    image.onload = async () => {
      try {
        // Keep Three.js out of the initial invitation bundle.
        const { createSakuraQrScene } = await import('../lib/sakuraQrRenderer')
        if (cancelled || !element) return
        scene.current = createSakuraQrScene(element, image, () => setRotating(false))
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('fallback')
      }
    }
    image.onerror = () => { if (!cancelled) setStatus('error') }
    image.src = qrDataUrl
    return () => {
      cancelled = true
      image.onload = null; image.onerror = null
      element?.removeEventListener('webglcontextlost', contextLost)
      scene.current?.dispose()
      scene.current = null
    }
  }, [qrDataUrl])

  const rotate = (degrees: number, hold: boolean) => {
    if (status !== 'ready') return
    setPinned(hold)
    setAngle(degrees)
    setRotating(true)
    scene.current?.rotateTo(degrees)
  }
  const ready = status === 'ready'

  return (
    <div className="sakura-qr" data-status={status} onKeyDown={(event) => {
      if (event.key === 'Escape') rotate(0, false)
    }}>
      <span className="sakura-qr__eyebrow">{
        angle === 90 ? (pinned ? 'There it is!' : 'Almost There!') 
        : 'A Little Gift for You'}</span>
      <button
        type="button"
        className="sakura-qr__surface"
        disabled={!ready}
        aria-label={pinned && angle === 90 ? 'Putar kembali ke taman sakura, 0 derajat' : 'Putar dan tahan pada QR check-in, 90 derajat'}
        aria-describedby={`${id}-hint`}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse' && !pinned) rotate(90, false)
        }}
        onPointerLeave={() => { if (!pinned) rotate(0, false) }}
        onClick={() => rotate(pinned && angle === 90 ? 0 : 90, !(pinned && angle === 90))}
      >
        <canvas ref={canvas} className="sakura-qr__canvas" aria-hidden="true" />
        {status === 'loading' && <span className="sakura-qr__loading">Menyiapkan taman…</span>}
      </button>
      {/* Original PNG is used only for printing / unsupported WebGL, never as a rotated face. */}
      <img className="sakura-qr__original" src={qrDataUrl} alt={`QR check-in ${guestName}`} onError={() => setStatus('error')} />
      {ready && <div className="sakura-qr__controls">
        <div className="sakura-qr__presets">
          <button type="button" onClick={() => rotate(0, false)} aria-pressed={angle === 0}>0°</button>
          <output htmlFor={`${id}-angle`}>{angle}°</output>
          <button type="button" onClick={() => rotate(90, true)} aria-pressed={angle === 90}>90°</button>
        </div>
        <label className="sakura-qr__sr-only" htmlFor={`${id}-angle`}>Sudut putaran taman</label>
        <input id={`${id}-angle`} type="range" min="0" max="90" step="1" value={angle}
          aria-valuetext={`${angle} derajat${angle === 0 ? ', taman sakura' : angle === 90 ? ', QR check-in' : ''}`}
          onChange={(event) => rotate(Number(event.target.value), true)} />
      </div>}
      <span id={`${id}-hint`} className="sakura-qr__hint" aria-live="polite">
        {status === 'error' ? 'QR belum tersedia. Muat ulang undangan Anda.'
          : status === 'fallback' ? 'Tampilan 3D tidak tersedia di perangkat ini. Gunakan QR di atas.'
            : status === 'loading' ? 'Menyusun sakura dan rumput dari pola QR Anda.'
              : rotating ? 'Memutar…'
                : angle === 90 ? (pinned ? 'QR siap dipindai' : 'QR siap dipindai. Ketuk untuk menahan posisi.')
                  : pinned ? 'Geser atau ketuk untuk memutarnya ke QR.'
                    : 'Geser sudut, arahkan kursor, atau ketuk untuk memutarnya.'}
      </span>
    </div>
  )
}

export function SakuraQrCard({ qrDataUrl, guestName }: SakuraQrCardProps) {
  if (!qrDataUrl) return <div className="sakura-qr__unavailable" role="status">QR belum tersedia. Muat ulang undangan Anda.</div>
  return <SakuraQrObject key={qrDataUrl} qrDataUrl={qrDataUrl} guestName={guestName} />
}
