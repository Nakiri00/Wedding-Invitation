import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { TouchEvent, WheelEvent } from 'react'
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
import { MusicControl } from './components/MusicControl'
import { FallingPetals } from './components/FallingPetals'
import type { MessageItem, RSVPSubmission } from './types/wedding'
import { useInvitation } from './hooks/useInvitation'
import { useCheckInStatus } from './hooks/useCheckInStatus'
import { weddingApi } from './services/api'
import { weddingConfig } from './data/wedding'
import { useContainerAssetsReady } from './hooks/useContainerAssetsReady';
import './WeddingInvitation.css'
import './book-pages.css'
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

const bookPageIds = ['home', 'quote', 'couple', 'event', 'story', 'rsvp', 'messages', 'gallery', 'closing'] as const
const bookPageLabels = ['Pembuka', 'Kutipan', 'Mempelai', 'Acara', 'Kisah', 'RSVP', 'Pesan & Kesan', 'Galeri', 'Penutup']

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
  const [activePageIndex, setActivePageIndex] = useState(0)
  const [bookNavOpen, setBookNavOpen] = useState(false)
  const [turnState, setTurnState] = useState<{ from: number; to: number; direction: 'next' | 'previous' } | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const turnTimeoutRef = useRef<number | null>(null)

  const goToPage = useCallback((requestedIndex: number) => {
    const nextIndex = Math.max(0, Math.min(bookPageIds.length - 1, requestedIndex))
    if (nextIndex === activePageIndex) return

    setTurnState({
      from: activePageIndex,
      to: nextIndex,
      direction: nextIndex > activePageIndex ? 'next' : 'previous',
    })
    setActivePageIndex(nextIndex)

    if (turnTimeoutRef.current !== null) window.clearTimeout(turnTimeoutRef.current)
    turnTimeoutRef.current = window.setTimeout(() => {
      setTurnState(null)
      turnTimeoutRef.current = null
    }, 720)
  }, [activePageIndex])

  useEffect(() => () => {
    if (turnTimeoutRef.current !== null) window.clearTimeout(turnTimeoutRef.current)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!invitationOpened) return
      const target = event.target
      if (target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable="true"]')) return

      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault()
        goToPage(activePageIndex + 1)
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault()
        goToPage(activePageIndex - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activePageIndex, goToPage, invitationOpened])
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
    const pageIndex = bookPageIds.indexOf(id as (typeof bookPageIds)[number])
    if (pageIndex >= 0) goToPage(pageIndex)
  }

  const getBookPageClass = (index: number) => {
    const turnClass = turnState?.from === index
      ? `is-leaving-${turnState.direction}`
      : turnState?.to === index
        ? `is-entering-${turnState.direction}`
        : ''
    return `book-page ${activePageIndex === index ? 'is-active' : ''} ${turnClass}`.trim()
  }

  const startTouchGesture = (event: TouchEvent<HTMLDivElement>) => {
    const target = event.target
    if (target instanceof Element && target.closest('input, textarea, select, button, a, [data-no-page-swipe]')) {
      touchStartRef.current = null
      return
    }
    const touch = event.touches[0]
    if (touch) touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const finishTouchGesture = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    const touch = event.changedTouches[0]
    if (!start || !touch) return

    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y
    if (Math.abs(deltaX) < 64 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return

    // Sesuai permintaan: swipe kanan membuka halaman selanjutnya, swipe kiri kembali.
    goToPage(activePageIndex + (deltaX > 0 ? 1 : -1))
  }

  const handlePageWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaX) < 42 || Math.abs(event.deltaX) < Math.abs(event.deltaY) * 1.2) return
    event.preventDefault()
    goToPage(activePageIndex + (event.deltaX > 0 ? 1 : -1))
  }

  return (
    <div className="wedding-ui book-mode">
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
        <div className="book-progress" aria-hidden="true">
          <span style={{ width: `${((activePageIndex + 1) / bookPageIds.length) * 100}%` }} />
        </div>
        <FallingPetals mode="global" />
        <main ref={sectionAssetsRef} className={`invitation-main book-mode ${sectionAssetsReady ? 'assets-ready' : 'assets-loading'}`} aria-busy={!sectionAssetsReady}>
          <div
            className="book-page-stack"
            onTouchStart={startTouchGesture}
            onTouchEnd={finishTouchGesture}
            onWheel={handlePageWheel}
            onPointerDown={(event) => {
              if (event.pointerType === 'touch' || event.button !== 0) return
              const target = event.target
              if (target instanceof Element && target.closest('input, textarea, select, button, a, [data-no-page-swipe]')) return
              pointerStartRef.current = { x: event.clientX, y: event.clientY }
            }}
            onPointerUp={(event) => {
              if (event.pointerType === 'touch') return
              const start = pointerStartRef.current
              pointerStartRef.current = null
              if (!start) return
              const deltaX = event.clientX - start.x
              const deltaY = event.clientY - start.y
              if (Math.abs(deltaX) < 84 || Math.abs(deltaX) < Math.abs(deltaY) * 1.35) return
              goToPage(activePageIndex + (deltaX > 0 ? 1 : -1))
            }}
            onPointerCancel={() => { pointerStartRef.current = null }}
          >
          <div className={getBookPageClass(0)} data-book-page="home" aria-hidden={activePageIndex !== 0}><OpeningSection /></div>
          <div className={getBookPageClass(1)} data-book-page="quote" aria-hidden={activePageIndex !== 1}><QuoteSection /></div>
          <div className={getBookPageClass(2)} data-book-page="couple" aria-hidden={activePageIndex !== 2}><CoupleSection /></div>
          <div className={getBookPageClass(3)} data-book-page="event" aria-hidden={activePageIndex !== 3}><EventSection /></div>
          <div className={getBookPageClass(4)} data-book-page="story" aria-hidden={activePageIndex !== 4}><StorySection /></div>
          <div className={getBookPageClass(5)} data-book-page="rsvp" aria-hidden={activePageIndex !== 5}>
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
          </div>
          <div className={getBookPageClass(6)} data-book-page="messages" aria-hidden={activePageIndex !== 6}>
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
          </div>
          <div className={getBookPageClass(7)} data-book-page="gallery" aria-hidden={activePageIndex !== 7}>
          <GallerySection />
          </div>
          <div className={getBookPageClass(8)} data-book-page="closing" aria-hidden={activePageIndex !== 8}>
            <Footer />
          </div>
          </div>
        </main>

        <div className="book-page-controls" aria-label="Navigasi halaman undangan">
          <button
            type="button"
            onClick={() => goToPage(activePageIndex - 1)}
            disabled={activePageIndex === 0}
            aria-label="Halaman sebelumnya"
            title="Halaman sebelumnya (←)"
          >
            ‹
          </button>
          <div className="book-page-status" aria-live="polite" aria-atomic="true">
            <span>HALAMAN {String(activePageIndex + 1).padStart(2, '0')} / {String(bookPageIds.length).padStart(2, '0')}</span>
            <strong>{bookPageLabels[activePageIndex]}</strong>
          </div>
          <button
            type="button"
            onClick={() => goToPage(activePageIndex + 1)}
            disabled={activePageIndex === bookPageIds.length - 1}
            aria-label="Halaman selanjutnya"
            title="Halaman selanjutnya (→)"
          >
            ›
          </button>
        </div>
        <div className={`book-nav-dock ${bookNavOpen ? 'is-open' : ''}`} onKeyDown={(event) => { if (event.key === 'Escape') setBookNavOpen(false) }}>
          <button
            className="book-nav-toggle"
            type="button"
            onClick={() => setBookNavOpen((open) => !open)}
            aria-controls="book-side-navigation"
            aria-expanded={bookNavOpen}
            aria-label={bookNavOpen ? 'Tutup navigasi' : 'Buka navigasi'}
            title={bookNavOpen ? 'Tutup navigasi' : 'Buka navigasi'}
          >
            <span aria-hidden="true">{bookNavOpen ? '>' : '<'}</span>
          </button>
          <nav id="book-side-navigation" className="floating-nav" aria-label="Navigasi undangan">
          {navItems.map(({ id, symbol, label }) => {
            const isActive = activePageIndex === bookPageIds.indexOf(id as (typeof bookPageIds)[number]) ||
              (activePageIndex === 1 && id === 'home') ||
              (activePageIndex === 8 && id === 'gallery')

            return (
              <button
                key={id}
                className={isActive ? 'is-active' : ''}
                type="button"
                onClick={() => { scrollTo(id); setBookNavOpen(false) }}
                aria-label={`Buka ${label}`}
                aria-current={isActive ? 'location' : undefined}
                title={label}
              >
                <span className="floating-nav__icon" aria-hidden="true">{symbol}</span>
                <span className="floating-nav__mobile-label" aria-hidden="true">{label}</span>
              </button>
            )
          })}
        </nav>
        </div>
      </InvitationGate>
    </div>
  )
}

export default App
