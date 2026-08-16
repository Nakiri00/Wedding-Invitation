import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { pinoHttp } from 'pino-http'
import { rateLimit } from 'express-rate-limit'
import { env } from './config/env.js'
import { invitationRouter } from './modules/invitations/invitation.routes.js'
import { errorHandler } from './middleware/error.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { adminRouter } from './modules/admin/admin.routes.js'
import { attendanceRouter } from './modules/attendance/attendance.routes.js'
import { getCookie, CSRF_COOKIE } from './lib/cookies.js'
import { prisma } from './lib/prisma.js'

export const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: env.WEB_ORIGIN, methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'], credentials: true, allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'] }))
app.use(express.json({ limit: '32kb' }))
app.use(pinoHttp())

const csrfProtectedMethods = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])
app.use((request, response, next) => {
  if (!csrfProtectedMethods.has(request.method) || request.path === '/api/auth/login') return next()
  const cookieToken = getCookie(request, CSRF_COOKIE)
  const headerToken = request.header('x-csrf-token')
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    response.status(403).json({ error: 'CSRF_INVALID', message: 'Permintaan tidak memiliki token CSRF yang valid.' })
    return
  }
  next()
})


const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'RATE_LIMITED', message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
})

app.get('/api/health', async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    response.json({ status: 'ok', service: 'han-wedding-api', database: 'ok' })
  } catch {
    response.status(503).json({ status: 'degraded', service: 'han-wedding-api', database: 'unavailable' })
  }
})

app.use('/api/invitations/:token/rsvp', publicWriteLimiter)
app.use('/api/invitations/:token/messages', publicWriteLimiter)
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)
app.use('/api/attendance', attendanceRouter)
app.use('/api/invitations', invitationRouter)
app.use(errorHandler)
