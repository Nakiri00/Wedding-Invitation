import { useEffect, useRef, useState } from 'react'
import { adminApi, type AuthSession } from '../services/adminApi'

interface Props { session: AuthSession; onLogout: () => void }
interface CheckInPreview { invitationId: string; guestName: string; quota: number; guestCount: number; babyCount: number; checkedInAt: string | null; qrToken: string }
interface CheckInResult { guestName: string; guestCount: number; babyCount: number; checkedInAt: string; source: 'STAFF' | 'WALK_IN' }
interface SearchResult { id: string; guestName: string; contact: string | null; quota: number; attendance: string | null; guestCount: number | null; checkedInAt: string | null }

export function StaffPage({ session, onLogout }: Props) {
  const [value, setValue] = useState('')
  const [preview, setPreview] = useState<CheckInPreview | null>(null)
  const [result, setResult] = useState<CheckInResult | null>(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)
  const [walkInMode, setWalkInMode] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [walkGuests, setWalkGuests] = useState(1)
  const [walkBabies, setWalkBabies] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanActiveRef = useRef(false)

  useEffect(() => () => stopScanner(), [])

  async function validateQr(code: string) {
    const trimmed = code.trim()
    if (!trimmed) return
    setError(''); setResult(null)
    try {
      const data = await adminApi.validateQr(trimmed)
      setPreview({ ...data, qrToken: trimmed })
      setValue('')
    } catch (e) { setPreview(null); setError(e instanceof Error ? e.message : 'QR tidak valid.') }
  }

  async function confirmCheckIn() {
    if (!preview) return
    setError('')
    try {
      const data = await adminApi.checkIn(preview.qrToken)
      setResult(data); setPreview(null)
    } catch (e) { setError(e instanceof Error ? e.message : 'Check-in gagal.') }
  }

  async function startScanner() {
    setError(''); setPreview(null); setResult(null)
    const BarcodeDetectorCtor = (window as typeof window & { BarcodeDetector?: new (options?: { formats?: string[] }) => { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>> } }).BarcodeDetector
    if (!BarcodeDetectorCtor) { setError('Browser ini belum mendukung QR scanner native. Gunakan input manual atau Chrome/Android terbaru.'); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
      streamRef.current = stream; scanActiveRef.current = true; setScanning(true)
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => undefined) }
      const detector = new BarcodeDetectorCtor({ formats: ['qr_code'] })
      const loop = async () => {
        if (!scanActiveRef.current || !videoRef.current || !streamRef.current) return
        try {
          const codes = await detector.detect(videoRef.current)
          const rawValue = codes[0]?.rawValue
          if (rawValue) { stopScanner(); await validateQr(rawValue); return }
        } catch { /* Camera frames can fail transiently; keep scanning. */ }
        if (scanActiveRef.current) window.requestAnimationFrame(loop)
      }
      window.requestAnimationFrame(loop)
    } catch { setError('Kamera tidak dapat diakses. Pastikan permission kamera diberikan.') }
  }

  function stopScanner() {
    scanActiveRef.current = false
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    setScanning(false)
  }

  async function find() {
    const query = search.trim()
    if (query.length < 2) return setResults([])
    try { setResults(await adminApi.searchWalkIns(query)) }
    catch (e) { setError(e instanceof Error ? e.message : 'Pencarian gagal.') }
  }

  async function walkIn(id: string, quota: number) {
    setError(''); setResult(null)
    if (walkGuests > quota) { setError(`Jumlah guest tidak boleh melebihi quota ${quota}.`); return }
    try { setResult(await adminApi.walkInCheckIn(id, walkGuests, walkBabies)); setResults([]); setSearch('') }
    catch (e) { setError(e instanceof Error ? e.message : 'Walk-in gagal.') }
  }

  return <main className="console-shell">
    <header className="console-header"><div><span className="console-kicker">LOTUS & WILLOW</span><h1>Staff Check-in</h1></div><div className="console-user"><span>{session.user.name} · {session.user.role}</span><button onClick={onLogout}>Keluar</button></div></header>
    <div className="staff-content">
      <section className="scanner-card">
        <span className="console-kicker">WEDDING DAY</span><h2>Check-in tamu</h2><p>Scan atau masukkan QR. Sistem akan menampilkan preview terlebih dahulu sebelum staff mengonfirmasi check-in.</p>
        <div className={`scanner-view ${scanning ? 'active' : ''}`}>{scanning ? <video ref={videoRef} autoPlay playsInline muted /> : <div className="scanner-placeholder">QR<br/><small>Ready to scan</small></div>}</div>
        <div className="scanner-actions">{!scanning ? <button className="primary-button" onClick={startScanner}>Buka Kamera</button> : <button className="secondary-button" onClick={stopScanner}>Tutup Kamera</button>}</div>
        <div className="manual-checkin"><label>Input QR manual<input value={value} onChange={e => setValue(e.target.value)} placeholder="wedding:checkin:..." onKeyDown={e => e.key === 'Enter' && validateQr(value)} /></label><button className="primary-button" onClick={() => validateQr(value)} disabled={!value.trim()}>Validasi</button></div>

        {preview && <div className="checkin-preview panel"><span className="console-kicker">VALID QR</span><h3>{preview.guestName}</h3><p>{preview.guestCount} counted guest · {preview.babyCount} baby · quota {preview.quota}</p>{preview.checkedInAt ? <div className="form-error">Sudah check-in pada {new Date(preview.checkedInAt).toLocaleString('id-ID')}.</div> : <button className="primary-button" onClick={confirmCheckIn}>Confirm Check-in</button>}</div>}
        {result && <div className="checkin-success"><span>✓</span><div><strong>{result.guestName}</strong><p>{result.guestCount} guest · {result.babyCount} baby · {result.source}</p><small>Checked-in {new Date(result.checkedInAt).toLocaleTimeString('id-ID')}</small></div></div>}

        <button className="text-button walk-in-toggle" onClick={() => setWalkInMode(v => !v)}>{walkInMode ? 'Tutup Walk-in Override' : 'Buka Walk-in Override'}</button>
        {walkInMode && <div className="walkin-panel"><div className="panel-head"><div><span className="console-kicker">OVERRIDE</span><h3>Cari tamu</h3></div></div><div className="walkin-search"><input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && find()} placeholder="Nama atau nomor kontak" /><button className="secondary-button" onClick={find}>Cari</button></div>{results.map(r => <div className="walkin-result" key={r.id}><div><strong>{r.guestName}</strong><small>{r.contact || 'Tanpa kontak'} · quota {r.quota} · {r.attendance ?? 'Belum RSVP'}</small></div><div className="walkin-controls"><label>Guest<input type="number" min="1" max={r.quota} value={walkGuests} onChange={e => setWalkGuests(Number(e.target.value))} /></label><label>Baby<input type="number" min="0" max="50" value={walkBabies} onChange={e => setWalkBabies(Number(e.target.value))} /></label><button className="primary-button" disabled={Boolean(r.checkedInAt)} onClick={() => walkIn(r.id, r.quota)}>{r.checkedInAt ? 'Sudah check-in' : 'Override check-in'}</button></div></div>)}</div>}
        {error && <div className="form-error" role="alert">{error}</div>}
      </section>
    </div>
  </main>
}
