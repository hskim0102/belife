import 'server-only'
import { Pool, type QueryResultRow } from 'pg'

declare global {
  var __pgPool: Pool | null | undefined
}

function createPool(): Pool | null {
  const { PG_POOL_MAX } = process.env
  // Prisma Postgres 무료 한도 초과로 Neon 으로 옮겼다. DATABASE_URL 은 Prisma 연동이 관리하는
  // 값이라 남겨 두고, NEON_DATABASE_URL 이 있으면 그쪽을 쓴다.
  const DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL

  if (!DATABASE_URL) {
    if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('[db] NEON_DATABASE_URL / DATABASE_URL not set — queries will return empty results.')
      return null
    }
    throw new Error('NEON_DATABASE_URL or DATABASE_URL is required')
  }

  // Strip sslmode from URL and set ssl option explicitly to suppress pg's
  // deprecation warning about sslmode=require semantics changing in pg v9.
  let connectionString = DATABASE_URL
  let ssl: { rejectUnauthorized: boolean } | undefined

  try {
    const url = new URL(DATABASE_URL)
    const sslmode = url.searchParams.get('sslmode')
    if (sslmode) {
      url.searchParams.delete('sslmode')
      connectionString = url.toString()
      ssl = { rejectUnauthorized: sslmode === 'verify-full' }
    }
  } catch {
    if (DATABASE_URL.includes('sslmode=require')) {
      ssl = { rejectUnauthorized: false }
    }
  }

  // 서버리스(Vercel)에서는 요청을 받는 인스턴스마다 이 풀이 따로 생긴다.
  // 인스턴스가 여러 개 뜨면 (인스턴스 수 × max) 만큼 커넥션을 잡게 되는데,
  // Prisma Postgres 처럼 커넥션 한도가 빡빡한 DB 는 금세 한도를 넘겨
  // 'too many connections' 로 요청이 통째로 500 이 된다.
  // 그래서 인스턴스당 커넥션은 최소로, 유휴 커넥션은 빨리 반납하도록 잡는다.
  const isServerless = Boolean(process.env.VERCEL)
  return new Pool({
    connectionString,
    max: PG_POOL_MAX ? Number(PG_POOL_MAX) : isServerless ? 1 : 3,
    // 유휴 커넥션을 오래 붙들지 않는다(기본 10초 → 3초).
    idleTimeoutMillis: 3_000,
    // 커넥션을 못 얻을 때 무한정 기다리지 않고 명확히 실패시킨다.
    connectionTimeoutMillis: 10_000,
    // 유휴 상태에서 프로세스가 정리될 수 있게 한다(서버리스에서 커넥션 반납에 유리).
    allowExitOnIdle: true,
    ssl,
  })
}

function getPool(): Pool | null {
  if (global.__pgPool === undefined) {
    global.__pgPool = createPool()
  }
  return global.__pgPool
}

export async function query<T extends QueryResultRow>(
  sql: string,
  params?: ReadonlyArray<unknown>,
): Promise<T[]> {
  const pool = getPool()
  if (!pool) return []
  const result = await pool.query<T>(sql, params as unknown[] | undefined)
  return result.rows
}

export async function queryOne<T extends QueryResultRow>(
  sql: string,
  params?: ReadonlyArray<unknown>,
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}
