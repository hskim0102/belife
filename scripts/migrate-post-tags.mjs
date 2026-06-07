// posts.tags 컬럼 추가(004) + 활동소식 분류 태그 적재(seed_activity_tags)
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const { Client } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

try {
  const env = readFileSync(join(ROOT, '.env.local'), 'utf-8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
} catch {
  /* ambient env */
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL 미설정')
  process.exit(1)
}

const schemaSql = readFileSync(join(ROOT, 'migrations', '004_post_tags.sql'), 'utf-8')
const dataSql = readFileSync(join(ROOT, 'migrations', 'seed_activity_tags.sql'), 'utf-8')

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
})

try {
  console.log('연결 중…')
  await client.connect()
  console.log('적용: migrations/004_post_tags.sql (tags 컬럼 + GIN 인덱스)')
  await client.query(schemaSql)
  console.log('적용: migrations/seed_activity_tags.sql (태그 UPDATE)')
  await client.query(dataSql)
  const { rows } = await client.query(
    `SELECT unnest(tags) AS tag, count(*)::int n
       FROM posts WHERE category='activity' AND cardinality(tags) > 0
      GROUP BY tag ORDER BY n DESC`,
  )
  console.log('적재 후 태그 분포:')
  for (const r of rows) console.log(`  ${r.tag}: ${r.n}`)
} catch (err) {
  console.error('적용 실패:', err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
