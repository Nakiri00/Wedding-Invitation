import { Reveal } from './Reveal'
import { weddingConfig } from '../data/wedding'
import { weddingAssets } from '../assets/wedding/weddingAssets'

export function OpeningSection() {
  return (
    <section className="section invitation-hero" id="home">
      <img className="top-canopy" src={weddingAssets.canopy.top} alt="" aria-hidden="true" />

      <Reveal className="container hero-grid">
        <div className="hero-copy editorial-copy">
          <p className="eyebrow">A Celebration of Love</p>
          <h1>
            Two hearts,<br />
            <span>one beautiful beginning.</span>
          </h1>
          <p className="lead">
            Dengan penuh sukacita, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan menjadi bagian dari hari bahagia kami.
          </p>
          <div className="signature">
            {weddingConfig.couple.groom.shortName} <em>&amp;</em> {weddingConfig.couple.bride.shortName}
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="art-frame">
            <img className="art-scene" src={weddingAssets.environment.background} alt="" />
            <div className="art-scene-veil" />
            <img className="art-swan" src={weddingAssets.animals.swan} alt="" />
          </div>
        </div>
      </Reveal>
    </section>
  )
}
