import { Reveal } from './Reveal'
import { weddingConfig } from '../data/wedding'
import { weddingAssets } from '../assets/wedding/weddingAssets'
import { prewedArt } from '../data/prewedArt'
import './styling/CoupleSection.css'

export function CoupleSection() {
  const { bride, groom } = weddingConfig.couple

  const people = [
    {
      ...groom,
      role: 'The Groom',
      image: prewedArt.groom,
      alt: 'Ilustrasi mempelai pria',
    },
    {
      ...bride,
      role: 'The Bride',
      image: prewedArt.bride,
      alt: 'Ilustrasi mempelai wanita',
    },
  ]

  return (
    <section className="section couple-section" id="couple">
      <img
        className="couple-canopy"
        src={weddingAssets.canopy.top}
        alt=""
        aria-hidden="true"
      />

      <div className="container">
        <Reveal className="section-heading centered-heading">
          <p className="eyebrow">The Bride &amp; Groom</p>

          <h2>Meet the happy couple</h2>

          <p>
            Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa,
            kami bermaksud menyelenggarakan pernikahan kami.
          </p>
        </Reveal>

        <div className="couple-portraits">
          {people.map((person) => (
            <Reveal
              key={person.role}
              className="couple-profile"
            >
              <div className="couple-profile__portrait">
                <img
                  src={person.image}
                  alt={person.alt}
                  width="600"
                  height="800"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="couple-profile__details">
                <p className="couple-profile__role">
                  {person.role}
                </p>

                <h3>{person.name}</h3>

                <span
                  className="couple-profile__ornament"
                  aria-hidden="true"
                >
                  ✦
                </span>

                <p className="couple-profile__parents">
                  {person.parents}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}