import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const { Client } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))

const envPath = join(__dirname, '..', '.env.local')
try {
  const env = readFileSync(envPath, 'utf-8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
} catch {
  // .env.local 없으면 ambient env 사용
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set in .env.local or environment')
  process.exit(1)
}

const sqlPath = join(__dirname, '..', 'migrations', '016_report_category.sql')
const sql = readFileSync(sqlPath, 'utf-8')

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
})

try {
  console.log('Connecting…')
  await client.connect()
  console.log('Applying migrations/016_report_category.sql…')
  await client.query(sql)
  const { rows } = await client.query(
    `SELECT conname, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conname = 'posts_category_check'`,
  )
  console.log(rows[0]?.def ?? '(constraint not found)')
  console.log('Done.')
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
