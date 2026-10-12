import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { InvitationGate } from './components/InvitationGate'
import { OpeningSection } from './components/OpeningSection'
import { QuoteSection } from './components/QuoteSection'
import { CoupleSection } from './components/CoupleSection'
import { EventSection } from './components/EventSection'
import { StorySection } from './components/StorySection'
import { RSVPSection } from './components/RSVPSection'
import { MessageSection } from './components/MessageSection'
import { GallerySection } from './components/GallerySection'
import { Footer } from './components/Footer'
import { ScrollProgress } from './components/ScrollProgress'
import { MusicControl } from './components/MusicControl'
import { FallingPetals } from './components/FallingPetals'
import type { MessageItem, RSVPSubmission } from './types/wedding'
import { useInvitation } from './hooks/useInvitation'
import { useCheckInStatus } from './hooks/useCheckInStatus'
import { weddingApi } from './services/api'
import { weddingConfig } from './data/wedding'
import { useScrollSpy } from './hooks/useScrollSpy'
import { useContainerAssetsReady } from './hooks/useContainerAssetsReady';
import './WeddingInvitation.css'
import { loadPreviewSession, savePreviewSession, type PreviewSession } from './lib/previewSession'

const ConsoleApp = lazy(() => import('./ConsoleApp').then((module) => ({ default: module.ConsoleApp })))

const navItems = [
  { id: 'home', symbol: '⌂', label: 'Home' },
  { id: 'couple', symbol: '♡', label: 'Mempelai' },
  { id: 'event', symbol: '◷', label: 'Acara' },
  { id: 'story', symbol: '✦', label: 'Kisah' },
  { id: 'rsvp', symbol: '✉', label: 'RSVP' },
  { id: 'messages', symbol: '“', label: 'Pesan' },
  { id: 'gallery', symbol: '▦', label: 'Galeri' },
] as const

const navSectionIds = navItems.map(({ id }) => id)

function getCurrentPath() {
  const hashPath = window.location.hash.slice(1).trim();

  // Tetap mendukung link lama #/admin.
  if (hashPath) {
    return hashPath.startsWith('/')
      ? hashPath
      : `/${hashPath}`;
  }

  const basePath = import.meta.env.BASE_URL.replace(
    /\/$/,
    '',
  );

  let pathname = window.location.pathname;

  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length);
  }

  if (!pathname) return '/';

  return pathname.startsWith('/')
    ? pathname
    : `/${pathname}`;
}

function App() {
  const path = getCurrentPath();
  if (path.startsWith('/admin')) {
    return (
      <Suspense fallback={null}>
        <ConsoleApp section="admin" />
      </Suspense>
    );
  }

  if (path.startsWith('/staff')) {
    return (
      <Suspense fallback={null}>
        <ConsoleApp section="staff" />
      </Suspense>
    );
  }

  return <WeddingInvitationApp />
}

