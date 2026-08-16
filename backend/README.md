# Lotus & Willow API

Backend: Node.js + Express 5 + TypeScript + Prisma + MySQL.

## Development

1. Copy `.env.example` to `.env`.
2. Start MySQL: `docker compose up -d mysql`.
3. Run `npm install`.
4. Run `npm run setup`.
5. Run `npm run dev`.

Seed creates development users and invitation token `8fK2xP9m`.

## Main API

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/invitations/:token`
- `POST /api/invitations/:token/rsvp`
- `POST /api/invitations/:token/messages`
- `GET /api/admin/overview`
- `GET /api/admin/invitations`
- `POST /api/admin/invitations`
- `GET /api/admin/invitations/:id/guests`
- `POST /api/admin/invitations/:id/guests`
- `DELETE /api/admin/guests/:id`
- `GET /api/attendance/search?q=...`
- `POST /api/attendance/check-in`
- `POST /api/attendance/walk-in`

Walk-in check-in is an explicit staff/admin override and is recorded in `AuditLog` with source `WALK_IN`.
