import 'server-only'
import { Pool, type QueryResultRow } from 'pg'

declare global {
  var __pgPool: Pool | null | undefined
}

function createPool(): Pool | null {
  const { DATABASE_URL, PG_POOL_MAX } = process.env

  if (!DATABASE_URL) {
    if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('[db] DATABASE_URL not set — queries will return empty results.')
      return null
    }
    throw new Error('DATABASE_URL is required')
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

  return new Pool({
    connectionString,
    max: PG_POOL_MAX ? Number(PG_POOL_MAX) : 10,
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
