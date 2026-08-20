import 'server-only'
import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'belife_admin'
/** 사무국 게시판 열람 세션(관리자와 별개). 같은 비밀로 서명하되 scope 로 구분한다. */
const OFFICE_COOKIE_NAME = 'belife_office'
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

// ── 사무국 게시판 열람 세션 ────────────────────────────────────────────────
// 레거시 belife.org 에서 '사무국'은 로그인한 사람만 볼 수 있는 게시판이었다.
// 회원 시스템이 없으므로 열람용 비밀번호(OFFICE_PASSWORD) 하나로 문을 연다.
// OFFICE_PASSWORD 를 두지 않으면 관리자 비밀번호(ADMIN_PASSWORD)로 들어갈 수 있다.

/** 사무국 열람 비밀번호 검증(상수 시간 비교). */
export function verifyOfficePassword(input: string): boolean {
  const expected = process.env.OFFICE_PASSWORD || process.env.ADMIN_PASSWORD
  if (!expected) {
    throw new Error('OFFICE_PASSWORD (or ADMIN_PASSWORD) is not set')
  }
  return safeEqual(input, expected)
}

/** scope 를 서명에 포함해 관리자 토큰과 서로 재사용되지 않게 한다. */
function createScopedToken(scope: string): string {
  const expiresAt = String(Date.now() + MAX_AGE_SECONDS * 1000)
  return `${expiresAt}.${sign(`${scope}:${expiresAt}`)}`
}

function isScopedTokenValid(scope: string, token: string | undefined): boolean {
  if (!token) return false
  const dot = token.lastIndexOf('.')
  if (dot <= 0) return false
  const expiresAt = token.slice(0, dot)
  const signature = token.slice(dot + 1)
  if (!safeEqual(signature, sign(`${scope}:${expiresAt}`))) return false
  const exp = Number(expiresAt)
  return Number.isFinite(exp) && exp > Date.now()
}

/** 사무국 열람 세션 쿠키를 설정한다. Server Action / Route Handler 안에서만 호출. */
export async function startOfficeSession(): Promise<void> {
  const store = await cookies()
  store.set(OFFICE_COOKIE_NAME, createScopedToken('office'), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

/** 사무국 열람 세션 쿠키를 지운다. */
export async function endOfficeSession(): Promise<void> {
  const store = await cookies()
  store.delete(OFFICE_COOKIE_NAME)
}

/**
 * 사무국 게시판 열람 권한의 출처.
 *  - 'office' : 사무국 열람 비밀번호로 로그인한 세션
 *  - 'admin'  : 관리자 세션(사무국 로그인 없이도 통과)
 *  - null     : 볼 수 없음
 *
 * 출처를 구분해야 '로그아웃'이 무엇을 끊는지 화면에서 정확히 안내할 수 있다.
 * (관리자 세션으로 보고 있으면 사무국 로그아웃을 눌러도 계속 보인다)
 */
export async function getOfficeAccess(): Promise<'office' | 'admin' | null> {
  const store = await cookies()
  if (isScopedTokenValid('office', store.get(OFFICE_COOKIE_NAME)?.value)) return 'office'
  if (isTokenValid(store.get(COOKIE_NAME)?.value)) return 'admin'
  return null
}

/** 사무국 게시판을 볼 수 있는지. 관리자로 로그인돼 있어도 통과한다. */
export async function canViewOffice(): Promise<boolean> {
  return (await getOfficeAccess()) !== null
}
