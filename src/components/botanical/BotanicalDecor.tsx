import { useRef } from 'react'
import './BotanicalDecor.css'
import { weddingAssets } from '../../assets/wedding/weddingAssets'
import { useAmbientBotanicalAnimation } from '../../hooks/useAmbientBotanicalAnimation'

interface BotanicalDecorProps {
  variant?: 'hero' | 'story' | 'event' | 'rsvp' | 'messages' | 'gallery'
}

const heroPetals = [
  { className: 'hero-petal-lotus-one', kind: 'lotus', src: weddingAssets.petals.lotus.one },
  { className: 'hero-petal-lotus-two', kind: 'lotus', src: weddingAssets.petals.lotus.two },
  { className: 'hero-petal-lotus-three', kind: 'lotus', src: weddingAssets.petals.lotus.three },
  { className: 'hero-petal-wisteria-one', kind: 'wisteria', src: weddingAssets.petals.wisteria.one },
  { className: 'hero-petal-wisteria-two', kind: 'wisteria', src: weddingAssets.petals.wisteria.two },
  { className: 'hero-petal-wisteria-three', kind: 'wisteria', src: weddingAssets.petals.wisteria.three },
] as const

function HeroBotanicalDecor() {
  const rootRef = useRef<HTMLDivElement>(null)
  useAmbientBotanicalAnimation(rootRef)

  return (
    <div ref={rootRef} className="botanical botanical-hero" aria-hidden="true">
      <img className="hero-scene-background" src={weddingAssets.environment.background} alt="" />
      <div className="hero-scene-atmosphere" />

      {/* One near-field canopy is enough: the background already contains distant willow/wisteria. */}
      <img className="botanical-canopy hero-canopy" src={weddingAssets.canopy.top} alt="" />

      {/* The swan is intentionally isolated in open water and hidden on narrow screens. */}
      <div className="hero-swan">
        <img src={weddingAssets.animals.swan} alt="" />
      </div>

      {/* Keep airborne decoration sparse so the center copy remains readable and the pond stays believable. */}
      {heroPetals.map(({ className, kind, src }) => (
        <img
          key={className}
          className={`botanical-petal hero-petal hero-petal-${kind} ${className}`}
          src={src}
          alt=""
        />
      ))}
    </div>
  )
}

function SectionBotanicalDecor({ variant }: { variant: Exclude<BotanicalDecorProps['variant'], 'hero' | undefined> }) {
  const rootRef = useRef<HTMLDivElement>(null)
  useAmbientBotanicalAnimation(rootRef)

  const decorationByVariant = {
    story: (
      <>
        <img className="section-botanical-image section-lotus section-lotus-left" src={weddingAssets.lotus.small} alt="" />
        <img className="section-botanical-image section-leaf section-leaf-right" src={weddingAssets.leaves.one} alt="" />
        <img className="section-botanical-image section-petal section-petal-top" src={weddingAssets.petals.wisteria.two} alt="" />
        <img className="section-botanical-image section-petal section-petal-side" src={weddingAssets.petals.lotus.one} alt="" />
      </>
    ),
    event: (
      <>
        <img className="section-botanical-image section-lotus section-lotus-right" src={weddingAssets.lotus.medium} alt="" />
        <img className="section-botanical-image section-leaf section-leaf-left" src={weddingAssets.leaves.two} alt="" />
        <img className="section-botanical-image section-petal section-petal-top-right" src={weddingAssets.petals.wisteria.three} alt="" />
        <img className="section-botanical-image section-petal section-petal-bottom-left" src={weddingAssets.petals.lotus.two} alt="" />
      </>
    ),
    rsvp: (
      <>
        <img className="section-botanical-image section-lotus section-lotus-left" src={weddingAssets.lotus.large} alt="" />
        <img className="section-botanical-image section-lotus section-lotus-right-small" src={weddingAssets.lotus.bud} alt="" />
        <img className="section-botanical-image section-leaf section-leaf-right" src={weddingAssets.leaves.five} alt="" />
        <img className="section-botanical-image section-petal section-petal-top-right" src={weddingAssets.petals.wisteria.one} alt="" />
      </>
    ),
    messages: (
      <>
        <img className="section-botanical-image section-lotus section-lotus-right" src={weddingAssets.lotus.small} alt="" />
        <img className="section-botanical-image section-leaf section-leaf-left" src={weddingAssets.leaves.three} alt="" />
        <img className="section-botanical-image section-petal section-petal-top" src={weddingAssets.petals.wisteria.two} alt="" />
        <img className="section-botanical-image section-petal section-petal-bottom-right" src={weddingAssets.petals.lotus.three} alt="" />
      </>
    ),
    gallery: (
      <>
        <img className="section-botanical-image section-lotus section-lotus-left" src={weddingAssets.lotus.medium} alt="" />
        <img className="section-botanical-image section-leaf section-leaf-right" src={weddingAssets.leaves.six} alt="" />
        <img className="section-botanical-image section-petal section-petal-top-right" src={weddingAssets.petals.wisteria.three} alt="" />
        <img className="section-botanical-image section-petal section-petal-side" src={weddingAssets.petals.lotus.one} alt="" />
      </>
    ),
  } as const

  return (
    <div ref={rootRef} className={`botanical botanical-section botanical-${variant}`} aria-hidden="true">
      {decorationByVariant[variant]}
    </div>
  )
}

export function BotanicalDecor({ variant = 'hero' }: BotanicalDecorProps) {
  if (variant === 'hero') return <HeroBotanicalDecor />
  return <SectionBotanicalDecor variant={variant} />
}
