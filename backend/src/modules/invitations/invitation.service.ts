import { randomBytes } from 'node:crypto'
import QRCode from 'qrcode'
import { prisma } from '../../lib/prisma.js'
import type { z } from 'zod'
import { messageSchema, rsvpSchema } from './invitation.schema.js'

const publicInvitationSelect = {
  id: true,
  token: true,
  guestName: true,
  quota: true,
  status: true,
  rsvp: {
    select: {
      name: true,
      attendance: true,
      guestCount: true,
      babyCount: true,
      qrToken: true,
      submittedAt: true,
    },
  },
} as const

function assertActiveInvitation(status: string) {
  if (status !== 'ACTIVE') {
    const error = new Error('Invitation is not active')
    error.name = 'INVITATION_INACTIVE'
    throw error
  }
}

export async function getInvitation(token: string) {
  const invitation = await prisma.invitation.findUnique({ where: { token }, select: publicInvitationSelect })
  if (!invitation) return null
  assertActiveInvitation(invitation.status)

  const qrDataUrl = invitation.rsvp?.qrToken
    ? await QRCode.toDataURL(`wedding:checkin:${invitation.rsvp.qrToken}`, { margin: 1, width: 280 })
    : null

  return {
    ...invitation,
    rsvp: invitation.rsvp
      ? {
          name: invitation.rsvp.name,
          attendance: invitation.rsvp.attendance === 'ATTENDING' ? 'attending' : 'not_attending',
          guestCount: invitation.rsvp.guestCount,
          babyCount: invitation.rsvp.babyCount,
          submittedAt: invitation.rsvp.submittedAt,
          qrDataUrl,
        }
      : null,
  }
}

export async function submitRSVP(token: string, input: z.infer<typeof rsvpSchema>) {
  const invitation = await prisma.invitation.findUnique({ where: { token } })
  if (!invitation) return null
  assertActiveInvitation(invitation.status)

  if (input.attendance === 'attending' && input.guestCount < 1) {
    const error = new Error('Guest count must be at least 1 when attending')
    error.name = 'INVALID_ATTENDANCE'
    throw error
  }

  if (input.attendance === 'attending' && input.guestCount > invitation.quota) {
    const error = new Error(`Guest count exceeds invitation quota of ${invitation.quota}`)
    error.name = 'QUOTA_EXCEEDED'
    throw error
  }

  if (input.attendance === 'not_attending' && input.guestCount !== 0) {
    const error = new Error('Guest count must be zero when not attending')
    error.name = 'INVALID_ATTENDANCE'
    throw error
  }

  const existing = await prisma.rSVP.findUnique({ where: { invitationId: invitation.id } })
  if (existing) {
    const error = new Error('RSVP already submitted for this invitation')
    error.name = 'RSVP_ALREADY_SUBMITTED'
    throw error
  }

  const qrToken = input.attendance === 'attending' ? randomBytes(24).toString('hex') : null
  const rsvp = await prisma.rSVP.create({
    data: {
      invitationId: invitation.id,
      name: input.name,
      attendance: input.attendance === 'attending' ? 'ATTENDING' : 'NOT_ATTENDING',
      guestCount: input.guestCount,
      babyCount: input.babyCount,
      qrToken,
    },
  })

  const qrDataUrl = qrToken
    ? await QRCode.toDataURL(`wedding:checkin:${qrToken}`, { margin: 1, width: 280 })
    : null

  return {
    name: rsvp.name,
    attendance: rsvp.attendance === 'ATTENDING' ? 'attending' : 'not_attending',
    guestCount: rsvp.guestCount,
    babyCount: rsvp.babyCount,
    submittedAt: rsvp.submittedAt,
    qrDataUrl,
    checkInCode: qrToken ? `INV-${token.slice(0, 6).toUpperCase()}` : null,
  }
}

export async function listPublishedMessages(token: string) {
  const invitation = await prisma.invitation.findUnique({ where: { token }, select: { id: true, status: true } })
  if (!invitation) return null
  assertActiveInvitation(invitation.status)

  const messages = await prisma.message.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, guestName: true, message: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return messages.map((message) => ({
    id: message.id,
    name: message.guestName,
    message: message.message,
    status: 'published' as const,
    createdAt: message.createdAt,
  }))
}

export async function createMessage(token: string, input: z.infer<typeof messageSchema>) {
  const invitation = await prisma.invitation.findUnique({ where: { token } })
  if (!invitation) return null
  assertActiveInvitation(invitation.status)

  return prisma.message.create({
    data: {
      invitationId: invitation.id,
      guestName: input.name,
      message: input.message,
      status: 'PENDING',
    },
    select: { id: true, guestName: true, message: true, status: true, createdAt: true },
  }).then((message) => ({
    id: message.id,
    name: message.guestName,
    message: message.message,
    status: message.status === 'PUBLISHED' ? 'published' as const : message.status === 'HIDDEN' ? 'hidden' as const : 'pending' as const,
    createdAt: message.createdAt,
  }))
}
