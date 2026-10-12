import { Reveal } from './Reveal'
import { weddingConfig } from '../data/wedding'
import { weddingAssets } from '../assets/wedding/weddingAssets'
import { useCountdown } from '../hooks/useWedding'

import { downloadCalendarFile, getGoogleCalendarUrl } from '../lib/calendar'

export function EventSection() {
  const countdown = useCountdown(weddingConfig.dateISO)
  const countdownItems = [
    ['Hari', countdown.days],
    ['Jam', countdown.hours],
    ['Menit', countdown.minutes],
    ['Detik', countdown.seconds],
  ] as const

  return (
    <section className="section event-section" id="event">
      <img className="event-border" src={weddingAssets.environment.pondBorder} alt="" aria-hidden="true" />

      <div className="container">
        <Reveal className="section-heading section-heading--light centered-heading">
          <p className="eyebrow">Save the Date</p>
          <h2>{weddingConfig.dateLabel}</h2>
          <p>Simpan tanggalnya dan rayakan hari istimewa ini bersama kami.</p>
        </Reveal>

        <Reveal className="countdown editorial-countdown" aria-label="Hitung mundur menuju hari pernikahan">
          {countdownItems.map(([label, value]) => (
            <div key={label}>
              <strong>{String(value).padStart(2, '0')}</strong>
              <span>{label}</span>
            </div>
          ))}
        </Reveal>
        <div className="calendar-save-actions">
          <a
            className="calendar-save-button"
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noreferrer"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <rect x="3.5" y="5" width="17" height="16" rx="2" />
              <path d="M7.5 3v4M16.5 3v4M3.5 9.5h17M12 12.5v5M9.5 15h5" />
            </svg>
            <span>Simpan Tanggal</span>
          </a>
          <button type="button" className="calendar-download-link" onClick={downloadCalendarFile}>
            Atau unduh file kalender (.ics)
          </button>
        </div>


        <div className="event-cards">
          <Reveal className="event-card editorial-event-card">
            <div className="event-number">01</div>
            <p className="eyebrow">Akad Nikah</p>
            <h3>{weddingConfig.timeLabel.split('—')[0].trim()}</h3>
            <div className="event-rule" />
            <p>
              <strong>{weddingConfig.venue}</strong><br />
              {weddingConfig.address}
            </p>
            <a className="outline-btn" href={weddingConfig.mapUrl} target="_blank" rel="noreferrer">Lihat Lokasi</a>
            <p>*Hanya Dihadiri Keluarga</p>
          </Reveal>

          <Reveal className="event-card editorial-event-card event-card--accent">
            <div className="event-number">02</div>
            <p className="eyebrow">Resepsi</p>
            <h3>19:00 - 21:00 WIB</h3>
            <div className="event-rule" />
            <p>
              <strong>{weddingConfig.venue}</strong><br />
              {weddingConfig.address}
            </p>
            <a className="outline-btn" href={weddingConfig.mapUrl} target="_blank" rel="noreferrer">Lihat Lokasi</a>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
