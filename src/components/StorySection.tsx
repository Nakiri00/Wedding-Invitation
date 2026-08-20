import { Reveal } from './Reveal'
import { weddingAssets } from '../assets/wedding/weddingAssets'

const chapters = [
  {
    year: '01',
    title: 'First Chapter',
    text: 'Pertemuan yang sederhana tumbuh menjadi cerita yang berarti, satu percakapan dan satu langkah pada satu waktu.',
  },
  {
    year: '02',
    title: 'A Promise',
    text: 'Kami memilih untuk tumbuh bersama, saling menjaga, dan menyambut masa depan dengan keyakinan yang sama.',
  },
  {
    year: '2026',
    title: 'Forever Starts Here',
    text: 'Dengan penuh syukur, kami memulai babak baru dan berharap Anda menjadi bagian dari hari istimewa ini.',
  },
]

export function StorySection() {
  return (
    <section className="section love-story-section" id="story">
      <Reveal className="container story-grid">
        <div className="story-art" aria-hidden="true">
          <img className="story-art-image" src={weddingAssets.environment.background} alt="" />
          <div className="story-art-shade" />
          <img className="story-corner" src={weddingAssets.environment.pondCornerLeft} alt="" />
        </div>

        <div className="story-copy">
          <p className="eyebrow">Our Story</p>
          <h2>Every love story is beautiful. This one is ours.</h2>
          <div className="timeline">
            {chapters.map((chapter) => (
              <article key={chapter.year}>
                <span>{chapter.year}</span>
                <div>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
