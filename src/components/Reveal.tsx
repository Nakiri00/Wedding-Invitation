import type { ReactNode } from 'react'
import { useReveal } from '../hooks/useWedding'

interface RevealProps {
  children: ReactNode
  className?: string
}

export function Reveal({ children, className = '' }: RevealProps) {
  const [setNode, visible] = useReveal<HTMLDivElement>()
  return (
    <div ref={setNode} className={`reveal ${visible ? 'is-visible' : ''} ${className}`}>
      {children}
    </div>
  )
}
