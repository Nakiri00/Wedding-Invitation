import { Reveal } from './Reveal'
import { weddingConfig } from '../data/wedding'
import { weddingAssets } from '../assets/wedding/weddingAssets'

const frames = [
  { className: 'gallery-frame--tall', position: '24% 52%' },
  { className: 'gallery-frame--small', position: '52% 48%' },
  { className: 'gallery-frame--small', position: '76% 48%' },
  { className: 'gallery-frame--wide', position: '58% 64%' },
]

export function GallerySection() {
  return (
    <section className="section gallery-section" id="gallery">
      <div className="container">
        <Reveal className="section-heading centered-heading">
          <p className="eyebrow">Little Moments</p>
          <h2>Share the joy</h2>
          <p>Setelah acara, mari abadikan momen bersama melalui album foto pernikahan.</p>
        </Reveal>

        <Reveal className="editorial-gallery-grid">
          {frames.map((frame, index) => (
            <div
              className={`gallery-frame ${frame.className}`}
              key={`${frame.className}-${index}`}
              style={{ backgroundImage: `url(${weddingAssets.environment.background})`, backgroundPosition: frame.position }}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
            </div>
          ))}
        </Reveal>

        <Reveal className="gallery-cta editorial-gallery-cta">
          <div>
            <p className="eyebrow">Wedding Album</p>
            <h3>Upload foto favoritmu</h3>
            <p>Bagikan foto dan momen terbaik yang kamu abadikan di hari pernikahan kami.</p>
          </div>
          <a className="cover-primary-btn gallery-button" href={weddingConfig.photoUrl} target="_blank" rel="noreferrer">
            <span>Buka Album</span><span aria-hidden="true">↗</span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
