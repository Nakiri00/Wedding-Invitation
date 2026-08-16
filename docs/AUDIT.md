# Project Audit — PRD v3.0

## Baseline audited

The project is a React + TypeScript + Vite frontend with a Node.js + Express + TypeScript + Prisma + MySQL backend.

## Findings and fixes in this revision

1. **PRD file integrity** — `PRD.md` was actually a DOCX container with the wrong extension. It has been converted to readable Markdown text so the repository contains a real source-of-truth document.
2. **React Hooks rule** — route selection happened before hooks inside `App`, which can violate the Rules of Hooks. Routing is now separated from the invitation application component.
3. **CORS** — the API used `DELETE` endpoints but CORS did not advertise `DELETE`. CORS now allows the methods used by the API and preflight.
4. **QR check-in flow** — the previous staff scanner immediately performed a check-in. PRD v3.0 requires validation, display of guest information, then staff confirmation. A protected `POST /api/attendance/validate-qr` endpoint and confirmation UI were added.
5. **QR source abuse** — the QR check-in endpoint previously accepted `WALK_IN` as a source. Walk-in is now isolated to its dedicated endpoint; QR check-in always records `STAFF`.
6. **Auth UI** — development credentials were prefilled in the login form. Inputs are now blank by default; the development hint is shown only in development builds.
7. **Type safety** — the admin invitation response includes `checkInSource`; the frontend type now represents it. A dedicated `typecheck` script is available for both frontend and backend.

## PRD alignment status

### Implemented

- Personal invitation token
- Server-side invitation validation
- RSVP quota validation
- Baby/child count separated from counted guest quota
- Automatic QR generation after attending RSVP
- Staff-only QR check-in
- QR validation before confirmation
- Double check-in protection
- Walk-in exception flow
- Audit log for administrative/check-in actions
- Message submission and moderation
- Admin invitation/guest management
- Staff check-in console
- Responsive wedding invitation UI
- Reduced-motion support

### Optional / dependency

- Photo-sharing remains a configurable external link. The final third-party platform/API has not been selected, so no provider-specific integration is claimed.

### Still recommended before production

- Automated API integration tests and browser E2E tests
- Production secret/configuration review
- HTTPS/domain deployment
- Backup/restore procedure for MySQL
- Observability and error tracking
- Final client policy for children/babies and walk-in behavior
- Final photo-sharing provider/API decision
- Performance pass on real mobile devices and final artwork assets

## Important operational note

Run the backend seed before opening a seeded invitation in development:

```bash
cd backend
npm run setup
npm run dev
```

The frontend can then use the seeded token from the backend seed output.
