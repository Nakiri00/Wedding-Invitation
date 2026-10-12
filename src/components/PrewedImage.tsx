import { useState, type ImgHTMLAttributes } from 'react'

interface PrewedImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  src: string
  fallbackSrc: string
}

export function PrewedImage({
  src,
  fallbackSrc,
  ...props
}: PrewedImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  const displayedSrc = failedSrc === src ? fallbackSrc : src

  return (
    <img
      {...props}
      src={displayedSrc}
      onError={() => setFailedSrc(src)}
    />
  )
}
