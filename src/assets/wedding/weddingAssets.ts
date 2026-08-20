import heroPondWillowWisteriaBridge from './environment/backgrounds/hero-pond-willow-wisteria-bridge.png'
import whiteLotusPondBorder from './environment/foreground/white-lotus-pond-border.png'
import whiteLotusPondCornerLeft from './environment/foreground/white-lotus-pond-corner-left.png'
import whiteLotusPondCornerRight from './environment/foreground/white-lotus-pond-corner-right.png'

import willowWisteriaCanopyTop from './botanical/canopy/willow-wisteria-canopy-top.png'

import whiteLotusLarge from './botanical/lotus/white-lotus-large.png'
import whiteLotusMedium from './botanical/lotus/white-lotus-medium.png'
import whiteLotusSmall from './botanical/lotus/white-lotus-small.png'
import whiteLotusBud from './botanical/lotus/white-lotus-bud.png'
import whiteLotusSeedpod from './botanical/lotus/white-lotus-seedpod.png'

import lotusLeaf01 from './botanical/leaves/lotus-leaf-01.png'
import lotusLeaf02 from './botanical/leaves/lotus-leaf-02.png'
import lotusLeaf03 from './botanical/leaves/lotus-leaf-03.png'
import lotusLeaf04 from './botanical/leaves/lotus-leaf-04.png'
import lotusLeaf05 from './botanical/leaves/lotus-leaf-05.png'
import lotusLeaf06 from './botanical/leaves/lotus-leaf-06.png'
import lotusLeaf07 from './botanical/leaves/lotus-leaf-07.png'
import lotusLeaf08 from './botanical/leaves/lotus-leaf-08.png'

import lotusPetal01 from './botanical/petals/lotus-petal-01.png'
import lotusPetal02 from './botanical/petals/lotus-petal-02.png'
import lotusPetal03 from './botanical/petals/lotus-petal-03.png'
import wisteriaPetal01 from './botanical/petals/wisteria-petal-01.png'
import wisteriaPetal02 from './botanical/petals/wisteria-petal-02.png'
import wisteriaPetal03 from './botanical/petals/wisteria-petal-03.png'

import whiteSwan from './animals/white-swan.png'

export const weddingAssets = {
  environment: {
    background: heroPondWillowWisteriaBridge,
    pondBorder: whiteLotusPondBorder,
    pondCornerLeft: whiteLotusPondCornerLeft,
    pondCornerRight: whiteLotusPondCornerRight,
  },
  canopy: {
    top: willowWisteriaCanopyTop,
  },
  lotus: {
    large: whiteLotusLarge,
    medium: whiteLotusMedium,
    small: whiteLotusSmall,
    bud: whiteLotusBud,
    seedpod: whiteLotusSeedpod,
  },
  leaves: {
    one: lotusLeaf01,
    two: lotusLeaf02,
    three: lotusLeaf03,
    four: lotusLeaf04,
    five: lotusLeaf05,
    six: lotusLeaf06,
    seven: lotusLeaf07,
    eight: lotusLeaf08,
  },
  petals: {
    lotus: {
      one: lotusPetal01,
      two: lotusPetal02,
      three: lotusPetal03,
    },
    wisteria: {
      one: wisteriaPetal01,
      two: wisteriaPetal02,
      three: wisteriaPetal03,
    },
  },
  animals: {
    swan: whiteSwan,
  },
} as const
