// 임의의 SQL 파일을 DATABASE_URL 에 적용하는 범용 러너.
//   node scripts/run-sql.mjs migrations/seed_archive_tags.sql [...]
// 파일 안의 BEGIN/COMMIT 을 그대로 존중한다(파일 단위로 한 번에 실행).
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
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

const files = process.argv.slice(2)
if (!files.length) {
  console.error('적용할 SQL 파일을 지정해 주세요. 예) node scripts/run-sql.mjs migrations/018_x.sql')
  process.exit(2)
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL 미설정')
  process.exit(1)
}

const url = process.env.DATABASE_URL
const client = new Client({
  connectionString: url,
  ssl: url.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
})

try {
  await client.connect()
  for (const f of files) {
    const p = resolve(ROOT, f)
    if (!existsSync(p)) {
      console.warn(`(건너뜀) 없음: ${p}`)
      continue
    }
    const sql = readFileSync(p, 'utf-8')
    const res = await client.query(sql)
    const counts = Array.isArray(res) ? res.map(r => r.rowCount ?? 0) : [res.rowCount ?? 0]
    const total = counts.reduce((a, b) => a + b, 0)
    console.log(`적용: ${f} (영향 행 ${total})`)
  }
} catch (err) {
  console.error('적용 실패:', err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
