import { weddingConfig } from '../data/wedding'
import { Reveal } from './Reveal'

// Fitur opsional upload foto tamu tetap disimpan di:
// src/components/GuestPhotoUpload.tsx
//
// Aktifkan kembali jika mempelai meminta:
// import { GuestPhotoUpload } from './GuestPhotoUpload'

// type GalleryPhoto =
//   (typeof weddingConfig.gallery)[number]

export function GallerySection() {
  return (
    <section
      className="section gallery-section"
      id="gallery"
    >
      <div className="container">
        <Reveal className="section-heading centered-heading">
          <p className="eyebrow">
            Captured With Love
          </p>

          <h2>Galeri kebahagiaan kami</h2>

          <p>
            Sepenggal perjalanan dan momen indah yang
            membawa kami menuju hari bahagia ini.
          </p>

          <div
            className="gallery-heading-ornament"
            aria-hidden="true"
          >
            <span />
            <strong>♡</strong>
            <span />
          </div>
        </Reveal>

        <Reveal
          className="couple-gallery"
          aria-label="Galeri foto Konan dan Nilo"
        >
          {weddingConfig.gallery.map((photo, index) => (
            <figure
              className={`couple-gallery__item couple-gallery__item--${
                (index % 6) + 1
              }`}
              key={photo.src}
            >
              <div className="couple-gallery__frame">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              </div>
            </figure>
          ))}
        </Reveal>

        <Reveal className="gallery-closing">
          <span aria-hidden="true">✦</span>

          <p>
            Setiap foto menyimpan cerita, setiap momen
            membawa kami semakin dekat pada hari bahagia.
          </p>

          <strong>
            {weddingConfig.couple.groom.shortName}
            <em>&amp;</em>
            {weddingConfig.couple.bride.shortName}
          </strong>
        </Reveal>

        {/*
          FITUR OPSIONAL: UPLOAD FOTO TAMU

          Implementasi upload tetap disimpan pada:
          src/components/GuestPhotoUpload.tsx

          Aktifkan kembali jika diminta oleh mempelai:
          <GuestPhotoUpload />
        */}
      </div>
    </section>
  )
}