import { weddingConfig } from '../data/wedding'
import { weddingAssets } from '../assets/wedding/weddingAssets'

export function Footer() {
  return (
    <footer className="closing-section">
      <img className="closing-bg" src={weddingAssets.environment.background} alt="" aria-hidden="true" />
      <div className="closing-overlay" aria-hidden="true" />
      <img className="closing-border" src={weddingAssets.environment.pondBorder} alt="" aria-hidden="true" />
      <img className="closing-canopy" src={weddingAssets.canopy.top} alt="" aria-hidden="true" />

      <div className="closing-content">
        <p className="eyebrow">With Love</p>
        <h2>
          {weddingConfig.couple.groom.shortName}
          <em>&amp;</em>
          {weddingConfig.couple.bride.shortName}
        </h2>
        <p>Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa terbaik.</p>
        <div className="ornament-line ornament-line--light" aria-hidden="true"><span /><i>◇</i><span /></div>
        <small>{weddingConfig.dateLabel}</small>
      </div>
    </footer>
  )
}
