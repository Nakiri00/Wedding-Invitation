import { randomBytes } from 'node:crypto'
import type { Request, Response } from 'express'

export const AUTH_COOKIE = 'han_wedding_auth'
export const CSRF_COOKIE = 'han_wedding_csrf'

function parseCookies(header: string | undefined) {
  const cookies: Record<string, string> = {}
  if (!header) return cookies
  for (const part of header.split(';')) {
    const [rawKey, ...rawValue] = part.trim().split('=')
    if (!rawKey) continue
    cookies[rawKey] = decodeURIComponent(rawValue.join('='))
  }
  return cookies
}

export function getCookie(request: Request, name: string) {
  return parseCookies(request.header('cookie'))[name]
}

export function issueCsrfToken(response: Response) {
  const token = randomBytes(24).toString('base64url')
  response.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 1000,
  })
  return token
}

export function setAuthCookie(response: Response, token: string) {
  response.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000,
  })
}

export function clearAuthCookie(response: Response) {
  response.clearCookie(AUTH_COOKIE, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' })
}
