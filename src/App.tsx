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
import { weddingApi } from './services/api'
import { weddingConfig } from './data/wedding'
import { useScrollSpy } from './hooks/useScrollSpy'
import './WeddingInvitation.css'

const ConsoleApp = lazy(() => import('./ConsoleApp').then((module) => ({ default: module.ConsoleApp })))

const navItems = [
  { id: 'home', symbol: '⌂', label: 'Home' },
  { id: 'couple', symbol: '♡', label: 'Mempelai' },
  { id: 'event', symbol: '◷', label: 'Acara' },
  { id: 'rsvp', symbol: '✉', label: 'RSVP' },
  { id: 'messages', symbol: '“', label: 'Pesan' },
  { id: 'gallery', symbol: '▦', label: 'Galeri' },
] as const

const navSectionIds = navItems.map(({ id }) => id)

function App() {
  const path = window.location.hash.slice(1) || '/'
  if (path.startsWith('/admin') || path === '/admin') return <Suspense fallback={null}><ConsoleApp section="admin" /></Suspense>
  if (path.startsWith('/staff') || path === '/admin') return <Suspense fallback={null}><ConsoleApp section="staff" /></Suspense>
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

  const { invitation, loading: invitationLoading, error: invitationError } = useInvitation(invitationToken)
  const invitationValid = Boolean(invitation && invitation.status === 'ACTIVE')
  const existingRsvp = rsvp ?? (invitation?.rsvp ? {
    name: invitation.rsvp.name,
    attendance: invitation.rsvp.attendance,
    guests: invitation.rsvp.guestCount,
    babyCount: invitation.rsvp.babyCount,
    submittedAt: invitation.rsvp.submittedAt,
    qrDataUrl: invitation.rsvp.qrDataUrl,
  } : null)
  const [messages, setMessages] = useState<MessageItem[]>([])

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
    setRsvp(submission)
    document.getElementById('rsvp-result')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const scrollTo = (id: string) => {
    activateSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="wedding-ui">
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
        valid={invitationValid}
        loading={invitationLoading}
        error={invitationError}
        onOpen={startInvitationMusic}
      >
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

        <main className="invitation-main">
          <OpeningSection />
          <QuoteSection />
          <CoupleSection />
          <EventSection />
          <StorySection />
          <RSVPSection
            key={invitation?.guestName ?? 'unknown-guest'}
            token={invitationToken}
            validToken={invitationValid}
            quota={invitation?.quota ?? 0}
            existingRSVP={existingRsvp}
            guestName={invitation?.guestName ?? 'Tamu Undangan'}
            onSubmit={handleRSVP}
          />
          <MessageSection
            token={invitationToken}
            guestName={invitation?.guestName ?? ''}
            initialMessages={messages}
            enabled={invitationValid}
            onMessageCreated={(message) => setMessages((current) => [message, ...current])}
          />
          <GallerySection />
        </main>

        <Footer />
      </InvitationGate>
    </div>
  )
}

export default App
