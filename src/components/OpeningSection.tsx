import { weddingConfig } from '../data/wedding'

interface OpeningSectionProps {
  guestName?: string
  onOpen: () => void
}

export function OpeningSection({ guestName, onOpen }: OpeningSectionProps) {
  return (
    <section className="hero-section" id="home">
      <div className="hero-orb hero-orb-one" />
      <div className="hero-orb hero-orb-two" />
      <div className="willow willow-left" aria-hidden="true">
        <i /><i /><i /><i /><i /><i />
      </div>
      <div className="willow willow-right" aria-hidden="true">
        <i /><i /><i /><i /><i /><i />
      </div>
      <div className="lotus-art" aria-hidden="true">
        <span className="petal p1" /><span className="petal p2" /><span className="petal p3" />
        <span className="petal p4" /><span className="petal p5" /><span className="petal p6" />
        <span className="petal p7" /><span className="petal p8" /><span className="petal p9" />
        <span className="lotus-center" />
      </div>
      <div className="hero-copy">
        <p className="eyebrow">The Wedding of</p>
        <h1><span>Aditya</span><em>&</em><span>Alya</span></h1>
        <p className="hero-date">{weddingConfig.dateLabel}</p>
        {guestName && <p className="guest-label">Dear <strong>{guestName}</strong></p>}
        <button className="primary-button" type="button" onClick={onOpen}>
          Buka Undangan <span>↓</span>
        </button>
      </div>
      <p className="scroll-hint">Scroll to discover our story</p>
    </section>
  )
}
