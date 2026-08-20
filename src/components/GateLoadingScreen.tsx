export function GateLoadingScreen() {
  const logoUrl =
    `${import.meta.env.BASE_URL}favicon.png`;

  return (
    <div
      className="gate-loading-screen"
      role="status"
      aria-live="polite"
      aria-label="Menyiapkan undangan"
    >
      <div className="gate-loading-screen__logo">
        <img
          src={logoUrl}
          alt=""
          aria-hidden="true"
        />
      </div>

      <p className="gate-loading-screen__kicker">
        The Wedding Invitation
      </p>

      <h1>Sedang merangkai undangan</h1>

      <p className="gate-loading-screen__message">
        Kelopak, cahaya, dan kisah indah sedang
        dipersiapkan khusus untukmu…
      </p>

      <div
        className="gate-loading-screen__dots"
        aria-hidden="true"
      >
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}