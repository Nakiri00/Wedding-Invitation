# UI Update — RSVP QR Ticket

## Changes
- Redesigned the RSVP success QR ticket into a vertical, centered check-in card.
- Constrained QR image rendering so the generated 280px QR never overflows its container.
- Added a dedicated check-in label and invitation code above the QR.
- Added seat and baby/child summary below the QR.
- Added responsive QR sizing for mobile screens.
- Fixed the frontend RSVP response mapping: the backend returns `guestCount`, while the UI model uses `guests`. This removes the visible `undefined kursi` issue after a fresh RSVP.

No backend API or database schema changes were made for this UI update.

## QR sizing fix
The QR image is a grid item in `.qr-code`; it now spans the full grid (`grid-column`/`grid-row`) so it renders at the intended 220px size instead of being constrained to the first 1/11 grid cell.
