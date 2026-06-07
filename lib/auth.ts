import 'server-only'
import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'belife_admin'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

function getSecret(): string {
  // SESSION_SECRET signs the session cookie. Fall back to ADMIN_PASSWORD so
  // local dev works with a single secret, but a dedicated secret is preferred.
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD
  if (!secret) {
    throw new Error('SESSION_SECRET (or ADMIN_PASSWORD) must be set for admin auth')
  }
  return secret
}

function sign(value: string): string {
  return createHmac('sha256', getSecret()).update(value).digest('hex')
}

/** Constant-time string comparison that tolerates differing lengths. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) {
    // Still run a comparison to keep timing roughly constant.
    timingSafeEqual(ab, ab)
    return false
  }
  return timingSafeEqual(ab, bb)
}

/** Verify a submitted password against ADMIN_PASSWORD in constant time. */
export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    throw new Error('ADMIN_PASSWORD is not set')
  }
  return safeEqual(input, expected)
}

/** Build a signed session token of the form `<expiresAtMs>.<hmac>`. */
function createToken(): string {
  const expiresAt = String(Date.now() + MAX_AGE_SECONDS * 1000)
  return `${expiresAt}.${sign(expiresAt)}`
}

function isTokenValid(token: string | undefined): boolean {
  if (!token) return false
  const dot = token.lastIndexOf('.')
  if (dot <= 0) return false
  const expiresAt = token.slice(0, dot)
  const signature = token.slice(dot + 1)
  if (!safeEqual(signature, sign(expiresAt))) return false
  const exp = Number(expiresAt)
  return Number.isFinite(exp) && exp > Date.now()
}

/** Set the admin session cookie. Must be called inside a Server Action or Route Handler. */
export async function startSession(): Promise<void> {
  const store = await cookies()
  store.set(COOKIE_NAME, createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

/** Clear the admin session cookie. Must be called inside a Server Action or Route Handler. */
export async function endSession(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

/** Whether the current request carries a valid admin session. Readable anywhere. */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies()
  return isTokenValid(store.get(COOKIE_NAME)?.value)
}
