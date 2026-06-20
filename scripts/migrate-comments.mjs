import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const { Client } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local manually (no dotenv dep)
const envPath = join(__dirname, '..', '.env.local')
try {
  const env = readFileSync(envPath, 'utf-8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
} catch {
  // .env.local missing — fall back to ambient env
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set in .env.local or environment')
  process.exit(1)
}

const sqlPath = join(__dirname, '..', 'migrations', '010_comments.sql')
const sql = readFileSync(sqlPath, 'utf-8')

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
})

try {
  console.log('Connecting…')
  await client.connect()
  console.log('Applying migrations/010_comments.sql…')
  await client.query(sql)
  const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'comments'`,
  )
  if (rows.length > 0) {
    console.log('✓ Comments table created successfully')
  }
  console.log('Done.')
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
