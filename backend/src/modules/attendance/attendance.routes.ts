import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { requireAuth } from '../../middleware/auth.js'
import { z } from 'zod'

export const attendanceRouter = Router()
attendanceRouter.use(requireAuth(['ADMIN', 'STAFF']))

const qrSchema = z.object({ qrToken: z.string().trim().min(10).max(128) })
const walkInSchema = z.object({ invitationId: z.string().min(1), guestCount: z.number().int().min(1).max(50).default(1), babyCount: z.number().int().min(0).max(50).default(0) })

function parseQr(value: string) {
  const prefix = 'wedding:checkin:'
  return value.startsWith(prefix) ? value.slice(prefix.length) : value
}

async function createAttendance(invitationId: string, actorId: string, source: 'STAFF' | 'WALK_IN', guestCount: number, babyCount: number) {
  return prisma.$transaction(async tx => {
    const existing = await tx.attendance.findUnique({ where: { invitationId } })
    if (existing) {
      const error = new Error('Guest sudah melakukan check-in.')
      error.name = 'ALREADY_CHECKED_IN'
      throw error
    }
    const attendance = await tx.attendance.create({ data: { invitationId, checkedInById: actorId, source } })
    await tx.auditLog.create({ data: { actorId, action: source === 'WALK_IN' ? 'WALK_IN_CHECK_IN' : 'CHECK_IN', entity: 'Attendance', entityId: attendance.id, metadata: { invitationId, source, guestCount, babyCount } } })
    return attendance
  })
}

attendanceRouter.post('/validate-qr', async (req, res, next) => {
  try {
    const input = qrSchema.parse(req.body)
    const qrToken = parseQr(input.qrToken)
    const rsvp = await prisma.rSVP.findUnique({ where: { qrToken }, include: { invitation: { include: { attendance: true } } } })
    if (!rsvp || rsvp.attendance !== 'ATTENDING' || rsvp.invitation.status !== 'ACTIVE') {
      return res.status(404).json({ error: 'INVALID_QR', message: 'QR tidak valid, belum RSVP, atau undangan tidak aktif.' })
    }
    res.json({ data: { invitationId: rsvp.invitationId, guestName: rsvp.invitation.guestName, quota: rsvp.invitation.quota, guestCount: rsvp.guestCount, babyCount: rsvp.babyCount, checkedInAt: rsvp.invitation.attendance?.checkedInAt ?? null } })
  } catch (e) { next(e) }
})

attendanceRouter.post('/check-in', async (req, res, next) => {
  try {
    const input = qrSchema.parse(req.body)
    const qrToken = parseQr(input.qrToken)
    const rsvp = await prisma.rSVP.findUnique({ where: { qrToken }, include: { invitation: true } })
    if (!rsvp || rsvp.attendance !== 'ATTENDING' || rsvp.invitation.status !== 'ACTIVE') return res.status(404).json({ error: 'INVALID_QR', message: 'QR tidak valid atau undangan tidak aktif.' })
    const result = await createAttendance(rsvp.invitationId, req.authUser!.sub, 'STAFF', rsvp.guestCount, rsvp.babyCount)
    res.status(201).json({ data: { attendanceId: result.id, guestName: rsvp.invitation.guestName, quota: rsvp.invitation.quota, guestCount: rsvp.guestCount, babyCount: rsvp.babyCount, checkedInAt: result.checkedInAt, source: result.source } })
  } catch (e) {
    if (e instanceof Error && e.name === 'ALREADY_CHECKED_IN') return res.status(409).json({ error: e.name, message: e.message })
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return res.status(409).json({ error: 'ALREADY_CHECKED_IN', message: 'Guest sudah melakukan check-in.' })
    next(e)
  }
})

attendanceRouter.get('/search', async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '').trim()
    if (q.length < 2) return res.json({ data: [] })
    const rows = await prisma.invitation.findMany({
      where: { status: 'ACTIVE', OR: [{ guestName: { contains: q } }, { contact: { contains: q } }, { token: q }] },
      take: 20, orderBy: { createdAt: 'desc' }, include: { rsvp: true, attendance: true },
    })
    res.json({ data: rows.map(x => ({ id: x.id, guestName: x.guestName, contact: x.contact, quota: x.quota, token: x.token, attendance: x.rsvp?.attendance ?? null, guestCount: x.rsvp?.guestCount ?? null, babyCount: x.rsvp?.babyCount ?? null, checkedInAt: x.attendance?.checkedInAt ?? null })) })
  } catch (e) { next(e) }
})

attendanceRouter.post('/walk-in', async (req, res, next) => {
  try {
    const input = walkInSchema.parse(req.body)
    const invitation = await prisma.invitation.findUnique({ where: { id: input.invitationId }, include: { attendance: true } })
    if (!invitation || invitation.status !== 'ACTIVE') return res.status(404).json({ error: 'INVITATION_NOT_FOUND', message: 'Undangan aktif tidak ditemukan.' })
    if (invitation.attendance) return res.status(409).json({ error: 'ALREADY_CHECKED_IN', message: 'Guest sudah melakukan check-in.' })
    if (input.guestCount > invitation.quota) return res.status(409).json({ error: 'QUOTA_EXCEEDED', message: 'Jumlah tamu melebihi quota undangan.' })
    const result = await createAttendance(invitation.id, req.authUser!.sub, 'WALK_IN', input.guestCount, input.babyCount)
    res.status(201).json({ data: { attendanceId: result.id, guestName: invitation.guestName, quota: invitation.quota, guestCount: input.guestCount, babyCount: input.babyCount, checkedInAt: result.checkedInAt, source: result.source } })
  } catch (e) {
    if (e instanceof Error && e.name === 'ALREADY_CHECKED_IN') return res.status(409).json({ error: e.name, message: e.message })
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return res.status(409).json({ error: 'ALREADY_CHECKED_IN', message: 'Guest sudah melakukan check-in.' })
    next(e)
  }
})

attendanceRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await prisma.attendance.findMany({ orderBy: { checkedInAt: 'desc' }, take: 200, include: { invitation: { select: { guestName: true, token: true } }, checkedInBy: { select: { name: true, role: true } } } })
    res.json({ data: rows })
  } catch (e) { next(e) }
})
