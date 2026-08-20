import type { CSSProperties } from 'react'
import { weddingAssets } from '../assets/wedding/weddingAssets'

type FallingPetalsMode = 'cover' | 'global'

interface FallingPetalsProps {
  mode: FallingPetalsMode
}

type PetalKind = 'lotus' | 'wisteria'

interface PetalSpec {
  kind: PetalKind
  variant: 1 | 2 | 3
  x: number
  drift: number
  size: number
  duration: number
  delay: number
  rotation: number
  opacity: number
}

const petalSources = {
  lotus: [
    weddingAssets.petals.lotus.one,
    weddingAssets.petals.lotus.two,
    weddingAssets.petals.lotus.three,
  ],
  wisteria: [
    weddingAssets.petals.wisteria.one,
    weddingAssets.petals.wisteria.two,
    weddingAssets.petals.wisteria.three,
  ],
} as const

// The cover intentionally feels a little richer than before, but the center
// remains relatively calm so the couple names and CTA stay readable.
const coverPetals: PetalSpec[] = [
  { kind: 'wisteria', variant: 1, x: 4, drift: 42, size: 13, duration: 11.6, delay: -2.2, rotation: 330, opacity: .58 },
  { kind: 'lotus', variant: 2, x: 10, drift: -34, size: 24, duration: 14.8, delay: -8.6, rotation: 430, opacity: .50 },
  { kind: 'wisteria', variant: 3, x: 17, drift: 36, size: 12, duration: 10.9, delay: -6.1, rotation: 360, opacity: .56 },
  { kind: 'lotus', variant: 1, x: 25, drift: -30, size: 22, duration: 15.5, delay: -12.3, rotation: 470, opacity: .44 },
  { kind: 'wisteria', variant: 2, x: 34, drift: 28, size: 11, duration: 12.2, delay: -4.4, rotation: 390, opacity: .48 },
  { kind: 'lotus', variant: 3, x: 43, drift: -22, size: 20, duration: 16.1, delay: -1.5, rotation: 420, opacity: .36 },
  { kind: 'wisteria', variant: 1, x: 57, drift: 24, size: 11, duration: 11.8, delay: -9.8, rotation: 350, opacity: .40 },
  { kind: 'lotus', variant: 2, x: 66, drift: -32, size: 22, duration: 15.7, delay: -5.7, rotation: 440, opacity: .42 },
  { kind: 'wisteria', variant: 3, x: 74, drift: 34, size: 12, duration: 10.7, delay: -7.4, rotation: 375, opacity: .54 },
  { kind: 'lotus', variant: 1, x: 82, drift: -40, size: 25, duration: 14.9, delay: -3.3, rotation: 455, opacity: .48 },
  { kind: 'wisteria', variant: 2, x: 89, drift: 31, size: 13, duration: 11.4, delay: -10.6, rotation: 340, opacity: .58 },
  { kind: 'lotus', variant: 3, x: 96, drift: -26, size: 21, duration: 15.2, delay: -6.9, rotation: 420, opacity: .45 },
  { kind: 'wisteria', variant: 1, x: 13, drift: 46, size: 10, duration: 13.1, delay: -11.1, rotation: 410, opacity: .46 },
  { kind: 'wisteria', variant: 3, x: 87, drift: -38, size: 10, duration: 12.6, delay: -1.2, rotation: 395, opacity: .47 },
]

