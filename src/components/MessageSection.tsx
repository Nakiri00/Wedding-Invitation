import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { initialMessages } from '../data/wedding'
import { weddingApi } from '../services/api'
import { Reveal } from './Reveal'
import { Pagination } from './Pagination'
import type { MessageItem } from '../types/wedding'

interface MessageSectionProps {
  token: string
  guestName: string
  initialMessages?: MessageItem[]
  enabled: boolean
  onMessageCreated: (message: MessageItem) => void
}

export function MessageSection({ token, guestName, initialMessages: serverMessages, enabled, onMessageCreated }: MessageSectionProps) {
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const messages = serverMessages ?? initialMessages
  const publishedMessages = useMemo(() => messages.filter((item) => item.status === 'published'), [messages])
  const pageSize = 3
  const totalPages = Math.max(1, Math.ceil(publishedMessages.length / pageSize))
  const visibleMessages = useMemo(
    () => publishedMessages.slice((page - 1) * pageSize, page * pageSize),
    [publishedMessages, page],
  )

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
    if (!enabled || !senderName || !message.trim()) return

    try {
      const created = await weddingApi.createMessage(token, { name: senderName, message: message.trim() })
      onMessageCreated(created)
      setPage(1)
      setMessage('')
      setStatus('Pesan diterima dan menunggu moderasi.')
    } catch (reason: unknown) {
      setStatus(reason instanceof Error ? reason.message : 'Pesan gagal dikirim.')
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
            <p className="eyebrow">Send Your Wishes</p>
            <h3>Leave a little note for us.</h3>
            <p>Ucapan akan tampil setelah melalui moderasi.</p>
          </div>
          <form className="wish-form" onSubmit={submit}>
            <label>
              Nama
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={guestName || 'Nama Anda'} disabled={!enabled} />
            </label>
            <label>
              Pesan
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={240} rows={4} placeholder="Tulis ucapan terbaik..." disabled={!enabled} />
            </label>
            <div className="wish-form-footer">
              <small>{message.length}/240</small>
              <button className="outline-btn" type="submit" disabled={!enabled}>Kirim Pesan</button>
            </div>
            {status && <small className="form-status" role="status">{status}</small>}
            {!enabled && <small className="form-status">Pesan aktif setelah link undangan personal tervalidasi.</small>}
          </form>
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
