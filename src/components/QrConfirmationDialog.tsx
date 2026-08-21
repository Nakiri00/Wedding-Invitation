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
      <dd>{candidate.guestName}</dd>
    </div>

    <div className="qr-confirmation-detail">
      <dt>Jumlah tamu</dt>
      <dd>
        <strong>{candidate.guestCount}</strong>
        <span>orang</span>
      </dd>
    </div>

    <div className="qr-confirmation-detail">
      <dt>Bayi</dt>
      <dd>
        <strong>{candidate.babyCount}</strong>
        <span>bayi</span>
      </dd>
    </div>

    <div className="qr-confirmation-detail qr-confirmation-detail--wide">
      <dt>Kuota undangan</dt>
      <dd>
        <strong>{candidate.quota}</strong>
        <span>orang</span>
      </dd>
    </div>
  </dl>

  {alreadyCheckedIn && candidate.checkedInAt && (
    <div className="qr-confirmation-warning" role="status">
      Sudah check-in pada{' '}
      <strong>
        {new Date(candidate.checkedInAt).toLocaleString('id-ID')}
      </strong>
    </div>
  )}

  {error && (
    <div className="qr-confirmation-error" role="alert">
      {error}
    </div>
  )}

  <div className="qr-confirmation-actions">
    <button
      className="qr-confirmation-button qr-confirmation-button--secondary"
      type="button"
      onClick={onCancel}
      disabled={confirming}
    >
      {alreadyCheckedIn ? 'Tutup' : 'Batal'}
    </button>

    {!alreadyCheckedIn && (
      <button
        ref={confirmButtonRef}
        className="qr-confirmation-button qr-confirmation-button--primary"
        type="button"
        onClick={onConfirm}
        disabled={confirming}
      >
        <span aria-hidden="true">✓</span>

        {confirming
          ? 'Memproses kehadiran…'
          : 'Konfirmasi hadir'}
      </button>
    )}
  </div>
</div>
    </div>
  );
}