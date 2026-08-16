import { useMemo, useState } from 'react'
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
  const visibleMessages = useMemo(
    () => publishedMessages.slice((page - 1) * pageSize, page * pageSize),
    [publishedMessages, page],
  )

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
    <section className="section message-section" id="messages">
      <Reveal className="section-heading centered">
        <span className="section-kicker">Words from the heart</span>
        <h2>Pesan & <i>kesan</i></h2>
        <p>Tinggalkan doa dan ucapan terbaik untuk kedua mempelai.</p>
      </Reveal>
      <div className="message-layout">
        <Reveal className="message-form">
          <form onSubmit={submit}>
            <label>Nama<input value={name} onChange={(e) => setName(e.target.value)} placeholder={guestName || "Nama Anda"} disabled={!enabled} /></label>
            <label>Pesan<textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={240} rows={5} placeholder="Tulis ucapan terbaik..." disabled={!enabled} /></label>
            <div className="form-footer"><small>{message.length}/240</small><button className="secondary-button" type="submit" disabled={!enabled}>Kirim pesan</button></div>
            {status && <small className="moderation-note" role="status">{status}</small>}
            {!enabled && <small className="moderation-note">Pesan dapat dikirim setelah link undangan personal tervalidasi.</small>}
          </form>
        </Reveal>
        <Reveal className="message-list">
          {visibleMessages.map((item) => (
            <article className="message-item" key={item.id}>
              <span className="message-quote">“</span>
              <p>{item.message}</p>
              <strong>{item.name}</strong><small>{new Date(item.createdAt).toLocaleDateString('id-ID')}</small>
            </article>
          ))}
          <Pagination page={page} totalItems={publishedMessages.length} itemsPerPage={pageSize} onPageChange={setPage} label="pesan" />
        </Reveal>
      </div>
    </section>
  )
}
