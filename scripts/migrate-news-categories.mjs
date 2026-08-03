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

const sqlPath = join(__dirname, '..', 'migrations', '015_news_categories.sql')
const sql = readFileSync(sqlPath, 'utf-8')

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
})

try {
  console.log('Connecting…')
  await client.connect()
  console.log('Applying migrations/015_news_categories.sql…')
  await client.query(sql)
  const { rows } = await client.query(
    `SELECT c.label, c.sort_order,
            (SELECT count(*) FROM posts p WHERE p.category = 'activity' AND c.label = ANY(p.tags)) AS posts
       FROM news_categories c
      ORDER BY c.sort_order, c.id`,
  )
  console.table(rows)
  console.log('Done.')
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
