import { Reveal } from './Reveal'
import { weddingAssets } from '../assets/wedding/weddingAssets'

export function QuoteSection() {
  return (
    <section className="quote-section section-deep" aria-label="Kutipan pernikahan">
      <img className="quote-bg" src={weddingAssets.environment.background} alt="" aria-hidden="true" />
      <div className="quote-overlay" aria-hidden="true" />
      <Reveal className="container quote-card">
        <span className="quote-mark" aria-hidden="true">“</span>
        <p>
          And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy. Indeed in that are signs for a people who give thought.
        </p>
        <small>— Ar-Rum 21</small>
      </Reveal>
    </section>
  )
}
