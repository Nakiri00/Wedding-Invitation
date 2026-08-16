import { useState, useEffect, type ReactNode } from 'react'

interface InvitationGateProps {
  children: ReactNode
  guestName: string
  valid: boolean
  loading?: boolean
  error?: string
}

export function InvitationGate({ children, guestName, valid, loading = false, error = '' }: InvitationGateProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [isClosingToast, setIsClosingToast] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  useEffect(() => {
    if (!loading && valid) {
      setShowSuccessToast(true)
      setIsClosingToast(false) 
      
      const startClosingTimer = setTimeout(() => {
        setIsClosingToast(true)
      }, 3000)

      const removeToastTimer = setTimeout(() => {
        setShowSuccessToast(false)
      }, 3500)

      return () => {
        clearTimeout(startClosingTimer)
        clearTimeout(removeToastTimer)
      }
    }
  }, [loading, valid])

  return (
    <>
      <div className={`gate-overlay ${isOpen ? 'is-open' : ''}`}>
        <div className="gate-content">
          <div className="lotus-icon">🪷</div> 
          <span className="gate-kicker">THE WEDDING OF</span>
          <h1 className="gate-title">Lotus & Willow</h1>
          
          <div className="gate-guest-box">
            <p>Kepada Yth. Bapak/Ibu/Saudara/i:</p>
            <h2>{guestName || 'Tamu Undangan'}</h2>
            <p>Kamu diundang untuk hadir di momen bahagia kami.</p>
          </div>

          <button 
            className="primary-button open-gate-btn" 
            onClick={() => setIsOpen(true)}
            disabled={loading}
          >
            {loading ? 'Menyiapkan Undangan...' : 'Buka Undangan'}
          </button>
        </div>
      </div>

      <div className="app-shell" data-invitation-valid={valid}>
        
        <div className="toast-container">
          {loading && (
            <div className="toast" role="status">
              <span>Memuat undangan</span>
              <strong>Menyiapkan undangan personal…</strong>
            </div>
          )}
          
          {!loading && !valid && (
            <div className="toast toast-error" role="status">
              <span>{error ? 'Invitation unavailable' : 'Preview mode'}</span>
              <strong>{error || 'Link undangan personal belum terdeteksi.'}</strong>
              <small>Gunakan <code>?invite=8fK2xP9m</code> setelah API dan database aktif.</small>
            </div>
          )}
          
          {!loading && valid && showSuccessToast && (
            <div className={`toast toast-success ${isClosingToast ? 'toast-closing' : ''}`}>
              <span>Berhasil</span>
              <strong>Undangan untuk {guestName}</strong>
            </div>
          )}
        </div>

        {children}
      </div>
    </>
  )
}