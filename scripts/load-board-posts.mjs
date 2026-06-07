// belife 게시판 seed(공지/사진/웹진/동영상/소개/보도/표창/달력)를 posts 테이블에 적재
//   기본: migrations/seed_<cat>_posts.blob.sql (Blob URL 치환본)
//   --raw 옵션 시: migrations/seed_<cat>_posts.sql (원본 belife URL)
//
// 적재 전 005_board_categories.sql(category 제약 확장)을 먼저 적용한다(idempotent).
//
// 사용법:
//   node scripts/load-board-posts.mjs                  # 005 + 8개 게시판 전체 적재
//   node scripts/load-board-posts.mjs notice award     # 특정 카테고리만
//   node scripts/load-board-posts.mjs --raw            # Blob 미사용, 원본 URL 적재
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

const ALL = ['notice', 'photo', 'webzine', 'video', 'intro', 'press', 'award', 'calendar']
const args = process.argv.slice(2)
const useRaw = args.includes('--raw')
const cats = args.filter((a) => !a.startsWith('--'))
const categories = cats.length ? cats : ALL

function seedPath(cat) {
  const blob = join(ROOT, 'migrations', `seed_${cat}_posts.blob.sql`)
  const raw = join(ROOT, 'migrations', `seed_${cat}_posts.sql`)
  return useRaw ? raw : existsSync(blob) ? blob : raw
}

const url = process.env.DATABASE_URL
const client = new Client({
  connectionString: url,
  ssl: url.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
})

async function count(cat) {
  const r = await client.query('SELECT count(*)::int n FROM posts WHERE category=$1', [cat])
  return r.rows[0].n
}

try {
  console.log('연결 중…')
  await client.connect()

  const chk = (await client.query("SELECT to_regclass('public.posts') t")).rows[0].t
  if (!chk) {
    console.error('posts 테이블 없음 — 먼저 node scripts/init-db.mjs')
    process.exit(1)
  }

  // 1) 카테고리 제약 확장(005) — idempotent
  console.log('005_board_categories.sql 적용(제약 확장)…')
  await client.query(readFileSync(join(ROOT, 'migrations', '005_board_categories.sql'), 'utf-8'))

  // 2) 게시판별 seed 적재
  let grand = 0
  for (const cat of categories) {
    const p = seedPath(cat)
    if (!existsSync(p)) {
      console.warn(`(건너뜀) ${cat}: seed 파일 없음`)
      continue
    }
    const before = await count(cat)
    await client.query(readFileSync(p, 'utf-8')) // 파일 내부 BEGIN/COMMIT 포함
    const after = await count(cat)
    grand += after - before
    console.log(`  ${cat.padEnd(9)} : ${before} → ${after}  (신규 ${after - before}건)  [${p.split('/').pop()}]`)
  }

  console.log('─'.repeat(48))
  const total = (await client.query('SELECT count(*)::int n FROM posts')).rows[0].n
  console.log(`신규 적재 합계: ${grand}건 / posts 총 ${total}건`)
} catch (err) {
  console.error('적재 실패:', err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
