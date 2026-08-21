import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { weddingConfig } from '../data/wedding'
import { Reveal } from './Reveal'

// Fitur opsional upload foto tamu tetap disimpan di:
// src/components/GuestPhotoUpload.tsx
//
// Aktifkan kembali jika mempelai meminta:
// import { GuestPhotoUpload } from './GuestPhotoUpload'

type GalleryPhoto =
  (typeof weddingConfig.gallery)[number]

export function GallerySection() {
  const [selectedPhoto, setSelectedPhoto] =
    useState<GalleryPhoto | null>(null)

  useEffect(() => {
    if (!selectedPhoto) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedPhoto(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedPhoto])

  return (
    <section className="section gallery-section" id="gallery">
      <div className="container">
        <Reveal className="section-heading centered-heading">
          <p className="eyebrow">Captured With Love</p>

          <h2>Galeri kebahagiaan kami</h2>

          <p>
            Sepenggal perjalanan dan momen indah yang membawa kami
            menuju hari bahagia ini.
          </p>
        </Reveal>

        <Reveal className="couple-gallery">
          {weddingConfig.gallery.map((photo, index) => (
            <button
              className={`couple-gallery__item couple-gallery__item--${
                (index % 6) + 1
              }`}
              type="button"
              key={photo.src}
              onClick={() => setSelectedPhoto(photo)}
              aria-label={`Buka ${photo.alt}`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
              />

              <span className="couple-gallery__overlay">
                Lihat foto
              </span>
            </button>
          ))}
        </Reveal>

        {/*
          FITUR OPSIONAL: UPLOAD FOTO DARI TAMU

          Kode upload tamu tetap disimpan di GuestPhotoUpload.tsx.
          Jika mempelai menginginkan fitur ini, aktifkan import dan
          komponen berikut:

          <GuestPhotoUpload />
        */}
      </div>

      {selectedPhoto &&
        createPortal(
          <div
            className="gallery-lightbox"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedPhoto(null)
              }
            }}
          >
            <div
              className="gallery-lightbox__content"
              role="dialog"
              aria-modal="true"
              aria-label={selectedPhoto.alt}
            >
              <button
                className="gallery-lightbox__close"
                type="button"
                onClick={() => setSelectedPhoto(null)}
                aria-label="Tutup foto"
              >
                ×
              </button>

              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
              />

              <p>{selectedPhoto.alt}</p>
            </div>
          </div>,
          document.body,
        )}
    </section>
  )
}