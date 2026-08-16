import { Reveal } from './Reveal'
import { weddingConfig } from '../data/wedding'

export function EventSection() {
  return (
    <section className="section event-section" id="event">
      <Reveal className="section-heading centered">
        <span className="section-kicker">Save the date</span>
        <h2>Our <i>special day</i></h2>
        <p>Catat tanggalnya dan mari merayakan cinta bersama.</p>
      </Reveal>
      <Reveal className="event-card">
        <div className="event-date">
          <span>NOV</span>
          <strong>22</strong>
          <span>2026</span>
        </div>
        <div className="event-details">
          <div>
            <span className="detail-label">Akad & Resepsi</span>
            <strong>{weddingConfig.timeLabel}</strong>
          </div>
          <div>
            <span className="detail-label">Lokasi</span>
            <strong>{weddingConfig.venue}</strong>
            <p>{weddingConfig.address}</p>
          </div>
          <a className="text-link" href={weddingConfig.mapUrl} target="_blank" rel="noreferrer">Buka Google Maps ↗</a>
        </div>
      </Reveal>
    </section>
  )
}
