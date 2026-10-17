import {
  useEffect,
  useState,
  type RefObject,
} from 'react';

interface AssetReadyOptions {
  minimumDuration?: number;
  timeoutMs?: number;
}

function delay(duration: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

function decodeImage(image: HTMLImageElement) {
  if (!image.decode) {
    return Promise.resolve();
  }

  return image.decode().catch(() => undefined);
}

function waitForImage(image: HTMLImageElement) {
  if (image.complete) {
    return decodeImage(image);
  }

  return new Promise<void>((resolve) => {
    const finish = () => {
      image.removeEventListener('load', finish);
      image.removeEventListener('error', finish);

      void decodeImage(image).finally(() => resolve());
    };

    image.addEventListener('load', finish, { once: true });
    image.addEventListener('error', finish, { once: true });
  });
}

export function useContainerAssetsReady(
  containerRef: RefObject<HTMLElement | null>,
  {
    minimumDuration = 600,
    timeoutMs = 8000,
  }: AssetReadyOptions = {},
) {
  const [readyConfig, setReadyConfig] = useState<{
    containerRef: RefObject<HTMLElement | null>;
    minimumDuration: number;
    timeoutMs: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;

    const startedAt = performance.now();

    frame = requestAnimationFrame(() => {
      const container = containerRef.current;

      if (!container) {
        setReadyConfig({ containerRef, minimumDuration, timeoutMs });
        return;
      }

      const images = Array.from(
        container.querySelectorAll<HTMLImageElement>('img'),
      );

      const imageTasks = images.map(waitForImage);

      const fontTask = document.fonts
        ? document.fonts.ready
            .then(() => undefined)
            .catch(() => undefined)
        : Promise.resolve();

      const assetTask = Promise.all([
        ...imageTasks,
        fontTask,
      ]).then(() => undefined);

      void Promise.race([
        assetTask,
        delay(timeoutMs),
      ]).then(async () => {
        const elapsed = performance.now() - startedAt;
        const remaining = Math.max(
          0,
          minimumDuration - elapsed,
        );

        if (remaining > 0) {
          await delay(remaining);
        }

        if (!cancelled) {
          setReadyConfig({ containerRef, minimumDuration, timeoutMs });
        }
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [containerRef, minimumDuration, timeoutMs]);

  return Boolean(
    readyConfig &&
      readyConfig.containerRef === containerRef &&
      readyConfig.minimumDuration === minimumDuration &&
      readyConfig.timeoutMs === timeoutMs,
  );
}