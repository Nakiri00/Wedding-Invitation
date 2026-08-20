import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { adminApi, type AdminInvitation, type AdminMessage, type AuthSession, type Overview } from '../services/adminApi'
import { Pagination } from '../components/Pagination'
import { SearchBar } from '../components/SearchBar'

interface Props { session: AuthSession; onLogout: () => void }

export function AdminPage({ session, onLogout }: Props) {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [invitations, setInvitations] = useState<AdminInvitation[]>([])
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [selected, setSelected] = useState<AdminInvitation | null>(null)
  const [guestName, setGuestName] = useState(''); const [contact, setContact] = useState(''); const [quota, setQuota] = useState(2)
  const [newGuest, setNewGuest] = useState(''); const [newGuestContact, setNewGuestContact] = useState(''); const [counted, setCounted] = useState(true)
  const [notice, setNotice] = useState(''); const [loading, setLoading] = useState(false)
  
  const [messagePage, setMessagePage] = useState(1)
  const [guestPage, setGuestPage] = useState(1)
  const [invitationPage, setInvitationPage] = useState(1)
  
  const [searchMessage, setSearchMessage] = useState('')
  const [searchInvitation, setSearchInvitation] = useState('')

  const refreshDashboard = async () => {
    const [overviewData, invitationData, messageData] = await Promise.all([
      adminApi.overview(),
      adminApi.invitations(),
      adminApi.messages(),
    ])
    setOverview(overviewData)
    setInvitations(invitationData)
    setMessages(messageData)
    setSelected((prev) => prev ? invitationData.find((item) => item.id === prev.id) ?? null : null)
  }

  useEffect(() => {
    let cancelled = false
    const loadDashboard = async () => {
      try {
        const [overviewData, invitationData, messageData] = await Promise.all([
          adminApi.overview(),
          adminApi.invitations(),
          adminApi.messages(),
        ])
        if (cancelled) return
        setOverview(overviewData)
        setInvitations(invitationData)
        setMessages(messageData)
        setSelected((prev) => prev ? invitationData.find((item) => item.id === prev.id) ?? null : null)
      } catch (error: unknown) {
        if (cancelled) return
        setNotice(error instanceof Error ? error.message : 'Gagal memuat dashboard.')
      }
    }
    void loadDashboard()
    return () => { cancelled = true }
  }, [])

  const filteredMessages = useMemo(() => {
    if (!searchMessage.trim()) return messages
    const lower = searchMessage.toLowerCase()
    return messages.filter(m => m.guestName.toLowerCase().includes(lower) || m.message.toLowerCase().includes(lower))
  }, [messages, searchMessage])

  const filteredInvitations = useMemo(() => {
    if (!searchInvitation.trim()) return invitations
    const lower = searchInvitation.toLowerCase()
    return invitations.filter(i => i.guestName.toLowerCase().includes(lower) || (i.contact && i.contact.toLowerCase().includes(lower)))
  }, [invitations, searchInvitation])

  const pending = messages.filter(m => m.status === 'PENDING').length
  
  const messagePageSize = 3
  const totalMessagePages = Math.max(1, Math.ceil(filteredMessages.length / messagePageSize))
  const visibleAdminMessages = filteredMessages.slice((messagePage - 1) * messagePageSize, messagePage * messagePageSize)
  
  const guestPageSize = 10
  const visibleGuests = selected?.guests.slice((guestPage - 1) * guestPageSize, guestPage * guestPageSize) ?? []
  
  const invitationPageSize = 10
  const visibleInvitations = filteredInvitations.slice((invitationPage - 1) * invitationPageSize, invitationPage * invitationPageSize)

  const capacity = overview?.invitedSeats ?? 0
  const confirmed = overview?.confirmedSeats ?? 0
  const utilization = capacity ? Math.min(100, Math.round((confirmed / capacity) * 100)) : 0
  const selectedCount = useMemo(() => selected?.guests.filter(g => g.countedGuest).length ?? 0, [selected])

  useEffect(() => {
    if (totalMessagePages <= 1) return;
    const interval = setInterval(() => {
      setMessagePage(prev => (prev >= totalMessagePages ? 1 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [totalMessagePages]);

  async function create(e: FormEvent) { e.preventDefault(); setLoading(true); try { await adminApi.createInvitation({ guestName, contact: contact || undefined, quota }); setGuestName(''); setContact(''); setNotice('Undangan berhasil dibuat.'); await refreshDashboard() } catch (e) { setNotice(e instanceof Error ? e.message : 'Gagal membuat undangan.') } finally { setLoading(false) } }
  async function moderate(id: string, status: 'PUBLISHED' | 'HIDDEN') { try { await adminApi.moderateMessage(id, status); await refreshDashboard() } catch (e) { setNotice(e instanceof Error ? e.message : 'Moderasi gagal.') } }
  async function revoke(id: string) { if (!confirm('Cabut undangan ini?')) return; try { await adminApi.revokeInvitation(id); await refreshDashboard() } catch (e) { setNotice(e instanceof Error ? e.message : 'Gagal mencabut undangan.') } }
  async function selectInvitation(i: AdminInvitation) { setSelected(i); setGuestPage(1); try { const guests = await adminApi.guests(i.id); setSelected({ ...i, guests }); setGuestPage(1) } catch (e) { setNotice(e instanceof Error ? e.message : 'Gagal memuat guest list.') } }
  async function addGuest(e: FormEvent) { e.preventDefault(); if (!selected) return; try { await adminApi.addGuest(selected.id, { name: newGuest, contact: newGuestContact || undefined, countedGuest: counted }); setNewGuest(''); setNewGuestContact(''); await refreshDashboard(); const fresh = (await adminApi.invitations()).find(x => x.id === selected.id); if (fresh) selectInvitation(fresh); setNotice('Tamu berhasil ditambahkan.') } catch (e) { setNotice(e instanceof Error ? e.message : 'Gagal menambahkan tamu.') } }
  async function deleteGuest(id: string) { if (!confirm('Hapus tamu ini dari daftar undangan?')) return; setGuestPage(1); try { await adminApi.deleteGuest(id); await refreshDashboard(); if (selected) { const fresh = (await adminApi.invitations()).find(x => x.id === selected.id); if (fresh) selectInvitation(fresh) } } catch (e) { setNotice(e instanceof Error ? e.message : 'Gagal menghapus tamu.') } }

  return (
    <main className="console-shell">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-message-list { animation: fadeSlideIn 0.5s ease-out forwards; }
        
        /* Animasi memantul (pop in) untuk ikon rantai dan centang */
        @keyframes popInFeedback {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .icon-feedback { animation: popInFeedback 0.3s ease-out forwards; }
      `}</style>

      <ConsoleHeader session={session} onLogout={onLogout} title="Admin Dashboard" />
      <div className="console-content">
        {notice && <div className="console-notice" role="status">{notice}</div>}

        <section className="stat-grid">
          <Stat label="Undangan aktif" value={overview?.invited ?? 0} />
          <Stat label="RSVP" value={overview?.rsvp ?? 0} />
          <Stat label="Attending" value={overview?.attending ?? 0} />
          <Stat label="Checked-in" value={overview?.checkedIn ?? 0} />
          <Stat label="Walk-in" value={overview?.walkIns ?? 0} />
        </section>

        <section className="analytics-grid">
          <div className="panel progress-panel"><div className="panel-head"><div><span className="console-kicker">CAPACITY</span><h2>Seat utilization</h2></div><strong>{utilization}%</strong></div><div className="progress-track"><span style={{ width: `${utilization}%` }} /></div><div className="metric-row"><span>{confirmed} confirmed seats</span><span>{capacity} total quota</span></div></div>
          <div className="panel metric-list"><div><span>Confirmation rate</span><strong>{overview?.confirmationRate ?? 0}%</strong></div><div><span>Check-in rate</span><strong>{overview?.checkInRate ?? 0}%</strong></div><div><span>Pending messages</span><strong>{pending}</strong></div></div>
        </section>

        <div className="console-grid">
          <section className="panel">
            <div className="panel-head"><div><span className="console-kicker">INVITATIONS</span><h2>Buat undangan</h2></div></div>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '550px' }} onSubmit={create}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>Nama tamu<input value={guestName} onChange={e => setGuestName(e.target.value)} required /></label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>Kontak<input value={contact} onChange={e => setContact(e.target.value)} /></label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>Quota<input type="number" min="1" max="50" value={quota} onChange={e => setQuota(Number(e.target.value))} /></label>
              <button className="primary-button" disabled={loading} style={{ marginTop: '0.5rem' }}>{loading ? '...' : 'Tambah Data Tamu'}</button>
            </form>
          </section>

          <section className="panel">
            <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div><span className="console-kicker">MESSAGES</span><h2>Moderasi pesan</h2></div>
              <SearchBar 
                placeholder="Cari pesan atau nama..." 
                value={searchMessage} 
                onChange={val => { setSearchMessage(val); setMessagePage(1); }} 
                style={{ flex: '1', minWidth: '200px', maxWidth: '300px' }} 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
              <div key={`message-page-${messagePage}`} className="message-admin-list animate-message-list" style={{ overflowY: 'visible', maxHeight: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {visibleAdminMessages.length > 0 ? visibleAdminMessages.map(m => (
                  <article className="admin-message" key={m.id}>
                    <div>
                      <strong>{m.guestName}</strong>
                      <p>{m.message}</p>
                      <small>{m.status} · {m.invitation?.guestName ?? 'Public'}</small>
                    </div>
                    <div className="admin-actions">
                      {m.status !== 'PUBLISHED' && <button onClick={() => moderate(m.id, 'PUBLISHED')}>Publish</button>}
                      {m.status !== 'HIDDEN' && <button onClick={() => moderate(m.id, 'HIDDEN')}>Hide</button>}
                    </div>
                  </article>
                )) : (
                  <p style={{ color: '#666', fontStyle: 'italic', padding: '1rem 0' }}>Tidak ada pesan ditemukan.</p>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                <Pagination page={messagePage} totalItems={filteredMessages.length} itemsPerPage={messagePageSize} onPageChange={setMessagePage} label="pesan admin" />
              </div>
            </div>
          </section>
        </div>

        <section className="panel">
          <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div><span className="console-kicker">GUEST LIST</span><h2>Invitation registry</h2></div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <SearchBar 
                placeholder="Cari tamu..." 
                value={searchInvitation} 
                onChange={val => { setSearchInvitation(val); setInvitationPage(1); }} 
                style={{ width: '250px' }} 
              />
              <span className="console-kicker">{filteredInvitations.length} RECORDS</span>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Tamu</th><th>Guest list</th><th>Quota</th><th>RSVP</th><th>Check-in</th><th>Link</th><th /></tr></thead>
              <tbody>
                {visibleInvitations.length > 0 ? visibleInvitations.map(i => (
                  <tr key={i.id} className={selected?.id === i.id ? 'row-selected' : ''}>
                    <td><strong>{i.guestName}</strong><small>{i.contact || '—'}</small></td>
                    <td><button className="text-button" onClick={() => selectInvitation(i)}>{i.guests.length} guest</button></td>
                    <td>{i.quota}</td>
                    <td>{i.rsvp ? `${i.rsvp.attendance} · ${i.rsvp.guestCount}` : 'Belum'}</td>
                    <td>{i.checkedInAt ? `${i.checkInSource ?? 'STAFF'}` : 'Belum'}</td>
                    
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                        <CopyLinkButton token={i.token} onError={setNotice} />
                        <small>{i.token}</small>
                      </div>
                    </td>

                    <td>{i.status === 'ACTIVE' && <button className="danger-link" onClick={() => revoke(i.id)}>Revoke</button>}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada undangan ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
            <Pagination page={invitationPage} totalItems={filteredInvitations.length} itemsPerPage={invitationPageSize} onPageChange={setInvitationPage} label="undangan" />
          </div>
        </section>

        {selected && (
          <section className="panel guest-manager">
            <div className="panel-head"><div><span className="console-kicker">SELECTED INVITATION</span><h2>{selected.guestName}</h2></div><span className="quota-badge">{selectedCount}/{selected.quota} counted</span></div>
            <div className="guest-manager-grid">
              <form className="guest-add-form" onSubmit={addGuest}>
                <label>Nama tamu<input value={newGuest} onChange={e => setNewGuest(e.target.value)} required /></label>
                <label>Kontak<input value={newGuestContact} onChange={e => setNewGuestContact(e.target.value)} /></label>
                <label className="checkbox-line"><input type="checkbox" checked={counted} onChange={e => setCounted(e.target.checked)} /> Masuk quota</label>
                <button className="primary-button">Tambah tamu</button>
              </form>
              <div className="guest-list">
                {visibleGuests.map(g => (
                  <div className="guest-row" key={g.id}>
                    <div><strong>{g.name}</strong><small>{g.contact || 'Tanpa kontak'} · {g.countedGuest ? 'counted' : 'not counted'}</small></div>
                    <button className="danger-link" onClick={() => deleteGuest(g.id)}>Hapus</button>
                  </div>
                ))}
              </div>
              <Pagination page={guestPage} totalItems={selected.guests.length} itemsPerPage={guestPageSize} onPageChange={setGuestPage} label="guest list" />
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function CopyLinkButton({ token, onError }: { token: string, onError: (msg: string) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}/?invite=${token}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        })
        .catch(() => onError('Gagal menyalin link. Pastikan browser mengizinkan akses.'));
    } else {
      onError('Fitur copy tidak didukung di perangkat ini.');
    }
  };

  return (
    <button 
      type="button" 
      onClick={handleCopy} 
      title="Salin Link"
      style={{ 
        background: 'none', border: 'none', cursor: 'pointer', padding: 0, 
        color: copied ? '#10b981' : '#1a362f',  
      }}
    >
      {copied ? (
        <div key="copied-state" className="icon-feedback" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Tersalin!</span>
        </div>
      ) : (
        <div key="idle-state" className="icon-feedback" style={{ display: 'flex', alignItems: 'center' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </div>
      )}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="stat-card"><span>{label}</span><strong>{value}</strong></div> }
function ConsoleHeader({ session, onLogout, title }: { session: AuthSession; onLogout: () => void; title: string }) { return <header className="console-header"><div><span className="console-kicker">The Wedding of Konan & Nilo</span><h1>{title}</h1></div><div className="console-user"><span>{session.user.name} · {session.user.role}</span><button onClick={onLogout}>Keluar</button></div></header> }