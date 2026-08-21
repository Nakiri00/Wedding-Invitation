import { useState } from 'react'
import type { FormEvent } from 'react'
import type { RSVPSubmission } from '../types/wedding'
import { Reveal } from './Reveal'
import { weddingApi } from '../services/api'
import { weddingAssets } from '../assets/wedding/weddingAssets'

interface RSVPSectionProps {
  token: string
  validToken: boolean
  quota: number
  existingRSVP: RSVPSubmission | null
  guestName: string
  checkedInAt?: string | null
  onSubmit: (submission: RSVPSubmission) => void
}

export function RSVPSection({ token, validToken, quota, existingRSVP, guestName, checkedInAt = null, onSubmit }: RSVPSectionProps) {
  const [name, setName] = useState(guestName || '')
  const [attendance, setAttendance] = useState<'attending' | 'not_attending'>('attending')
  const [guests, setGuests] = useState(1)
  const [babyCount, setBabyCount] = useState(0)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

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
      <img className="rsvp-bg" src={weddingAssets.environment.background} alt="" aria-hidden="true" />
      <div className="rsvp-veil" aria-hidden="true" />

      <Reveal className="container rsvp-shell">
        <div className="rsvp-copy">
          <p className="eyebrow">Répondez S’il Vous Plaît</p>
          <h2>Will you be joining us?</h2>
          <p>Kehadiran dan doa Anda adalah hadiah terindah untuk kami. Mohon konfirmasi melalui undangan personal ini.</p>
          <div className="rsvp-quota">Kuota undangan <strong>{Math.max(quota, 0)} kursi</strong></div>
          <img className="rsvp-flower" src={weddingAssets.lotus.medium} alt="" aria-hidden="true" />
        </div>

        {existingRSVP ? (
        existingRSVP.attendance === 'attending' &&
        checkedInAt ? (

          <div
            className="rsvp-form success-panel arrival-confirmation"
            id="rsvp-result"
            role="status"
            aria-live="polite"
          >
            <div
              className="arrival-confirmation__icon"
              aria-hidden="true"
            >
              ✓
            </div>

            <p className="eyebrow">
              Kehadiran Terkonfirmasi
            </p>

            <h3>Terima kasih telah datang</h3>

            <p>
              Kehadiran{' '}
              <strong>{existingRSVP.name}</strong>{' '}
              telah tercatat. Selamat menikmati rangkaian
              acara dan menjadi bagian dari hari bahagia
              kami.
            </p>

            <div className="arrival-confirmation__time">
              <span>Waktu check-in</span>
              <br></br>
              <strong>
                {new Date(checkedInAt).toLocaleString(
                  'id-ID',
                  {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  },
                )}
              </strong>
            </div>

            <div
              className="arrival-confirmation__ornament"
              aria-hidden="true"
            >
              <span />
              <strong>♡</strong>
              <span />
            </div>
          </div>
        ) : (
          <div
            className="rsvp-form success-panel"
            id="rsvp-result"
          >
            <div className="success-icon">✓</div>

            <p className="eyebrow">RSVP Received</p>

            <h3>Terima kasih, {existingRSVP.name}.</h3>

            <p>
              {existingRSVP.attendance === 'attending'
                ? `Kami menantikan kehadiran Anda dengan ${existingRSVP.guests} kursi.`
                : 'Terima kasih atas konfirmasinya. Doa baik Anda sangat berarti bagi kami.'}
            </p>

            {existingRSVP.attendance === 'attending' && (
              <div className="qr-ticket">
                {existingRSVP.qrDataUrl ? (
                  <img
                    className="qr-image"
                    src={existingRSVP.qrDataUrl}
                    alt={`QR check-in ${existingRSVP.name}`}
                  />
                ) : (
                  <div
                    className="fake-qr"
                    aria-label="Kode check-in"
                  >
                    {Array.from(
                      { length: 121 },
                      (_, index) => (
                        <i
                          key={index}
                          className={
                            (
                              index * 17 +
                              token.length * 13 +
                              (index % 7)
                            ) %
                                5 <
                              2
                                ? 'on'
                                : ''
                          }
                        />
                      ),
                    )}
                  </div>
                )}

                <div className="qr-ticket-meta">
                  <span>
                    {existingRSVP.guests} kursi
                  </span>

                  {existingRSVP.babyCount > 0 && (
                    <span>
                      {existingRSVP.babyCount} bayi/anak
                    </span>
                  )}
                </div>

                <small>
                  Tunjukkan QR code ini kepada staff saat
                  hari H.
                </small>
              </div>
            )}
          </div>
        )
      ): (
          <form className="rsvp-form" onSubmit={submit} noValidate>
            <label className="rsvp-name-field">
              <span className="rsvp-field-label">Nama</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={guestName || 'Nama tamu'}
                autoComplete="name"
                aria-label="Nama tamu"
              />
            </label>

            <fieldset>
              <legend>Konfirmasi kehadiran</legend>
              <div className="segmented">
                <label>
                  <input type="radio" checked={attendance === 'attending'} onChange={() => setAttendance('attending')} />
                  <span>Dengan senang hati hadir</span>
                </label>
                <label>
                  <input type="radio" checked={attendance === 'not_attending'} onChange={() => setAttendance('not_attending')} />
                  <span>Berhalangan hadir</span>
                </label>
              </div>
            </fieldset>

            {attendance === 'attending' && (
              <div className="guest-controls editorial-guest-controls">
                <div>
                  <span>Jumlah kursi</span>
                  <div className="stepper">
                    <button type="button" onClick={() => setGuests((n) => Math.max(1, n - 1))}>−</button>
                    <strong>{guests}</strong>
                    <button type="button" onClick={() => setGuests((n) => Math.min(Math.max(1, quota), n + 1))}>+</button>
                  </div>
                  <small>Maksimal {quota} kursi.</small>
                </div>
                <div>
                  <span>Bayi / anak</span>
                  <div className="stepper">
                    <button type="button" onClick={() => setBabyCount((n) => Math.max(0, n - 1))}>−</button>
                    <strong>{babyCount}</strong>
                    <button type="button" onClick={() => setBabyCount((n) => n + 1)}>+</button>
                  </div>
                  <small>Tidak mengurangi quota.</small>
                </div>
              </div>
            )}

            {error && <p className="form-error" role="alert">{error}</p>}
            {!validToken && <p className="form-note">Mode preview: RSVP aktif melalui link undangan personal.</p>}

            <button className="cover-primary-btn primary-btn--wide" type="submit" disabled={submitting || !validToken}>
              <span>{submitting ? 'Mengirim…' : 'Kirim Konfirmasi'}</span>
              <span aria-hidden="true">→</span>
            </button>
          </form>
        )}
      </Reveal>
    </section>
  )
}
