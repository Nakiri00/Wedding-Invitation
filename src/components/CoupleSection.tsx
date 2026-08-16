import { Reveal } from './Reveal'
import { weddingConfig } from '../data/wedding'

export function CoupleSection() {
  const { bride, groom } = weddingConfig.couple
  return (
    <section className="section story-section" id="story">
      <Reveal className="section-heading">
        <span className="section-kicker">A little story</span>
        <h2>Two paths,<br /><i>one beautiful</i> journey.</h2>
        <p>Dengan penuh rasa syukur, kami mengundang Anda untuk menjadi bagian dari awal perjalanan baru kami.</p>
      </Reveal>
      <div className="couple-grid">
        <Reveal className="person-card">
          <div className="portrait portrait-groom"><span>AP</span></div>
          <p className="person-role">The Groom</p>
          <h3>{groom.name}</h3>
          <p>{groom.parents}</p>
        </Reveal>
        <div className="ampersand" aria-hidden="true">&</div>
        <Reveal className="person-card person-card-right">
          <div className="portrait portrait-bride"><span>AM</span></div>
          <p className="person-role">The Bride</p>
          <h3>{bride.name}</h3>
          <p>{bride.parents}</p>
        </Reveal>
      </div>
    </section>
  )
}
