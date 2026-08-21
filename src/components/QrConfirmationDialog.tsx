import {
  useEffect,
  useRef,
} from 'react';

export interface QrCheckInCandidate {
  qrToken: string;
  invitationId: string;
  guestName: string;
  quota: number;
  guestCount: number;
  babyCount: number;
  checkedInAt: string | null;
}

interface QrConfirmationDialogProps {
  candidate: QrCheckInCandidate | null;
  confirming?: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function QrConfirmationDialog({
  candidate,
  confirming = false,
  error = '',
  onCancel,
  onConfirm,
}: QrConfirmationDialogProps) {
  const confirmButtonRef =
    useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!candidate) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    if (!candidate.checkedInAt) {
      confirmButtonRef.current?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        !confirming
      ) {
        onCancel();
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [candidate, confirming, onCancel]);

  if (!candidate) {
    return null;
  }

  const alreadyCheckedIn = Boolean(
    candidate.checkedInAt,
  );

  return (
    <div
      className="qr-confirmation-backdrop"
      role="presentation"
    >
      <section
        className="qr-confirmation-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="qr-confirmation-title"
        aria-describedby="qr-confirmation-description"
      >
        <div
          className={`qr-confirmation-dialog__icon ${
            alreadyCheckedIn
              ? 'is-warning'
              : 'is-ready'
          }`}
          aria-hidden="true"
        >
          {alreadyCheckedIn ? '!' : '✓'}
        </div>

        <p className="qr-confirmation-dialog__kicker">
          Wedding Check-in
        </p>

        <h2 id="qr-confirmation-title">
          {alreadyCheckedIn
            ? 'Tamu sudah check-in'
            : 'Konfirmasi kehadiran'}
        </h2>

        <p
          id="qr-confirmation-description"
          className="qr-confirmation-dialog__description"
        >
          {alreadyCheckedIn
            ? 'QR ini sebelumnya sudah digunakan.'
            : 'Pastikan data tamu berikut sudah sesuai.'}
        </p>

        <dl className="qr-confirmation-dialog__details">
          <div>
            <dt>Nama tamu</dt>
            <dd>{candidate.guestName}</dd>
          </div>

          <div>
            <dt>Jumlah tamu</dt>
            <dd>{candidate.guestCount} orang</dd>
          </div>

          <div>
            <dt>Bayi</dt>
            <dd>{candidate.babyCount} bayi</dd>
          </div>

          <div>
            <dt>Kuota undangan</dt>
            <dd>{candidate.quota} orang</dd>
          </div>

          {candidate.checkedInAt && (
            <div>
              <dt>Waktu check-in</dt>
              <dd>
                {new Date(
                  candidate.checkedInAt,
                ).toLocaleString('id-ID', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </dd>
            </div>
          )}
        </dl>

        {error && (
          <p
            className="qr-confirmation-dialog__error"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="qr-confirmation-dialog__actions">
          <button
            type="button"
            className="qr-dialog-button qr-dialog-button--secondary"
            onClick={onCancel}
            disabled={confirming}
          >
            {alreadyCheckedIn ? 'Tutup' : 'Batal'}
          </button>

          {!alreadyCheckedIn && (
            <button
              ref={confirmButtonRef}
              type="button"
              className="qr-dialog-button qr-dialog-button--primary"
              onClick={onConfirm}
              disabled={confirming}
            >
              {confirming
                ? 'Mengonfirmasi…'
                : 'Ya, konfirmasi hadir'}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}