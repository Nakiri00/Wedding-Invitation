import type { ReactNode } from 'react'
import { useReveal } from '../hooks/useWedding'

interface RevealProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export function Reveal({ children, className = '', style, ...props }: RevealProps) {
  const [setNode, visible] = useReveal<HTMLDivElement>()
  
  return (
    <div 
      ref={setNode} 
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={style} 
      {...props}    
    >
      {children}
    </div>
  )
}