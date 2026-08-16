import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import type { RSVPSubmission } from '../types/wedding'
import { Reveal } from './Reveal'
import { weddingApi } from '../services/api'

interface RSVPSectionProps {
  token: string
  validToken: boolean
  quota: number
  existingRSVP: RSVPSubmission | null
  guestName: string 
  onSubmit: (submission: RSVPSubmission) => void
}

export function RSVPSection({ token, validToken, quota, existingRSVP, guestName, onSubmit }: RSVPSectionProps) {
  const [name, setName] = useState(guestName || '')
  
  const [attendance, setAttendance] = useState<'attending' | 'not_attending'>('attending')
  const [guests, setGuests] = useState(1)
  const [babyCount, setBabyCount] = useState(0)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (guestName) {
      setName(guestName)
    }
  }, [guestName])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validToken) {
      setError('RSVP hanya dapat dilakukan melalui link undangan personal.')
      return
    }
    if (!name.trim()) {
      setError('Nama tamu wajib diisi.')
      return
    }
    if (attendance === 'attending' && guests > quota) {
      setError(`Jumlah kursi melebihi quota undangan (${quota}).`)
      return
    }

    setSubmitting(true)
    weddingApi.submitRSVP(token, {
      name: name.trim(),
      attendance,
      guestCount: attendance === 'attending' ? guests : 0,
      babyCount: attendance === 'attending' ? babyCount : 0,
    })
      .then((result) => onSubmit(result))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'RSVP gagal dikirim.'))
      .finally(() => setSubmitting(false))
  }

  return (
    <section className="section rsvp-section" id="rsvp">
      <Reveal className="section-heading">
        <span className="section-kicker">Your presence means a lot</span>
        <h2>Will you join<br /><i>our celebration?</i></h2>
        <p>Mohon konfirmasi kehadiran melalui undangan personal Anda.</p>
      </Reveal>

      <Reveal className="rsvp-card">
        {existingRSVP ? (
          <div className="success-state" id="rsvp-result">
            <div className="success-icon">✓</div>
            <span className="section-kicker">RSVP received</span>
            <h3>Terima kasih, {existingRSVP.name}.</h3>
            <p>{existingRSVP.attendance === 'attending' ? `Kami menantikan kehadiran Anda dengan ${existingRSVP.guests} kursi.` : 'Terima kasih atas konfirmasinya. Doa baik Anda sangat berarti bagi kami.'}</p>
            {existingRSVP.attendance === 'attending' && (
              <div className="qr-ticket">
                <div className="qr-ticket-header">
                  <span className="qr-kicker">Guest check-in</span>
                  <strong>INV-{token.slice(0, 6).toUpperCase()}</strong>
                </div>

                <div className="qr-code-frame">
                  <div className="qr-code" aria-label="QR code check-in">
                    {existingRSVP.qrDataUrl ? (
                      <img src={existingRSVP.qrDataUrl} alt="QR code check-in undangan" />
                    ) : (
                      Array.from(
                        { length: 121 },
                        (_, index) => (
                          <i
                            key={index}
                            className={((index * 17 + token.length * 13 + index % 7) % 5 < 2) ? 'on' : ''}
                          />
                        ),
                      )
                    )}
                  </div>
                </div>

                <div className="qr-ticket-info">
                  <div className="qr-ticket-meta">
                    <span>{existingRSVP.guests} kursi</span>
                    {existingRSVP.babyCount > 0 && <span>{existingRSVP.babyCount} bayi/anak</span>}
                  </div>
                  <p>Tunjukkan QR code ini kepada staff saat hari H untuk proses check-in.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="form-row">
              <label>
                Nama tamu
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={guestName || 'Nama Anda'} autoComplete="name" />
              </label>
            </div>
            <fieldset>
              <legend>Konfirmasi kehadiran</legend>
              <div className="choice-grid">
                <label className={`choice ${attendance === 'attending' ? 'selected' : ''}`}>
                  <input type="radio" checked={attendance === 'attending'} onChange={() => setAttendance('attending')} />
                  <span>Dengan senang hati hadir</span>
                </label>
                <label className={`choice ${attendance === 'not_attending' ? 'selected' : ''}`}>
                  <input type="radio" checked={attendance === 'not_attending'} onChange={() => setAttendance('not_attending')} />
                  <span>Berhalangan hadir</span>
                </label>
              </div>
            </fieldset>

            {attendance === 'attending' && (
              <div className="guest-controls">
                <div>
                  <span>Jumlah kursi</span>
                  <div className="stepper"><button type="button" onClick={() => setGuests((n) => Math.max(1, n - 1))}>−</button><strong>{guests}</strong><button type="button" onClick={() => setGuests((n) => Math.min(Math.max(1, quota), n + 1))}>+</button></div>
                  <small>Maksimal {quota} kursi sesuai quota undangan.</small>
                </div>
                <div>
                  <span>Bayi / anak</span>
                  <div className="stepper"><button type="button" onClick={() => setBabyCount((n) => Math.max(0, n - 1))}>−</button><strong>{babyCount}</strong><button type="button" onClick={() => setBabyCount((n) => n + 1)}>+</button></div>
                  <small>Tidak mengurangi quota kursi.</small>
                </div>
              </div>
            )}

            {error && <p className="form-error" role="alert">{error}</p>}
            {!validToken && <p className="form-note">Mode preview: formulir akan aktif setelah URL memiliki invitation token.</p>}
            <button className="primary-button full" type="submit" disabled={submitting || !validToken}>{submitting ? 'Mengirim…' : 'Kirim Konfirmasi'} <span>→</span></button>
          </form>
        )}
      </Reveal>
    </section>
  )
}