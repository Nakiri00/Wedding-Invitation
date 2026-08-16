import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const JWT_TTL_SECONDS = 60 * 60 * 8

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const derived = (await scrypt(password, salt, 64)) as Buffer
  return `scrypt:${salt}:${derived.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string) {
  const [, salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const derived = (await scrypt(password, salt, 64)) as Buffer
  const expected = Buffer.from(hash, 'hex')
  return expected.length === derived.length && timingSafeEqual(expected, derived)
}

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString('base64url')
}

function sign(input: string, secret: string) {
  return createHmac('sha256', secret).update(input).digest('base64url')
}

export function createAccessToken(payload: { sub: string; role: 'ADMIN' | 'STAFF'; name: string }, secret: string) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64url(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + JWT_TTL_SECONDS }))
  return `${header}.${body}.${sign(`${header}.${body}`, secret)}`
}

export function verifyAccessToken(token: string, secret: string) {
  const [header, body, signature] = token.split('.')
  if (!header || !body || !signature) return null
  const expected = sign(`${header}.${body}`, secret)
  const actual = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (actual.length !== expectedBuffer.length || !timingSafeEqual(actual, expectedBuffer)) return null
  let payload: { sub: string; role: 'ADMIN' | 'STAFF'; name: string; exp: number }
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as { sub: string; role: 'ADMIN' | 'STAFF'; name: string; exp: number }
  } catch {
    return null
  }
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
  return payload
}
