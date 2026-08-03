import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const { Client } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))

try {
  const env = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
} catch {}

if (!process.env.DATABASE_URL) { console.error('DATABASE_URL 없음'); process.exit(1) }

const sql = readFileSync(join(__dirname, '..', 'migrations', '017_hero_slide_text.sql'), 'utf-8')
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
})

try {
  console.log('Connecting…')
  await client.connect()
  console.log('Applying migrations/017_hero_slide_text.sql…')
  await client.query(sql)
  const { rows } = await client.query(
    `SELECT column_name FROM information_schema.columns
      WHERE table_name = 'hero_slides' AND column_name IN ('title','subtitle') ORDER BY column_name`,
  )
  console.log('추가된 컬럼:', rows.map((r) => r.column_name).join(', '))
  console.log('Done.')
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
