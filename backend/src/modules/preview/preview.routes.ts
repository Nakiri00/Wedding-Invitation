import { Router } from 'express'
import QRCode from 'qrcode'
import { z } from 'zod'

export const previewQrRouter = Router()

// Only encode the dedicated preview payload format. This route does not access Prisma/MySQL.
const previewPayloadSchema = z.string().regex(
  /^wedding:preview:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
)

previewQrRouter.get('/qr', async (request, response, next) => {
  const parsed = previewPayloadSchema.safeParse(request.query.payload)
  if (!parsed.success) {
    response.status(400).json({
      error: 'INVALID_PREVIEW_QR',
      message: 'Payload QR preview tidak valid.',
    })
    return
  }

  try {
    const qrDataUrl = await QRCode.toDataURL(parsed.data, { margin: 1, width: 280 })
    response.json({ data: { qrDataUrl } })
  } catch (error) {
    next(error)
  }
})
