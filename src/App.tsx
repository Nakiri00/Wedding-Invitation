import { useEffect, useMemo, useState } from 'react'
import { InvitationGate } from './components/InvitationGate'
import { OpeningSection } from './components/OpeningSection'
import { CoupleSection } from './components/CoupleSection'
import { EventSection } from './components/EventSection'
import { CountdownSection } from './components/CountdownSection'
import { RSVPSection } from './components/RSVPSection'
import { MessageSection } from './components/MessageSection'
import { GallerySection } from './components/GallerySection'
import { Footer } from './components/Footer'
import { ScrollProgress } from './components/ScrollProgress'
import { weddingConfig } from './data/wedding'
import type { MessageItem, RSVPSubmission } from './types/wedding'
import { useInvitation } from './hooks/useInvitation'
import { weddingApi } from './services/api'
import './App.css'
import { ConsoleApp } from './ConsoleApp'

function App() {
  const path = window.location.pathname
  if (path.startsWith('/admin')) return <ConsoleApp section="admin" />
  if (path.startsWith('/staff')) return <ConsoleApp section="staff" />
  return <WeddingInvitationApp />
}

function WeddingInvitationApp() {
  const [rsvp, setRsvp] = useState<RSVPSubmission | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

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

  const handleRSVP = (submission: RSVPSubmission) => {
    setRsvp(submission)
    document.getElementById('rsvp-result')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const scrollTo = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <InvitationGate
      guestName={invitation?.guestName ?? weddingConfig.invitedGuest}
      valid={invitationValid}
      loading={invitationLoading}
      error={invitationError}
    >
      <ScrollProgress />
      <header className={`site-header ${menuOpen ? 'is-open' : ''}`}>
        <button className="brand" type="button" onClick={() => scrollTo('home')} aria-label="Kembali ke awal">
          <span className="brand-mark">L</span>
          <span>Lotus & Willow</span>
        </button>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span />
        </button>
        <nav aria-label="Navigasi undangan">
          {[
            ['home', 'Home'],
            ['story', 'Cerita'],
            ['event', 'Acara'],
            ['rsvp', 'RSVP'],
            ['messages', 'Pesan'],
            ['gallery', 'Galeri'],
          ].map(([id, label]) => (
            <button type="button" key={id} onClick={() => scrollTo(id)}>{label}</button>
          ))}
        </nav>
      </header>

      <main>
        <OpeningSection guestName={invitationValid ? invitation?.guestName : undefined} onOpen={() => scrollTo('story')} />
        <CoupleSection />
        <EventSection />
        <CountdownSection targetDate={weddingConfig.dateISO} />
        <RSVPSection
          token={invitationToken}
          validToken={invitationValid}
          quota={invitation?.quota ?? 0}
          existingRSVP={existingRsvp}
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
  )
}

export default App
