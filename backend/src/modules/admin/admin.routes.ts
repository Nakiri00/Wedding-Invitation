import { Router } from 'express'
import { randomBytes } from 'node:crypto'
import { prisma } from '../../lib/prisma.js'
import { requireAuth } from '../../middleware/auth.js'
import { z } from 'zod'

export const adminRouter = Router()
adminRouter.use(requireAuth(['ADMIN']))

const invitationSchema = z.object({
  guestName: z.string().trim().min(2).max(160),
  contact: z.string().trim().max(120).optional(),
  guestType: z.enum(['VIP', 'REGULAR']).default('REGULAR'),
  quota: z.number().int().min(1).max(50),
})

const guestSchema = z.object({
  name: z.string().trim().min(2).max(160),
  contact: z.string().trim().max(120).optional(),
  countedGuest: z.boolean().default(true),
})

const moderationSchema = z.object({ status: z.enum(['PUBLISHED', 'HIDDEN']) })

adminRouter.get('/overview', async (_req, res, next) => {
  try {
    const [invited, rsvp, attending, notAttending, checkedIn, pendingMessages, walkIns, activeInvitations] = await Promise.all([
      prisma.invitation.count({ where: { status: 'ACTIVE' } }),
      prisma.rSVP.count(),
      prisma.rSVP.count({ where: { attendance: 'ATTENDING' } }),
      prisma.rSVP.count({ where: { attendance: 'NOT_ATTENDING' } }),
      prisma.attendance.count(),
      prisma.message.count({ where: { status: 'PENDING' } }),
      prisma.attendance.count({ where: { source: 'WALK_IN' } }),
      prisma.invitation.findMany({
        where: { status: 'ACTIVE' },
        select: { quota: true, rsvp: { select: { attendance: true, guestCount: true, babyCount: true } } },
      }),
    ])
    const invitedSeats = activeInvitations.reduce((sum, x) => sum + x.quota, 0)
    const confirmedSeats = activeInvitations.reduce((sum, x) => sum + (x.rsvp?.attendance === 'ATTENDING' ? x.rsvp.guestCount : 0), 0)
    const confirmationRate = rsvp > 0 ? Math.round((attending / rsvp) * 100) : 0
    res.json({ data: {
      invited, rsvp, attending, notAttending, checkedIn, pendingMessages, walkIns,
      invitedSeats, confirmedSeats, confirmationRate,
      checkInRate: attending > 0 ? Math.round((checkedIn / attending) * 100) : 0,
    } })
  } catch (e) { next(e) }
})

adminRouter.get('/invitations', async (_req, res, next) => {
  try {
    const rows = await prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' }, include: { rsvp: true, attendance: true, guests: { orderBy: { createdAt: 'asc' } } }, take: 200,
    })
    res.json({ data: rows.map((x) => ({
      id: x.id, token: x.token, guestName: x.guestName, contact: x.contact, guestType: x.guestType, quota: x.quota, status: x.status,
      guests: x.guests.map(g => ({ id: g.id, name: g.name, contact: g.contact, countedGuest: g.countedGuest })),
      rsvp: x.rsvp ? { attendance: x.rsvp.attendance, guestCount: x.rsvp.guestCount, babyCount: x.rsvp.babyCount, submittedAt: x.rsvp.submittedAt } : null,
      checkedInAt: x.attendance?.checkedInAt ?? null, checkInSource: x.attendance?.source ?? null, createdAt: x.createdAt,
    })) })
  } catch (e) { next(e) }
})

adminRouter.post('/invitations', async (req, res, next) => {
  try {
    const input = invitationSchema.parse(req.body)
    const token = randomBytes(9).toString('base64url')
    const invitation = await prisma.$transaction(async tx => {
      const created = await tx.invitation.create({ data: { ...input, token } })
      await tx.guest.create({ data: { invitationId: created.id, name: input.guestName, contact: input.contact, countedGuest: true } })
      await tx.auditLog.create({ data: { actorId: req.authUser!.sub, action: 'CREATE', entity: 'Invitation', entityId: created.id, metadata: { token } } })
      return created
    })
    res.status(201).json({ data: invitation })
  } catch (e) { next(e) }
})

