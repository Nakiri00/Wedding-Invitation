import { useEffect } from 'react'
import type { RefObject } from 'react'

type NumberRange = readonly [number, number]
type FrameFactory = () => Keyframe[]

interface LoopOptions {
  duration: NumberRange
  pause: NumberRange
  initialDelay: NumberRange
  easing?: string
  hideBetween?: boolean
}

const randomBetween = ([min, max]: NumberRange) => Math.random() * (max - min) + min
const randomSigned = (min: number, max: number) => randomBetween([min, max]) * (Math.random() < 0.5 ? -1 : 1)

export function useAmbientBotanicalAnimation(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let disposed = false
    let sceneVisible = true
    const animations = new Set<Animation>()
    const timers = new Set<number>()

    const schedule = (callback: () => void, delay: number) => {
      const timerId = window.setTimeout(() => {
        timers.delete(timerId)
        if (!disposed) callback()
      }, delay)
      timers.add(timerId)
    }

    const loop = (element: HTMLElement, frames: FrameFactory, options: LoopOptions) => {
      const run = () => {
        if (disposed) return

        if (document.hidden || !sceneVisible) {
          schedule(run, 900)
          return
        }

        const animation = element.animate(frames(), {
          duration: randomBetween(options.duration),
          easing: options.easing ?? 'ease-in-out',
          fill: 'forwards',
        })

        animations.add(animation)

        const finish = () => {
          animations.delete(animation)
          if (options.hideBetween) element.style.opacity = '0'
          schedule(run, randomBetween(options.pause))
        }

        animation.addEventListener('finish', finish, { once: true })
        animation.addEventListener('cancel', () => animations.delete(animation), { once: true })
      }

      schedule(run, randomBetween(options.initialDelay))
    }

    root.querySelectorAll<HTMLElement>('.botanical-willow').forEach((element, index) => {
      loop(
        element,
        () => {
          const first = randomSigned(0.55, 1.45)
          const second = randomSigned(0.7, 1.85)
          const third = randomSigned(0.35, 1.1)
          const drift = randomSigned(1.5, 5)

          return [
            { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
            { transform: `translate3d(${drift}px, 1px, 0) rotate(${first}deg)`, offset: 0.28 },
            { transform: `translate3d(${-drift * 0.72}px, -1px, 0) rotate(${second}deg)`, offset: 0.62 },
            { transform: `translate3d(${drift * 0.25}px, 0, 0) rotate(${third}deg)`, offset: 0.84 },
            { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
          ]
        },
        {
          duration: [4200, 7200],
          pause: [80, 650],
          initialDelay: [2850 + index * 160, 3700 + index * 240],
          easing: 'cubic-bezier(.42, 0, .3, 1)',
        },
      )
    })

    root.querySelectorAll<HTMLElement>('.botanical-petal, .section-petal').forEach((element, index) => {
      loop(
        element,
        () => {
          const x = randomSigned(45, 135)
          const y = randomBetween([90, 220])
          const rotation = randomSigned(110, 340)
          const startX = randomSigned(8, 42)
          const sway = randomSigned(18, 54)
          const startScale = randomBetween([0.72, 0.96])
          const endScale = randomBetween([0.82, 1.08])
          const peakOpacity = randomBetween([0.52, 0.88])

          return [
            {
              opacity: 0,
              transform: `translate3d(${startX}px, -42px, 0) rotate(${randomSigned(8, 35)}deg) scale(${startScale})`,
            },
            {
              opacity: peakOpacity,
              transform: `translate3d(${startX + sway}px, ${y * 0.2}px, 0) rotate(${rotation * 0.25}deg) scale(1)`,
              offset: 0.2,
            },
            {
              opacity: peakOpacity * 0.88,
              transform: `translate3d(${x * 0.35}px, ${y * 0.5}px, 0) rotate(${rotation * 0.58}deg) scale(1.02)`,
              offset: 0.56,
            },
            {
              opacity: peakOpacity * 0.62,
              transform: `translate3d(${x + sway * 0.2}px, ${y * 0.82}px, 0) rotate(${rotation * 0.84}deg) scale(.98)`,
              offset: 0.82,
            },
            {
              opacity: 0,
              transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${endScale})`,
            },
          ]
        },
        {
          duration: [4400, 7900],
          pause: [450, 3200],
          initialDelay: [3350 + (index % 4) * 480, 5200 + (index % 5) * 760],
          easing: 'cubic-bezier(.28,.02,.24,1)',
          hideBetween: true,
        },
      )
    })

    const syncPlayback = () => {
      const shouldPause = document.hidden || !sceneVisible
      animations.forEach((animation) => {
        if (shouldPause) animation.pause()
        else animation.play()
      })
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        sceneVisible = entry?.isIntersecting ?? false
        syncPlayback()
      },
      { threshold: 0.05 },
    )

    observer.observe(root)
    document.addEventListener('visibilitychange', syncPlayback)

    return () => {
      disposed = true
      observer.disconnect()
      document.removeEventListener('visibilitychange', syncPlayback)
      timers.forEach((timerId) => window.clearTimeout(timerId))
      animations.forEach((animation) => animation.cancel())
      root.querySelectorAll<HTMLElement>('.botanical-petal, .section-petal').forEach((element) => {
        element.style.removeProperty('opacity')
      })
      timers.clear()
      animations.clear()
    }
  }, [rootRef])
}
