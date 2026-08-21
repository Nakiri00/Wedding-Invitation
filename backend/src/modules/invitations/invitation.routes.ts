import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { createMessage, getInvitation, listPublishedMessages, submitRSVP } from './invitation.service.js'
import { messageSchema, rsvpSchema } from './invitation.schema.js'

export const invitationRouter = Router()

invitationRouter.get('/:token', async (request, response, next) => {
  try {
    const invitation = await getInvitation(request.params.token)
    if (!invitation) {
      response.status(404).json({ error: 'INVITATION_NOT_FOUND', message: 'Undangan tidak ditemukan.' })
      return
    }
    response.json({ data: invitation })
  } catch (error) {
    if (error instanceof Error && error.name === 'INVITATION_INACTIVE') {
      response.status(410).json({ error: 'INVITATION_INACTIVE', message: 'Undangan sudah tidak aktif.' })
      return
    }
    next(error)
  }
})

invitationRouter.post('/:token/rsvp', async (request, response, next) => {
  try {
    const input = rsvpSchema.parse(request.body)
    const result = await submitRSVP(request.params.token, input)
    if (!result) {
      response.status(404).json({ error: 'INVITATION_NOT_FOUND', message: 'Undangan tidak ditemukan.' })
      return
    }
    response.status(201).json({ data: result })
  } catch (error) {
    if (error instanceof Error) {
      const map: Record<string, number> = {
        INVITATION_INACTIVE: 410,
        QUOTA_EXCEEDED: 409,
        INVALID_ATTENDANCE: 400,
        RSVP_ALREADY_SUBMITTED: 409,
      }
      const status = map[error.name]
      if (status) {
        response.status(status).json({ error: error.name, message: error.message })
        return
      }
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      response.status(409).json({ error: 'RSVP_ALREADY_SUBMITTED', message: 'RSVP untuk undangan ini sudah tersimpan.' })
      return
    }
    next(error)
  }
})

invitationRouter.get('/:token/messages', async (request, response, next) => {
  try {
    const messages = await listPublishedMessages(request.params.token)
    if (!messages) {
      response.status(404).json({ error: 'INVITATION_NOT_FOUND', message: 'Undangan tidak ditemukan.' })
      return
    }
    response.json({ data: messages })
  } catch (error) {
    if (error instanceof Error && error.name === 'INVITATION_INACTIVE') {
      response.status(410).json({ error: 'INVITATION_INACTIVE', message: 'Undangan sudah tidak aktif.' })
      return
    }
    next(error)
  }
})

invitationRouter.post('/:token/messages', async (request, response, next) => {
  try {
    const input = messageSchema.parse(request.body)

    const message = await createMessage(
      request.params.token,
      input,
    )

    if (!message) {
      response.status(404).json({
        error: 'INVITATION_NOT_FOUND',
        message: 'Undangan tidak ditemukan.',
      })
      return
    }

    response.status(201).json({
      data: message,
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      response.status(409).json({
        error: 'MESSAGE_ALREADY_SUBMITTED',
        message: 'Pesan untuk undangan ini sudah pernah dikirim.',
      })
      return
    }

    if (error instanceof Error) {
      const map: Record<string, number> = {
        INVITATION_INACTIVE: 410,
        MESSAGE_ALREADY_SUBMITTED: 409,
      }

      const status = map[error.name]

      if (status) {
        response.status(status).json({
          error: error.name,
          message: error.message,
        })
        return
      }
    }

    next(error)
  }
})