function WeddingInvitationApp() {
  const [rsvp, setRsvp] = useState<RSVPSubmission | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [invitationOpened, setInvitationOpened] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [musicUnavailable, setMusicUnavailable] = useState(false)
  const { activeSection, activateSection } = useScrollSpy(navSectionIds, {
    enabled: invitationOpened,
  })
  const invitationToken = useMemo(
    () => new URLSearchParams(window.location.search).get('invite')?.trim() ?? '',
    [],
  )
  const previewMode = useMemo(
    () => new URLSearchParams(window.location.search).get('preview') === '1',
    [],
  )
  const [previewSession, setPreviewSession] = useState<PreviewSession | null>(
    () => previewMode && invitationToken ? loadPreviewSession(invitationToken) : null,
  )

  useEffect(() => {
    if (!previewMode || !invitationToken || !previewSession) return
    savePreviewSession(invitationToken, previewSession)
  }, [invitationToken, previewMode, previewSession])
  const sectionAssetsRef = useRef<HTMLElement>(null);

  const sectionAssetsReady = useContainerAssetsReady(
    sectionAssetsRef,
    {
      minimumDuration: 500,
      timeoutMs: 10000,
    },
  );

  const { invitation, loading: invitationLoading, error: invitationError } = useInvitation(invitationToken)
  const invitationValid = Boolean(invitation && invitation.status === 'ACTIVE')
  const invalidInvitationMessage = useMemo(() => {
    if (invitationLoading || invitationValid) {
      return null;
    }

    if (!invitationToken) {
      return 'Link undangan tidak valid. Silakan gunakan link resmi yang diberikan oleh pengantin.';
    }

    if (invitation?.status === 'REVOKED') {
      return 'Undangan ini sudah tidak aktif. Silakan hubungi pengantin untuk informasi lebih lanjut.';
    }

    if (invitationError || !invitation) {
      return 'Undangan tidak ditemukan atau nama tamu tidak terdaftar.';
    }

    return null;
  }, [
    invitation,
    invitationError,
    invitationLoading,
    invitationToken,
    invitationValid,
  ]);
  const existingRsvp = previewMode
    ? previewSession?.rsvp ?? null
    : rsvp ?? (invitation?.rsvp ? {
        name: invitation.rsvp.name,
        attendance: invitation.rsvp.attendance,
        guests: invitation.rsvp.guestCount,
        babyCount: invitation.rsvp.babyCount,
        submittedAt: invitation.rsvp.submittedAt,
        qrDataUrl: invitation.rsvp.qrDataUrl,
      } : null)
  const [messages, setMessages] = useState<MessageItem[]>([])
  const checkInStatus = useCheckInStatus(
    invitationToken,
    !previewMode && invitationValid &&
    existingRsvp?.attendance === 'attending',
  )

  const displayedMessages = useMemo(() => {
    if (!previewMode) return messages
    const localMessages = previewSession?.messages ?? []
    const localIds = new Set(localMessages.map((item) => item.id))
    return [...localMessages, ...messages.filter((item) => !localIds.has(item.id))]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [messages, previewMode, previewSession?.messages])

  useEffect(() => {
    if (!invitationValid) return
    weddingApi.getMessages(invitationToken).then(setMessages).catch(() => undefined)
  }, [invitationToken, invitationValid])

  const startInvitationMusic = () => {
    setInvitationOpened(true)

    const audio = audioRef.current
    if (!audio || musicUnavailable) return

    audio.volume = weddingConfig.music.volume
    void audio.play().catch(() => {
      // Some browsers can still reject playback; the floating control remains
      // available so the guest can explicitly start it.
      setMusicPlaying(false)
    })


  }

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio || musicUnavailable) return

    if (audio.paused) {
      audio.volume = weddingConfig.music.volume
      void audio.play().catch(() => setMusicPlaying(false))
    } else {
      audio.pause()
    }
  }

  const handleRSVP = (submission: RSVPSubmission) => {
    if (previewMode) {
      setPreviewSession((current) => ({
        rsvp: submission,
        messages: current?.messages ?? [],
        hasSubmittedMessage: current?.hasSubmittedMessage ?? false,
      }))
    } else {
      setRsvp(submission)
    }
    document.getElementById('rsvp-result')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const resetPreview = () => {
    setPreviewSession({ rsvp: null, messages: [], hasSubmittedMessage: false })
  }

  const scrollTo = (id: string) => {
    activateSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="wedding-ui">
      {invalidInvitationMessage && (
        <div
          className="invitation-status-alert"
          role="alert"
          aria-live="assertive"
        >
          <span
            className="invitation-status-alert__icon"
            aria-hidden="true"
          >
            !
          </span>

          <div>
            <strong>Undangan tidak dapat dibuka</strong>
            <p>{invalidInvitationMessage}</p>
          </div>
        </div>
      )}
      <audio
        ref={audioRef}
        src={weddingConfig.music.src}
        preload="auto"
        loop
        onPlay={() => setMusicPlaying(true)}
        onPause={() => setMusicPlaying(false)}
        onCanPlay={() => setMusicUnavailable(false)}
        onError={() => {
          setMusicPlaying(false)
          setMusicUnavailable(true)
        }}
      />

      {invitationOpened && (
        <MusicControl
          isPlaying={musicPlaying}
          unavailable={musicUnavailable}
          onToggle={toggleMusic}
        />
      )}

      <InvitationGate
        guestName={invitation?.guestName ?? 'Tamu Undangan'}
        previewMode={previewMode}
        valid={invitationValid}
        loading={invitationLoading}
        error={invitationError}
        onOpen={startInvitationMusic}
      >
        {previewMode && invitationOpened && (
          <div
            role="status"
            style={{
              position: 'fixed', top: '12px', left: '50%', transform: 'translateX(-50%)',
              zIndex: 10000, width: 'max-content', maxWidth: 'calc(100vw - 24px)',
              boxSizing: 'border-box', padding: '10px 14px',
              border: '1px solid #c5a66d', borderRadius: '999px',
              background: 'rgba(248, 244, 234, 0.97)', color: '#31473b',
              boxShadow: '0 6px 24px rgba(26, 54, 47, 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              textAlign: 'center', fontSize: '11px', fontWeight: 700,
            }}
          >
            <span>MODE PREVIEW · Data simulasi tidak disimpan ke database</span>
            <button
              type="button"
              onClick={resetPreview}
              style={{ border: '1px solid #9a875e', borderRadius: '999px', background: 'transparent', color: 'inherit', padding: '4px 8px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '10px' }}
            >
              Ulangi demo
            </button>
          </div>
        )}
        <ScrollProgress />
        <FallingPetals mode="global" />

        <nav className="floating-nav" aria-label="Navigasi undangan">
          {navItems.map(({ id, symbol, label }) => {
            const isActive = activeSection === id

            return (
              <button
                key={id}
                className={isActive ? 'is-active' : ''}
                type="button"
                onClick={() => scrollTo(id)}
                aria-label={`Buka ${label}`}
                aria-current={isActive ? 'location' : undefined}
                title={label}
              >
                <span className="floating-nav__icon" aria-hidden="true">{symbol}</span>
                <span className="floating-nav__label">{label}</span>
                <span className="floating-nav__mobile-label" aria-hidden="true">{label}</span>
              </button>
            )
          })}
        </nav>

        <main ref={sectionAssetsRef} className={`invitation-main ${ sectionAssetsReady? 'assets-ready': 'assets-loading'}`}aria-busy={!sectionAssetsReady}>
          <OpeningSection />
          <QuoteSection />
          <CoupleSection />
          <EventSection />
          <StorySection />
          <RSVPSection
            key={invitation?.guestName ?? 'unknown-guest'}
            previewMode={previewMode}
            token={invitationToken}
            validToken={invitationValid}
            quota={invitation?.quota ?? 0}
            existingRSVP={existingRsvp}
            guestName={
              invitation?.guestName ?? 'Tamu Undangan'
            }
            checkedInAt={checkInStatus.checkedInAt}
            onSubmit={handleRSVP}
          />
          <MessageSection
            token={invitationToken}
            guestName={invitation?.guestName ?? ''}
            initialMessages={displayedMessages}
            enabled={invitationValid}
            previewMode={previewMode}
            hasSubmittedInitially={previewMode ? previewSession?.hasSubmittedMessage ?? false : invitation?.hasMessage ?? false}
            onMessageCreated={(message) => {
              if (previewMode) {
                setPreviewSession((current) => ({
                  rsvp: current?.rsvp ?? null,
                  messages: [message, ...(current?.messages ?? []).filter((item) => item.id !== message.id)],
                  hasSubmittedMessage: true,
                }))
              } else {
                setMessages((current) => [message, ...current])
              }
            }}
          />
          <GallerySection />
        </main>

        <Footer />
      </InvitationGate>
    </div>
  )
}

export default App
