import {
  useCallback,
  useEffect,
  useState,
} from 'react';

interface UseScrollSpyOptions {
  enabled?: boolean;
}

export function useScrollSpy(
  sectionIds: readonly string[],
  options: UseScrollSpyOptions = {},
) {
  const { enabled = true } = options;

  const [activeSection, setActiveSection] = useState(
    sectionIds[0] ?? '',
  );

  const activateSection = useCallback((id: string) => {
    setActiveSection(id);
  }, []);

  useEffect(() => {
    if (!enabled || sectionIds.length === 0) {
      return;
    }

    let animationFrame = 0;

    const detectActiveSection = () => {
      const viewportAnchor = window.innerHeight * 0.35;

      let selectedSection = sectionIds[0];
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const id of sectionIds) {
        const element = document.getElementById(id);

        if (!element) continue;

        const rect = element.getBoundingClientRect();
        if (
          rect.top <= viewportAnchor &&
          rect.bottom >= viewportAnchor
        ) {
          selectedSection = id;
          break;
        }

        const distance = Math.abs(rect.top - viewportAnchor);

        if (distance < closestDistance) {
          closestDistance = distance;
          selectedSection = id;
        }
      }

      setActiveSection(selectedSection);
    };

    const scheduleDetection = () => {
      cancelAnimationFrame(animationFrame);

      animationFrame = requestAnimationFrame(
        detectActiveSection,
      );
    };

    window.addEventListener('scroll', scheduleDetection, {
      passive: true,
    });

    window.addEventListener('resize', scheduleDetection);

    animationFrame = requestAnimationFrame(() => {
      detectActiveSection();

      animationFrame = requestAnimationFrame(
        detectActiveSection,
      );
    });

    const restoreTimer = window.setTimeout(
      detectActiveSection,
      300,
    );

    return () => {
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(restoreTimer);

      window.removeEventListener(
        'scroll',
        scheduleDetection,
      );

      window.removeEventListener(
        'resize',
        scheduleDetection,
      );
    };
  }, [enabled, sectionIds]);

  return {
    activeSection,
    activateSection,
  };
}