// This layer lives at viewport level after the invitation opens, so the effect
// naturally continues through every section while the guest scrolls.
const globalPetals: PetalSpec[] = [
  { kind: 'wisteria', variant: 1, x: 2, drift: 38, size: 11, duration: 12.4, delay: -2.1, rotation: 340, opacity: .42 },
  { kind: 'lotus', variant: 2, x: 7, drift: -34, size: 21, duration: 15.7, delay: -12.8, rotation: 440, opacity: .34 },
  { kind: 'wisteria', variant: 3, x: 12, drift: 44, size: 10, duration: 11.3, delay: -7.2, rotation: 385, opacity: .46 },
  { kind: 'lotus', variant: 1, x: 18, drift: -28, size: 19, duration: 16.5, delay: -4.9, rotation: 470, opacity: .31 },
  { kind: 'wisteria', variant: 2, x: 24, drift: 31, size: 10, duration: 12.0, delay: -10.4, rotation: 355, opacity: .39 },
  { kind: 'lotus', variant: 3, x: 30, drift: -25, size: 18, duration: 15.2, delay: -1.6, rotation: 425, opacity: .27 },
  { kind: 'wisteria', variant: 1, x: 37, drift: 27, size: 9, duration: 11.8, delay: -6.5, rotation: 370, opacity: .34 },
  { kind: 'lotus', variant: 2, x: 43, drift: -22, size: 17, duration: 16.8, delay: -13.7, rotation: 450, opacity: .24 },
  { kind: 'wisteria', variant: 3, x: 49, drift: 20, size: 9, duration: 12.7, delay: -3.7, rotation: 330, opacity: .28 },
  { kind: 'lotus', variant: 1, x: 55, drift: -21, size: 17, duration: 15.9, delay: -8.9, rotation: 460, opacity: .24 },
  { kind: 'wisteria', variant: 2, x: 61, drift: 26, size: 9, duration: 11.9, delay: -11.6, rotation: 360, opacity: .34 },
  { kind: 'lotus', variant: 3, x: 67, drift: -30, size: 18, duration: 16.2, delay: -5.4, rotation: 430, opacity: .28 },
  { kind: 'wisteria', variant: 1, x: 73, drift: 33, size: 10, duration: 12.3, delay: -1.1, rotation: 390, opacity: .40 },
  { kind: 'lotus', variant: 2, x: 79, drift: -37, size: 20, duration: 15.5, delay: -9.7, rotation: 445, opacity: .32 },
  { kind: 'wisteria', variant: 3, x: 84, drift: 40, size: 10, duration: 11.1, delay: -6.8, rotation: 350, opacity: .44 },
  { kind: 'lotus', variant: 1, x: 89, drift: -42, size: 21, duration: 16.0, delay: -14.3, rotation: 475, opacity: .35 },
  { kind: 'wisteria', variant: 2, x: 94, drift: 35, size: 11, duration: 12.6, delay: -4.2, rotation: 380, opacity: .46 },
  { kind: 'lotus', variant: 3, x: 98, drift: -24, size: 18, duration: 15.1, delay: -10.8, rotation: 420, opacity: .33 },
  { kind: 'wisteria', variant: 1, x: 15, drift: -30, size: 9, duration: 13.4, delay: -12.0, rotation: 400, opacity: .37 },
  { kind: 'lotus', variant: 2, x: 26, drift: 34, size: 16, duration: 17.1, delay: -6.0, rotation: 455, opacity: .23 },
  { kind: 'wisteria', variant: 3, x: 76, drift: -33, size: 9, duration: 13.0, delay: -8.1, rotation: 365, opacity: .37 },
  { kind: 'lotus', variant: 1, x: 92, drift: 26, size: 18, duration: 16.6, delay: -2.9, rotation: 440, opacity: .30 },
]

export function FallingPetals({ mode }: FallingPetalsProps) {
  const petals = mode === 'cover' ? coverPetals : globalPetals

  return (
    <div className={`falling-petals falling-petals--${mode}`} aria-hidden="true">
      {petals.map((petal, index) => {
        const source = petalSources[petal.kind][petal.variant - 1]
        const style = {
          '--petal-x': `${petal.x}%`,
          '--petal-drift-a': `${petal.drift * 0.42}px`,
          '--petal-drift-b': `${petal.drift * -0.26}px`,
          '--petal-drift-c': `${petal.drift}px`,
          '--petal-drift-end': `${petal.drift * 0.18}px`,
          '--petal-size': `${petal.size}px`,
          '--petal-duration': `${petal.duration}s`,
          '--petal-delay': `${petal.delay}s`,
          '--petal-rotation-a': `${petal.rotation * 0.28}deg`,
          '--petal-rotation-b': `${petal.rotation * 0.56}deg`,
          '--petal-rotation-c': `${petal.rotation * 0.8}deg`,
          '--petal-rotation-end': `${petal.rotation}deg`,
          '--petal-opacity': petal.opacity,
        } as CSSProperties

        return (
          <span
            key={`${mode}-${petal.kind}-${index}`}
            className={`falling-petal falling-petal--${petal.kind}`}
            style={style}
          >
            <img src={source} alt="" />
          </span>
        )
      })}
    </div>
  )
}
