import type { ReactNode } from 'react'

interface InvitationGateProps {
  children: ReactNode
  guestName: string
  valid: boolean
  loading?: boolean
  error?: string
}

export function InvitationGate({ children, guestName, valid, loading = false, error = '' }: InvitationGateProps) {
  return (
    <div className="app-shell" data-invitation-valid={valid}>
      {loading && <div className="token-banner" role="status"><span>Memuat undangan</span><strong>Menyiapkan undangan personal…</strong></div>}
      {!loading && !valid && (
        <div className="token-banner" role="status">
          <span>{error ? 'Invitation unavailable' : 'Preview mode'}</span>
          <strong>{error || 'Link undangan personal belum terdeteksi.'}</strong>
          <small>Gunakan <code>?invite=8fK2xP9m</code> setelah API dan database aktif.</small>
        </div>
      )}
      {valid && (
        <div className="personal-bar">
          Undangan untuk <strong>{guestName}</strong>
        </div>
      )}
      {children}
    </div>
  )
}
