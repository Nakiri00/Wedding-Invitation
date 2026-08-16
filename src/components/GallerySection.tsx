import { Reveal } from './Reveal'
import { weddingConfig } from '../data/wedding'

const frames = ['portrait-one', 'portrait-two', 'portrait-three', 'portrait-four', 'portrait-five']

export function GallerySection() {
  return (
    <section className="section gallery-section" id="gallery">
      <Reveal className="section-heading centered">
        <span className="section-kicker">Little moments</span>
        <h2>Share the <i>joy</i></h2>
        <p>Setelah acara, mari abadikan momen bersama melalui album foto.</p>
      </Reveal>
      <Reveal className="gallery-grid">
        {frames.map((frame, index) => <div className={`gallery-frame ${frame}`} key={frame}><span>{String(index + 1).padStart(2, '0')}</span></div>)}
      </Reveal>
      <Reveal className="gallery-cta">
        <div><span className="section-kicker">Wedding album</span><h3>Upload foto favoritmu</h3><p>Album bersama dapat diarahkan ke platform photo-sharing pilihan client.</p></div>
        <a className="primary-button" href={weddingConfig.photoUrl} target="_blank" rel="noreferrer">Buka Album ↗</a>
      </Reveal>
    </section>
  )
}
