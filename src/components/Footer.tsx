import { weddingConfig } from '../data/wedding'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-lotus">✦</div>
      <p>With love,</p>
      <h2>{weddingConfig.couple.groom.shortName} <i>&</i> {weddingConfig.couple.bride.shortName}</h2>
      <small>{weddingConfig.dateLabel} · {weddingConfig.venue}</small>
    </footer>
  )
}
