# Konan & Nilo Wedding Invitation

React + TypeScript + Vite frontend and Node.js + Express + Prisma + MySQL backend based on PRD v3.

## Project structure

- `src/` — React/Vite invitation UI.
- `backend/` — Express API, Prisma schema, migrations, seed.

## Development

### 1. Start MySQL

From this directory:

```bash
docker compose up -d mysql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

API runs on `http://localhost:4000`.

### 3. Frontend

```bash
cd ..
cp .env.example .env
npm install
npm run dev
```

Frontend runs on Vite's default development port.

### 4. Test personal invitation

Open:

`http://localhost:5173/?invite=8fK2xP9m`

The seed creates the invitation used by the PRD prototype.

## Current API scope

- Public invitation lookup by token.
- RSVP submission with server-side quota validation.
- One RSVP per invitation.
- QR token generation for attending guests.
- Published message listing.
- Message submission with `PENDING` moderation state.

Staff/admin authentication and protected QR check-in mutation are the next backend module. The public API intentionally does not expose a check-in mutation.

## Client preview mode

From the admin invitation table, copy **Preview klien** for a dummy invitation and send that URL to the client. The link adds `preview=1`. The preview uses the invitation's name/quota and can demonstrate RSVP, a demo QR, and a new message without writing those interactions to MySQL. Previously published messages are read via the existing read-only messages endpoint. Local preview interactions are retained in that browser tab's session storage; use **Ulangi demo** to reset them. A preview QR uses the `wedding:preview:` payload and is not valid for event check-in.

The invitation record itself is still read from the database, so create a dummy invitation in admin before sharing its preview link. Avoid sharing a real guest's token for client demonstrations.

## Verification commands

Frontend:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

Backend:

```bash
cd backend
npm install
npm run setup
npm run typecheck
npm run build
```

See `docs/AUDIT.md` for the PRD alignment audit and known production tasks.
