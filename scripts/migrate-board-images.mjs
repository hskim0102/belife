// belife 게시판(공지/사진/웹진/동영상/소개/보도/표창/달력) 본문·첨부 이미지
//   → Vercel Blob 이전 + SQL URL 치환
//
// 활동소식 전용 migrate-activity-images.mjs 의 범용판.
// 여러 seed_<category>_posts.sql 을 한 번에 처리하고, 각 파일마다 .blob.sql 을 만든다.
// 공유 매니페스트(scripts/.board-image-map.json)로 중단 시 재개 가능.
//
// 이미지 URL 패턴(2026-06 확인):
//   http://www.belife.org/belife/data/file/<bo>/...   (그누보드 첨부 이미지)
//   http://(www.)belife.org/belife/data/cheditor.../  (본문 에디터 이미지)
//
// 사용법:
//   node scripts/migrate-board-images.mjs                  # 전체 seed 처리(다운로드+업로드+SQL)
//   node scripts/migrate-board-images.mjs --rewrite        # 업로드 건너뛰고 매니페스트로 SQL만 재생성
//   node scripts/migrate-board-images.mjs notice photo     # 특정 카테고리만 처리
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import crypto from 'node:crypto'
import { put } from '@vercel/blob'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ── .env.local 수동 로드 ────────────────────────────────────────────────────
try {
  const env = readFileSync(join(ROOT, '.env.local'), 'utf-8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
} catch {
  /* .env.local 없으면 ambient env 사용 */
}

// 마이그레이션 대상 게시판 카테고리(활동소식 activity 는 별도 스크립트로 처리됨)
const ALL_CATEGORIES = [
  'notice', 'photo', 'webzine', 'video',
  'intro', 'press', 'award', 'calendar',
]

const MIGRATIONS = join(ROOT, 'migrations')
const IMG_DIR = join(ROOT, 'belife-board-images')
const MANIFEST = join(__dirname, '.board-image-map.json')

const CONCURRENCY = 8
const UA = 'Mozilla/5.0 (compatible; belife-archiver/1.0)'
// www 유무 모두, data/ 하위 모든 이미지 경로(첨부 file/ 와 본문 cheditor/ 포함)
const URL_RE = /https?:\/\/(?:www\.)?belife\.org\/belife\/data\/[^\s"'<>()]+?\.(?:jpe?g|png|gif)/gi
const CONTENT_TYPE = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif' }

const args = process.argv.slice(2)
const rewriteOnly = args.includes('--rewrite')
const catArgs = args.filter((a) => !a.startsWith('--'))
const categories = catArgs.length ? catArgs : ALL_CATEGORIES

function srcSql(cat) {
  return join(MIGRATIONS, `seed_${cat}_posts.sql`)
}
function outSql(cat) {
  return join(MIGRATIONS, `seed_${cat}_posts.blob.sql`)
}

function loadManifest() {
  if (existsSync(MANIFEST)) {
    try {
      return JSON.parse(readFileSync(MANIFEST, 'utf-8'))
    } catch {
      /* 손상 시 새로 시작 */
    }
  }
  return {} // { [origUrl]: { blobUrl, local, ok } }
}

function saveManifest(map) {
  writeFileSync(MANIFEST, JSON.stringify(map, null, 2))
}

function keyFor(url) {
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 8)
  const base = url.split('/').pop().replace(/[^\w.\-]/g, '_')
  return { name: `${hash}_${base}`, ext: (base.split('.').pop() || 'jpg').toLowerCase() }
}

async function migrateOne(url, map) {
  if (map[url]?.ok) return // 이미 처리됨(재개)
  const { name, ext } = keyFor(url)
  const localPath = join(IMG_DIR, name)
  try {
    let buf
    if (existsSync(localPath)) {
      buf = readFileSync(localPath)
    } else {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      buf = Buffer.from(await res.arrayBuffer())
      writeFileSync(localPath, buf)
    }
    const result = await put(`board/${name}`, buf, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: CONTENT_TYPE[ext] || 'image/jpeg',
    })
    map[url] = { blobUrl: result.url, local: `belife-board-images/${name}`, ok: true }
  } catch (e) {
    map[url] = { blobUrl: null, local: existsSync(localPath) ? `belife-board-images/${name}` : null, ok: false, error: String(e.message || e) }
    console.error(`  ! 실패: ${url} (${e.message || e})`)
  }
}

async function runPool(urls, map) {
  let i = 0
  let done = 0
  const total = urls.length
  async function worker() {
    while (i < urls.length) {
      const url = urls[i++]
      await migrateOne(url, map)
      done++
      if (done % 25 === 0) {
        console.log(`  ... ${done}/${total}`)
        saveManifest(map)
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  saveManifest(map)
}

function rewriteSqlFor(cat, map) {
  const src = srcSql(cat)
  if (!existsSync(src)) return null
  let sql = readFileSync(src, 'utf-8')
  const entries = Object.entries(map)
    .filter(([, v]) => v.ok && v.blobUrl)
    .sort((a, b) => b[0].length - a[0].length) // 긴 URL 먼저
  let count = 0
  for (const [orig, v] of entries) {
    const parts = sql.split(orig)
    if (parts.length > 1) {
      count += parts.length - 1
      sql = parts.join(v.blobUrl)
    }
  }
  sql = `-- [이미지 Vercel Blob 이전 적용본 — 원본: seed_${cat}_posts.sql]\n` + sql
  writeFileSync(outSql(cat), sql)
  return count
}

function collectUrls() {
  const set = new Set()
  for (const cat of categories) {
    const src = srcSql(cat)
    if (!existsSync(src)) {
      console.warn(`(건너뜀) ${src} 없음`)
      continue
    }
    const sql = readFileSync(src, 'utf-8')
    for (const u of sql.match(URL_RE) || []) set.add(u)
  }
  return [...set]
}

async function main() {
  if (!existsSync(IMG_DIR)) mkdirSync(IMG_DIR, { recursive: true })
  const urls = collectUrls()
  console.log(`대상 카테고리: ${categories.join(', ')}`)
  console.log(`고유 이미지 URL: ${urls.length}개`)

  const map = loadManifest()

  if (!rewriteOnly) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN 미설정 — .env.local 확인 필요')
      process.exit(1)
    }
    const pending = urls.filter((u) => !map[u]?.ok)
    console.log(`업로드 대상(미완료): ${pending.length}개 (완료 ${urls.length - pending.length}개 건너뜀)`)
    await runPool(pending, map)
  }

  const okCount = urls.filter((u) => map[u]?.ok).length
  const failCount = urls.length - okCount
  console.log('─'.repeat(48))
  let totalReplaced = 0
  for (const cat of categories) {
    const n = rewriteSqlFor(cat, map)
    if (n === null) continue
    totalReplaced += n
    console.log(`  ${cat}: URL 치환 ${n}건 → ${outSql(cat)}`)
  }
  console.log('─'.repeat(48))
  console.log(`이미지 업로드 성공: ${okCount} / 실패: ${failCount}`)
  console.log(`SQL 내 URL 치환 합계: ${totalReplaced}건`)
  console.log(`로컬 보관: ${IMG_DIR}`)
  console.log(`매니페스트: ${MANIFEST}`)
  if (failCount) console.log(`(실패 이미지는 원본 belife URL 유지)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
