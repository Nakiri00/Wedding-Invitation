import './styling/QrCodeCard.css'

interface QrCodeCardProps {
  qrDataUrl?: string | null
  guestName: string
}

/** Displays the backend-generated check-in QR as a normal, static 2D image. */
export function QrCodeCard({ qrDataUrl, guestName }: QrCodeCardProps) {
  if (!qrDataUrl) {
    return (
      <div className="qr-code-card__unavailable" role="status">
        QR check-in belum tersedia. Silakan muat ulang undangan Anda.
      </div>
    )
  }

  return (
    <div className="qr-code-card">
      <img
        className="qr-code-card__image"
        src={qrDataUrl}
        alt={`QR check-in ${guestName}`}
        width={320}
        height={320}
        decoding="async"
      />
    </div>
  )
}
