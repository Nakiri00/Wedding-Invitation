import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
// import { initialMessages } from '../data/wedding'
import { weddingApi } from '../services/api'
import { Reveal } from './Reveal'
import { Pagination } from './Pagination'
import type { MessageItem } from '../types/wedding'

interface MessageSectionProps {
  token: string
  guestName: string
  initialMessages: MessageItem[]
  enabled: boolean
  hasSubmittedInitially: boolean
  onMessageCreated: (message: MessageItem) => void
  previewMode?: boolean
}

export function MessageSection({ token, guestName, initialMessages: serverMessages, enabled, hasSubmittedInitially, onMessageCreated, previewMode = false }: MessageSectionProps) {
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const publishedMessages = useMemo(
    () => serverMessages.filter((item) => item.status === 'published'),
    [serverMessages],
  )
  const pageSize = 3
  const totalPages = Math.max(1, Math.ceil(publishedMessages.length / pageSize))
  const visibleMessages = useMemo(
    () => publishedMessages.slice((page - 1) * pageSize, page * pageSize),
    [publishedMessages, page],
  )
  const [submittedToken, setSubmittedToken] = useState<string | null>(null)
  const hasSubmitted = hasSubmittedInitially || submittedToken === token

  useEffect(() => {
    if (totalPages <= 1) return
    const interval = window.setInterval(() => {
      setPage((current) => (current >= totalPages ? 1 : current + 1))
    }, 6000)
    return () => window.clearInterval(interval)
  }, [totalPages])

  const submit = async (event: FormEvent) => {
    event.preventDefault()

    const senderName = name.trim() || guestName.trim()
    const trimmedMessage = message.trim()

    if (
      !enabled ||
      hasSubmitted ||
      submitting ||
      !senderName ||
      !trimmedMessage
    ) {
      return
    }

    setSubmitting(true)
    setStatus('')

    try {
      const created: MessageItem = previewMode
        ? {
            id: `preview-${crypto.randomUUID()}`,
            name: senderName,
            message: trimmedMessage,
            status: 'published',
            createdAt: new Date().toISOString(),
          }
        : await weddingApi.createMessage(token, {
            name: senderName,
            message: trimmedMessage,
          })

      onMessageCreated(created)
      setPage(1)
      setMessage('')
      setSubmittedToken(token)
    } catch (reason: unknown) {
      setStatus(
        reason instanceof Error
          ? reason.message
          : 'Pesan gagal dikirim.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="section wishes-section" id="messages">
      <div className="container">
        <Reveal className="section-heading centered-heading">
          <p className="eyebrow">Words from the Heart</p>
          <h2>Pesan untuk hari bahagia</h2>
          <p>Tinggalkan doa dan ucapan terbaik untuk kedua mempelai.</p>
        </Reveal>

        <Reveal className="wish-form-shell">
          <div className="wish-form-copy">
            <p className="eyebrow">
              {hasSubmitted ? 'Thank You' : 'Send Your Wishes'}
            </p>

            <h3>
              {hasSubmitted
                ? 'Your kind words mean so much to us.'
                : 'Leave a little note for us.'}
            </h3>

            <p>
              {hasSubmitted
                ? 'Pesan dan doa terbaikmu telah menjadi bagian dari hari bahagia kami.'
                : 'Ucapan akan langsung tersampaikan kepada kedua mempelai.'}
            </p>
          </div>

          {hasSubmitted ? (
            <div
              className="wish-thank-you"
              role="status"
              aria-live="polite"
            >
              <div
                className="wish-thank-you__ornament"
                aria-hidden="true"
              >
                <span />
                <strong>♡</strong>
                <span />
              </div>

              <p className="eyebrow">PESAN TELAH TERKIRIM</p>

              <h3>Terima kasih atas pesan indahnya</h3>

              <p>
                Pesan telah tersampaikan. Doa dan ucapanmu sangat berarti bagi kami.
              </p>
            </div>
          ) : (
            <form className="wish-form" onSubmit={submit}>
              <label>
                Nama

                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={guestName || 'Nama Anda'}
                  disabled={!enabled || submitting}
                  maxLength={120}
                />
              </label>

              <label>
                Pesan

                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={240}
                  rows={4}
                  placeholder="Tulis ucapan terbaik..."
                  disabled={!enabled || submitting}
                  required
                />
              </label>

              <div className="wish-form-footer">
                <small>{message.length}/240</small>

                <button
                  className="outline-btn"
                  type="submit"
                  disabled={
                    !enabled ||
                    submitting ||
                    !message.trim() ||
                    !(name.trim() || guestName.trim())
                  }
                >
                  {submitting ? 'Mengirim…' : 'Kirim Pesan'}
                </button>
              </div>

              {status && (
                <small className="form-status" role="alert">
                  {status}
                </small>
              )}

              {!enabled && (
                <small className="form-status">
                  Pesan aktif setelah link undangan personal tervalidasi.
                </small>
              )}
            </form>
          )}
        </Reveal>

        <Reveal className="wishes-grid">
          {visibleMessages.length > 0 ? visibleMessages.map((item) => (
            <article className="wish-card" key={item.id}>
              <div className="wish-avatar" aria-hidden="true">{item.name.trim().slice(0, 1).toUpperCase() || '♡'}</div>
              <div>
                <h3>{item.name}</h3>
                <p>{item.message}</p>
                <small>{formatDate(item.createdAt)}</small>
              </div>
            </article>
          )) : (
            <div className="empty-wishes">Belum ada pesan yang dipublikasikan.</div>
          )}
        </Reveal>

        {publishedMessages.length > pageSize && (
          <div className="wishes-pagination">
            <Pagination page={page} totalItems={publishedMessages.length} itemsPerPage={pageSize} onPageChange={setPage} label="pesan" />
          </div>
        )}

      </div>
    </section>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
