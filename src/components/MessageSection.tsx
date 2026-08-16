import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { initialMessages } from '../data/wedding'
import { weddingApi } from '../services/api'
import { Reveal } from './Reveal'
import { Pagination } from './Pagination'
import { SearchBar } from './SearchBar' // Pastikan SearchBar di-import
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
  const [searchQuery, setSearchQuery] = useState('') 

  const messages = serverMessages ?? initialMessages

  const publishedMessages = useMemo(() => messages.filter((item) => item.status === 'published'), [messages])

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return publishedMessages
    const lower = searchQuery.toLowerCase()
    return publishedMessages.filter(item => 
      item.name.toLowerCase().includes(lower) || 
      item.message.toLowerCase().includes(lower)
    )
  }, [publishedMessages, searchQuery])

  const pageSize = 3
  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / pageSize))
  
  const visibleMessages = useMemo(
    () => filteredMessages.slice((page - 1) * pageSize, page * pageSize),
    [filteredMessages, page, pageSize],
  )

  useEffect(() => {
    if (totalPages <= 1) return;

    const interval = setInterval(() => {
      setPage(prev => (prev >= totalPages ? 1 : prev + 1));
    }, 5000); 
    return () => clearInterval(interval);
  }, [totalPages]);

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
      {/* CSS Keyframes untuk animasi transisi */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-message-list {
          animation: fadeSlideIn 0.5s ease-out forwards;
        }
      `}</style>

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

        <Reveal className="message-list-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          {/* <SearchBar 
            placeholder="Cari ucapan atau nama tamu..." 
            value={searchQuery} 
            onChange={(val) => { setSearchQuery(val); setPage(1); }} 
            style={{ width: '50%'}} 
          /> */}

          <div key={`guest-msg-page-${page}`} className="message-list animate-message-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {visibleMessages.length > 0 ? visibleMessages.map((item) => (
              <article className="message-item" key={item.id}>
                <span className="message-quote">“</span>
                <p>{item.message}</p>
                <strong>{item.name}</strong><small>{new Date(item.createdAt).toLocaleDateString('id-ID')}</small>
              </article>
            )) : (
              <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#666', padding: '2rem 0' }}>Tidak ada pesan ditemukan.</p>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto', paddingTop: '1rem' }}>
              <Pagination page={page} totalItems={filteredMessages.length} itemsPerPage={pageSize} onPageChange={setPage} label="pesan" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}