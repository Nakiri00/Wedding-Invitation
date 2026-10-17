import { Reveal } from './Reveal'
import { weddingConfig } from '../data/wedding'
import { weddingAssets } from '../assets/wedding/weddingAssets'
import { prewedArt } from '../data/prewedArt'
import { PrewedImage } from './PrewedImage'

export function OpeningSection() {
  const { groom, bride } = weddingConfig.couple

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
            <b>{groom.shortName} <em>&amp;</em> {bride.shortName}</b>
          </div>

          <p className="hero-fullnames">
            {groom.name} <span aria-hidden="true">&amp;</span> {bride.name}
          </p>

          <div className="hero-event-meta" aria-label={`Tanggal pernikahan: ${weddingConfig.dateLabel}`}>
            <span className="hero-event-meta__label">Save the Date</span>
            <strong>{weddingConfig.dateLabel}</strong>
            <span className="hero-event-meta__time">{weddingConfig.timeLabel}</span>
          </div>
        </div>

        <div className="hero-art">
          <div className="art-frame">
            <PrewedImage
              className="art-scene"
              src={prewedArt.home}
              fallbackSrc={prewedArt.fallback.home}
              alt="Foto atau ilustrasi prewedding pasangan"
              width="600"
              height="800"
              decoding="async"
            />
          </div>
        </div>
      </Reveal>
    </section>
  )
}
