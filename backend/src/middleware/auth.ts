import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env.js'
import { verifyAccessToken } from '../lib/security.js'
import { AUTH_COOKIE, getCookie } from '../lib/cookies.js'

export type AuthUser = { sub: string; role: 'ADMIN' | 'STAFF'; name: string }
declare module 'express-serve-static-core' {
  interface Request {
    authUser?: AuthUser
  }
}

export function requireAuth(roles?: Array<AuthUser['role']>) {
  return (request: Request, response: Response, next: NextFunction) => {
    const header = request.header('authorization')
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null
    const token = getCookie(request, AUTH_COOKIE) ?? bearer
    const user = token ? verifyAccessToken(token, env.JWT_SECRET) : null
    if (!user) return response.status(401).json({ error: 'UNAUTHORIZED', message: 'Sesi tidak valid atau sudah kedaluwarsa.' })
    if (roles && !roles.includes(user.role)) return response.status(403).json({ error: 'FORBIDDEN', message: 'Anda tidak memiliki akses.' })
    request.authUser = user
    next()
  }
}
