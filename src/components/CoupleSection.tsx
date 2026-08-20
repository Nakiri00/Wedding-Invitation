import { Reveal } from './Reveal'
import { weddingConfig } from '../data/wedding'
import { weddingAssets } from '../assets/wedding/weddingAssets'

export function CoupleSection() {
  const { bride, groom } = weddingConfig.couple

  return (
    <section className="section couple-section" id="couple">
      <img className="couple-canopy" src={weddingAssets.canopy.top} alt="" aria-hidden="true" />

      <div className="container">
        <Reveal className="section-heading centered-heading">
          <p className="eyebrow">The Bride &amp; Groom</p>
          <h2>Meet the happy couple</h2>
          <p>Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan pernikahan kami.</p>
        </Reveal>

        <div className="couple-grid editorial-couple-grid">
          <Reveal className="person-card editorial-person-card">
            <span className="person-index">01</span>
            <div className="person-botanical" aria-hidden="true">
              <img src={weddingAssets.lotus.medium} alt="" />
            </div>
            <p className="eyebrow">The Groom</p>
            <h3>{groom.name}</h3>
            <p>{groom.parents || 'Putra tercinta dari keluarga yang kami hormati.'}</p>
          </Reveal>

          <div className="couple-monogram" aria-hidden="true">
            <span>{groom.shortName.slice(0, 1)}</span>
            <i>&amp;</i>
            <span>{bride.shortName.slice(0, 1)}</span>
          </div>

          <Reveal className="person-card editorial-person-card editorial-person-card--right">
            <span className="person-index">02</span>
            <div className="person-botanical person-botanical--right" aria-hidden="true">
              <img src={weddingAssets.lotus.small} alt="" />
            </div>
            <p className="eyebrow">The Bride</p>
            <h3>{bride.name}</h3>
            <p>{bride.parents || 'Putri tercinta dari keluarga yang kami hormati.'}</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
