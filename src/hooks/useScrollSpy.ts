import { useCallback, useEffect, useRef, useState } from 'react'

interface UseScrollSpyOptions {
  enabled?: boolean
  rootMargin?: string
}

export function useScrollSpy(
  sectionIds: readonly string[],
  { enabled = true, rootMargin = '-28% 0px -58% 0px' }: UseScrollSpyOptions = {},
) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? '')
  const lockedSectionRef = useRef<string | null>(null)
  const unlockTimerRef = useRef<number | null>(null)

  const activateSection = useCallback((id: string) => {
    lockedSectionRef.current = id
    setActiveSection(id)

    if (unlockTimerRef.current !== null) {
      window.clearTimeout(unlockTimerRef.current)
    }

    // Fallback in case a browser does not deliver the expected intersection
    // update during a very long smooth scroll.
    unlockTimerRef.current = window.setTimeout(() => {
      lockedSectionRef.current = null
      unlockTimerRef.current = null
    }, 2200)
  }, [])

  useEffect(() => {
    if (!enabled || sectionIds.length === 0) return

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section))

    if (sections.length === 0) return

    const visibility = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
        })

        const lockedId = lockedSectionRef.current
        if (lockedId) {
          const lockedSection = document.getElementById(lockedId)

          if (lockedSection) {
            const rect = lockedSection.getBoundingClientRect()
            const activationLine = window.innerHeight * 0.32
            const targetReached = rect.top <= activationLine && rect.bottom >= activationLine

            if (!targetReached) {
              return
            }
          }

          lockedSectionRef.current = null
          if (unlockTimerRef.current !== null) {
            window.clearTimeout(unlockTimerRef.current)
            unlockTimerRef.current = null
          }
        }

        const visibleSection = sections
          .map((section) => ({
            id: section.id,
            ratio: visibility.get(section.id) ?? 0,
            distance: Math.abs(section.getBoundingClientRect().top - window.innerHeight * 0.32),
          }))
          .filter((section) => section.ratio > 0)
          .sort((a, b) => {
            if (Math.abs(b.ratio - a.ratio) > 0.08) return b.ratio - a.ratio
            return a.distance - b.distance
          })[0]

        if (visibleSection) {
          setActiveSection(visibleSection.id)
        }
      },
      {
        root: null,
        rootMargin,
        threshold: [0, 0.08, 0.2, 0.4, 0.65],
      },
    )

    sections.forEach((section) => observer.observe(section))

    return () => {
      observer.disconnect()
      if (unlockTimerRef.current !== null) {
        window.clearTimeout(unlockTimerRef.current)
        unlockTimerRef.current = null
      }
    }
  }, [enabled, rootMargin, sectionIds])

  return { activeSection, activateSection }
}
