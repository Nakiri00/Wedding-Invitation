import { useEffect, useMemo, useState, useRef, type ReactNode } from 'react'
import { weddingConfig } from '../data/wedding'
import { weddingAssets } from '../assets/wedding/weddingAssets'
import { FallingPetals } from './FallingPetals'
import { GateLoadingScreen } from './GateLoadingScreen';
import { useContainerAssetsReady } from '../hooks/useContainerAssetsReady';
interface InvitationGateProps {
  children: ReactNode
  guestName: string
  valid: boolean
  loading?: boolean
  error?: string
  onOpen?: () => void
  previewMode?: boolean
}

export function InvitationGate({
  children,
  guestName,
  valid,
  loading = false,
  error = '',
  onOpen,
  previewMode = false,
}: InvitationGateProps) {
  const [isOpen, setIsOpen] = useState(false)
  const coverRef = useRef<HTMLElement>(null);

  const coverAssetsReady = useContainerAssetsReady(
    coverRef,
    {
      minimumDuration: 700,
      timeoutMs: 8000,
    },
  );

  const gateReady = coverAssetsReady && !loading;

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = 'hidden'
      return
    }

    document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const openInvitation = () => {
    if (!gateReady) return;

    onOpen?.();
    setIsOpen(true);
  };

  const groomInitial = weddingConfig.couple.groom.shortName?.[0]?.toUpperCase() ?? 'K'
  const brideInitial = weddingConfig.couple.bride.shortName?.[0]?.toUpperCase() ?? 'N'

  const guestLine = useMemo(() => {
    return guestName?.trim() || 'Tamu Undangan'
  }, [guestName])

  return (
    <>
      {!gateReady && <GateLoadingScreen />}

      <section
        ref={coverRef}
        className={`invitation-cover ${
          isOpen ? 'is-open' : ''
        } ${!gateReady ? 'is-preparing' : ''}`}
        aria-hidden={isOpen}
        aria-busy={!gateReady}
      ></section>
      <section className={`invitation-cover ${isOpen ? 'is-open' : ''}`} aria-hidden={isOpen}>
        <img
          className="cover-bg"
          src={weddingAssets.environment.background}
          alt=""
          aria-hidden="true"
        />
        <div className="cover-veil" aria-hidden="true" />
        <img
          className="cover-canopy"
          src={weddingAssets.canopy.top}
          alt=""
          aria-hidden="true"
        />
        <img
          className="cover-corner cover-corner--left"
          src={weddingAssets.environment.pondCornerLeft}
          alt=""
          aria-hidden="true"
        />
        <img
          className="cover-corner cover-corner--right"
          src={weddingAssets.environment.pondCornerRight}
          alt=""
          aria-hidden="true"
        />

        <FallingPetals mode="cover" />

        <div className="gate-shell">
          <div className="gate-monogram" aria-label={`${weddingConfig.couple.groom.shortName} dan ${weddingConfig.couple.bride.shortName}`}>
            <span className="gate-monogram__letter gate-monogram__letter--groom">{groomInitial}</span>
            <span className="gate-monogram__letter gate-monogram__letter--bride">{brideInitial}</span>
            <span className="gate-monogram__spark" aria-hidden="true">✧</span>
          </div>

          <div className="gate-heading-line" aria-hidden="true" />
          <p className="gate-kicker">The Wedding Of</p>
          {previewMode && (
            <p
              role="status"
              style={{
                display: 'inline-block', margin: '8px auto 0', padding: '6px 10px',
                border: '1px solid rgba(197, 166, 109, 0.8)', borderRadius: '999px',
                background: 'rgba(248, 244, 234, 0.92)', color: '#31473b',
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
              }}
            >
              PREVIEW KLIEN · SIMULASI
            </p>
          )}

          <h1 className="gate-title">
            <span>{weddingConfig.couple.groom.shortName}</span>
            <em>&</em>
            <span>{weddingConfig.couple.bride.shortName}</span>
          </h1>

          <p className="gate-fullnames">
            <span>{weddingConfig.couple.groom.name}</span>
            <span className="gate-fullnames__ampersand">&</span>
            <span>{weddingConfig.couple.bride.name}</span>
          </p>

          <div className="gate-date" aria-label={weddingConfig.dateLabel}>
            <span>{weddingConfig.dateParts.month}</span>
            <strong>{weddingConfig.dateParts.day}</strong>
            <span>{weddingConfig.dateParts.year}</span>
          </div>

          <div className="gate-copy">
            <p className="gate-welcome">Selamat Datang</p>
            <p className="gate-guest">
              Di hari istimewa kami, <strong>{guestLine}</strong> adalah bagian dari kebahagiaan yang kami nantikan.
            </p>
          </div>

          {!loading && !valid && (
            <p className="gate-status" role="status">
              {error || 'Mode preview — RSVP aktif melalui link undangan personal.'}
            </p>
          )}

          <button className="gate-primary-btn" type="button" onClick={openInvitation} disabled={!gateReady}>
            <span>{gateReady ? 'Buka Undangan' : 'Menyiapkan Undangan'}</span>
          </button>
        </div>
      </section>

      <div className="app-shell" data-invitation-valid={valid} aria-hidden={!isOpen}>
        {children}
      </div>
    </>
  )
}
