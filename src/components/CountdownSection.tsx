import { useCountdown } from '../hooks/useWedding'
import { Reveal } from './Reveal'

interface CountdownSectionProps { targetDate: string }

export function CountdownSection({ targetDate }: CountdownSectionProps) {
  const countdown = useCountdown(targetDate)
  const items = [
    ['days', countdown.days],
    ['hours', countdown.hours],
    ['minutes', countdown.minutes],
    ['seconds', countdown.seconds],
  ]
  return (
    <section className="countdown-section">
      <Reveal className="countdown-inner">
        <span className="section-kicker">Counting the moments</span>
        <h2>Until we say <i>“I do.”</i></h2>
        <div className="countdown-grid">
          {items.map(([label, value]) => (
            <div className="countdown-item" key={label}>
              <strong>{String(value).padStart(2, '0')}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
