import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

export interface QrCheckInCandidate {
  qrToken: string
  invitationId: string
  guestName: string
  quota: number
  guestCount: number
  babyCount: number
  checkedInAt: string | null
}

interface QrConfirmationDialogProps {
  candidate: QrCheckInCandidate | null
  confirming?: boolean
  error?: string
  onCancel: () => void
  onConfirm: () => void
}

const EXIT_ANIMATION_MS = 180

export function QrConfirmationDialog({
  candidate,
  confirming = false,
  error = '',
  onCancel,
  onConfirm,
}: QrConfirmationDialogProps) {
  const confirmButtonRef =
    useRef<HTMLButtonElement>(null)

  const [renderedCandidate, setRenderedCandidate] =
    useState<QrCheckInCandidate | null>(candidate)

  const [isClosing, setIsClosing] = useState(false)

  /*
   * Tetap mempertahankan data kandidat selama 180ms
   * agar animasi pop-out selesai sebelum dialog dihapus.
   */
  useEffect(() => {
    if (candidate) {
      setRenderedCandidate(candidate)
      setIsClosing(false)
      return
    }

    if (!renderedCandidate) return

    setIsClosing(true)

    const timeout = window.setTimeout(() => {
      setRenderedCandidate(null)
      setIsClosing(false)
    }, EXIT_ANIMATION_MS)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [candidate, renderedCandidate])

  /*
   * Mengunci halaman, mengatur fokus, dan menangani Escape.
   */
  useEffect(() => {
    if (!renderedCandidate) return

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow = 'hidden'
    document.body.classList.add(
      'qr-confirmation-open',
    )

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        !confirming &&
        !isClosing
      ) {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    const focusTimer = window.setTimeout(() => {
      if (!renderedCandidate.checkedInAt) {
        confirmButtonRef.current?.focus()
      }
    }, 100)

    return () => {
      document.body.style.overflow = previousOverflow

      document.body.classList.remove(
        'qr-confirmation-open',
      )

      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )

      window.clearTimeout(focusTimer)
    }
  }, [
    renderedCandidate,
    confirming,
    isClosing,
    onCancel,
  ])

  if (!renderedCandidate) return null

  const displayedCandidate = renderedCandidate

  const alreadyCheckedIn = Boolean(
    displayedCandidate.checkedInAt,
  )

  return createPortal(
    <div
      className={`qr-confirmation-backdrop ${
        isClosing ? 'is-closing' : ''
      }`}
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !confirming &&
          !isClosing
        ) {
          onCancel()
        }
      }}
    >
      <div
        className="qr-confirmation-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="qr-confirmation-title"
        aria-describedby="qr-confirmation-description"
      >
        <header className="qr-confirmation-header">
          <div
            className={`qr-confirmation-icon ${
              alreadyCheckedIn
                ? 'qr-confirmation-icon--warning'
                : 'qr-confirmation-icon--ready'
            }`}
            aria-hidden="true"
          >
            {alreadyCheckedIn ? '!' : '✓'}
          </div>

          <p className="qr-confirmation-kicker">
            Wedding Check-in
          </p>

          <h2 id="qr-confirmation-title">
            {alreadyCheckedIn
              ? 'Tamu sudah check-in'
              : 'Konfirmasi kehadiran'}
          </h2>

          <p
            id="qr-confirmation-description"
            className="qr-confirmation-description"
          >
            {alreadyCheckedIn
              ? 'Tamu ini sebelumnya sudah melakukan check-in.'
              : 'Pastikan data tamu berikut sudah sesuai sebelum mengonfirmasi kehadiran.'}
          </p>
        </header>

        <dl className="qr-confirmation-details">
          <div className="qr-confirmation-detail qr-confirmation-detail--wide">
            <dt>Nama tamu</dt>
            <dd>{displayedCandidate.guestName}</dd>
          </div>

          <div className="qr-confirmation-detail">
            <dt>Jumlah tamu</dt>

            <dd>
              <strong>
                {displayedCandidate.guestCount}
              </strong>

              <span>orang</span>
            </dd>
          </div>

          <div className="qr-confirmation-detail">
            <dt>Bayi</dt>

            <dd>
              <strong>
                {displayedCandidate.babyCount}
              </strong>

              <span>bayi</span>
            </dd>
          </div>

          <div className="qr-confirmation-detail qr-confirmation-detail--wide">
            <dt>Kuota undangan</dt>

            <dd>
              <strong>
                {displayedCandidate.quota}
              </strong>

              <span>orang</span>
            </dd>
          </div>
        </dl>

        {alreadyCheckedIn &&
          displayedCandidate.checkedInAt && (
            <div
              className="qr-confirmation-warning"
              role="status"
            >
              Sudah check-in pada{' '}

              <strong>
                {new Date(
                  displayedCandidate.checkedInAt,
                ).toLocaleString('id-ID')}
              </strong>
            </div>
          )}

        {error && (
          <div
            className="qr-confirmation-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="qr-confirmation-actions">
          <button
            className="qr-confirmation-button qr-confirmation-button--secondary"
            type="button"
            onClick={onCancel}
            disabled={confirming || isClosing}
          >
            {alreadyCheckedIn ? 'Tutup' : 'Batal'}
          </button>

          {!alreadyCheckedIn && (
            <button
              ref={confirmButtonRef}
              className="qr-confirmation-button qr-confirmation-button--primary"
              type="button"
              onClick={onConfirm}
              disabled={confirming || isClosing}
            >
              <span aria-hidden="true">✓</span>

              {confirming
                ? 'Memproses kehadiran…'
                : 'Konfirmasi hadir'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}