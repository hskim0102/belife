// belife 활동소식 본문 이미지 → Vercel Blob 이전 + SQL URL 치환
//
// 동작:
//   1) migrations/seed_activity_posts.sql 에서 belife 이미지 URL(고유) 추출
//   2) 각 이미지를 belife 서버에서 다운로드해 로컬 보관(belife-activity-images/)
//   3) Vercel Blob 에 업로드(activity/<hash>_<basename>, 결정적 경로 → 재실행 idempotent)
//   4) 원본 URL → Blob URL 매핑을 만들어 SQL 전체를 치환
//      → migrations/seed_activity_posts.blob.sql 생성
//   매니페스트(scripts/.activity-image-map.json)로 중단 시 재개 가능.
//
// 사용법:
//   node scripts/migrate-activity-images.mjs           # 다운로드+업로드+SQL 생성
//   node scripts/migrate-activity-images.mjs --rewrite # 업로드 건너뛰고 매니페스트로 SQL만 재생성
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import crypto from 'node:crypto'
import { put } from '@vercel/blob'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ── .env.local 수동 로드 (migrate-board.mjs 패턴) ───────────────────────────
try {
  const env = readFileSync(join(ROOT, '.env.local'), 'utf-8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
} catch {
  /* .env.local 없으면 ambient env 사용 */
}

const SRC_SQL = join(ROOT, 'migrations', 'seed_activity_posts.sql')
const OUT_SQL = join(ROOT, 'migrations', 'seed_activity_posts.blob.sql')
const IMG_DIR = join(ROOT, 'belife-activity-images')
const MANIFEST = join(__dirname, '.activity-image-map.json')

const CONCURRENCY = 8
const UA = 'Mozilla/5.0 (compatible; belife-archiver/1.0)'
const URL_RE = /http:\/\/www\.belife\.org\/belife\/data\/[^\s"'<>()]+?\.(?:jpe?g|png|gif)/gi
const CONTENT_TYPE = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif' }

const rewriteOnly = process.argv.includes('--rewrite')

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
    // 1) 다운로드 (로컬 캐시 있으면 재사용)
    let buf
    if (existsSync(localPath)) {
      buf = readFileSync(localPath)
    } else {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      buf = Buffer.from(await res.arrayBuffer())
      writeFileSync(localPath, buf)
    }
    // 2) Blob 업로드 (결정적 경로 → 재실행 idempotent)
    const result = await put(`activity/${name}`, buf, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: CONTENT_TYPE[ext] || 'image/jpeg',
    })
    map[url] = { blobUrl: result.url, local: `belife-activity-images/${name}`, ok: true }
  } catch (e) {
    map[url] = { blobUrl: null, local: existsSync(localPath) ? `belife-activity-images/${name}` : null, ok: false, error: String(e.message || e) }
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

function rewriteSql(map) {
  let sql = readFileSync(SRC_SQL, 'utf-8')
  // 긴 URL 먼저 치환(짧은 URL이 긴 URL의 접두어인 경우 방지)
  const entries = Object.entries(map)
    .filter(([, v]) => v.ok && v.blobUrl)
    .sort((a, b) => b[0].length - a[0].length)
  let count = 0
  for (const [orig, v] of entries) {
    const parts = sql.split(orig)
    if (parts.length > 1) {
      count += parts.length - 1
      sql = parts.join(v.blobUrl)
    }
  }
  // 헤더 한 줄 추가
  sql = sql.replace(
    '-- belife.org 활동소식',
    `-- [이미지 ${entries.length}개 Vercel Blob 이전 완료, 본문 URL 치환됨]\n-- belife.org 활동소식`,
  )
  writeFileSync(OUT_SQL, sql)
  return { replacedOccurrences: count, migratedImages: entries.length }
}

async function main() {
  if (!existsSync(IMG_DIR)) mkdirSync(IMG_DIR, { recursive: true })
  const sql = readFileSync(SRC_SQL, 'utf-8')
  const urls = [...new Set(sql.match(URL_RE) || [])]
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
  const { replacedOccurrences } = rewriteSql(map)
  console.log('─'.repeat(48))
  console.log(`이미지 업로드 성공: ${okCount} / 실패: ${failCount}`)
  console.log(`SQL 내 URL 치환: ${replacedOccurrences}건`)
  console.log(`생성: ${OUT_SQL}`)
  console.log(`로컬 보관: ${IMG_DIR}`)
  console.log(`매니페스트: ${MANIFEST}`)
  if (failCount) console.log(`(실패 이미지는 원본 belife URL 유지)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
