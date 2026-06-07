// 활동소식 SQL을 posts 테이블에 적재
//   기본: migrations/seed_activity_posts.blob.sql (Blob URL 치환본)
//   --raw 옵션 시: migrations/seed_activity_posts.sql (원본 belife URL)
import { readFileSync, existsSync } from 'node:fs'
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

const useRaw = process.argv.includes('--raw')
const blobSql = join(ROOT, 'migrations', 'seed_activity_posts.blob.sql')
const rawSql = join(ROOT, 'migrations', 'seed_activity_posts.sql')
const sqlPath = useRaw ? rawSql : existsSync(blobSql) ? blobSql : rawSql
const sql = readFileSync(sqlPath, 'utf-8')

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
})

try {
  console.log('연결 중…')
  await client.connect()
  // posts 테이블 존재 확인
  const { rows: chk } = await client.query(
    "SELECT to_regclass('public.posts') AS t",
  )
  if (!chk[0].t) {
    console.error('posts 테이블 없음 — 먼저 migrations/001_init.sql 적용 필요 (node scripts/init-db.mjs)')
    process.exit(1)
  }
  const before = (await client.query("SELECT COUNT(*)::int n FROM posts WHERE category='activity'")).rows[0].n
  console.log(`적재 전 activity 게시글: ${before}`)
  console.log(`적용 중: ${sqlPath.replace(ROOT + '/', '')}`)
  await client.query(sql) // 파일 내부에 BEGIN/COMMIT 포함
  const after = (await client.query("SELECT COUNT(*)::int n FROM posts WHERE category='activity'")).rows[0].n
  console.log(`적재 후 activity 게시글: ${after} (신규 ${after - before}건)`)
} catch (err) {
  console.error('적재 실패:', err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
