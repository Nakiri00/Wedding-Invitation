import type { CSSProperties } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  style?: CSSProperties
  className?: string
}

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Cari...', 
  style, 
  className 
}: SearchBarProps) {
  return (
    <input
      type="text" // Diubah ke 'text' agar terhindar dari styling kaku bawaan browser untuk 'search'
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      style={{
        padding: '0.65rem 1rem',
        borderRadius: '0.5rem',       
        border: '1px solid #d1d5db',  
        backgroundColor: '#ffffff',
        fontSize: '0.9rem',
        fontFamily: 'inherit',
        outlineColor: '#1a362f',     
        transition: 'border-color 0.2s ease',
        ...style,
      }}
    />
  )
}