adminRouter.post('/invitations/:id/revoke', async (req, res, next) => {
  try {
    const invitation = await prisma.invitation.update({ where: { id: req.params.id }, data: { status: 'REVOKED' } })
    await prisma.auditLog.create({ data: { actorId: req.authUser!.sub, action: 'REVOKE', entity: 'Invitation', entityId: invitation.id } })
    res.json({ data: invitation })
  } catch (e) { next(e) }
})

adminRouter.get('/invitations/:id/guests', async (req, res, next) => {
  try {
    const guests = await prisma.guest.findMany({ where: { invitationId: req.params.id }, orderBy: { createdAt: 'asc' } })
    res.json({ data: guests })
  } catch (e) { next(e) }
})

adminRouter.post('/invitations/:id/guests', async (req, res, next) => {
  try {
    const input = guestSchema.parse(req.body)
    const invitation = await prisma.invitation.findUnique({ where: { id: req.params.id }, include: { guests: true } })
    if (!invitation) return res.status(404).json({ error: 'INVITATION_NOT_FOUND', message: 'Undangan tidak ditemukan.' })
    if (invitation.status !== 'ACTIVE') return res.status(409).json({ error: 'INVITATION_INACTIVE', message: 'Undangan sudah tidak aktif.' })
    const counted = invitation.guests.filter(g => g.countedGuest).length
    if (input.countedGuest && counted >= invitation.quota) return res.status(409).json({ error: 'QUOTA_EXCEEDED', message: 'Jumlah tamu terhitung sudah mencapai quota undangan.' })
    const guest = await prisma.guest.create({ data: { ...input, invitationId: invitation.id } })
    await prisma.auditLog.create({ data: { actorId: req.authUser!.sub, action: 'CREATE', entity: 'Guest', entityId: guest.id, metadata: { invitationId: invitation.id } } })
    res.status(201).json({ data: guest })
  } catch (e) { next(e) }
})

adminRouter.delete('/guests/:id', async (req, res, next) => {
  try {
    const guest = await prisma.guest.findUnique({ where: { id: req.params.id } })
    if (!guest) return res.status(404).json({ error: 'GUEST_NOT_FOUND', message: 'Tamu tidak ditemukan.' })
    const invitation = await prisma.invitation.findUnique({ where: { id: guest.invitationId }, include: { guests: true } })
    if (invitation && invitation.guests.filter(g => g.countedGuest).length === 1 && guest.countedGuest) {
      return res.status(409).json({ error: 'PRIMARY_GUEST_REQUIRED', message: 'Tamu utama tidak dapat dihapus.' })
    }
    await prisma.guest.delete({ where: { id: guest.id } })
    await prisma.auditLog.create({ data: { actorId: req.authUser!.sub, action: 'DELETE', entity: 'Guest', entityId: guest.id, metadata: { invitationId: guest.invitationId } } })
    res.json({ data: { success: true } })
  } catch (e) { next(e) }
})

adminRouter.get('/messages', async (_req, res, next) => {
  try {
    const messages = await prisma.message.findMany({ orderBy: { createdAt: 'desc' }, take: 200, include: { invitation: { select: { guestName: true, token: true } } } })
    res.json({ data: messages })
  } catch (e) { next(e) }
})

adminRouter.patch('/messages/:id', async (req, res, next) => {
  try {
    const { status } = moderationSchema.parse(req.body)
    const message = await prisma.message.update({ where: { id: req.params.id }, data: { status, moderatedAt: new Date() } })
    await prisma.auditLog.create({ data: { actorId: req.authUser!.sub, action: `MESSAGE_${status}`, entity: 'Message', entityId: message.id } })
    res.json({ data: message })
  } catch (e) { next(e) }
})

adminRouter.get('/audit-logs', async (_req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { actor: { select: { name: true, email: true } } } })
    res.json({ data: logs })
  } catch (e) { next(e) }
})
