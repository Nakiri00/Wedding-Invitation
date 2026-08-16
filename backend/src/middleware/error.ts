import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'

export const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  void next
  if (error instanceof ZodError) {
    response.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Data yang dikirim tidak valid.',
      details: error.issues,
    })
    return
  }

  console.error(error)
  response.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Terjadi kesalahan pada server.' })
}
