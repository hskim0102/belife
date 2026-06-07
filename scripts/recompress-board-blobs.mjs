// belife 게시판 이미지 재압축 + Blob 재업로드 (무료 1GB 플랜 수용용)
//
// 배경: 사진게시판 원본 사진이 커서 Vercel Blob Hobby(1GB) 한도를 초과했다.
// 이 스크립트는 로컬에 받아둔 게시판 이미지를 sharp 로 리사이즈/압축한 뒤
// 기존 board/ blob 을 모두 지우고 압축본으로 재업로드한다.
//
// 동작:
//   1) 기존 board/ prefix blob 전부 삭제(쿼터 확보)
//   2) 매니페스트(.board-image-map.json)의 로컬 이미지(성공분 + 쿼터실패분)를
//      1024px / JPEG 품질 75 로 압축
//   3) 동일 경로(board/<name>)로 재업로드, 매니페스트 갱신
//   4) seed_<cat>_posts.blob.sql 재생성은 migrate-board-images.mjs --rewrite 로 별도 수행
//
// 404(원본에 없던 이미지)는 로컬 파일이 없으므로 건너뛴다(원본 URL 유지).
//
// 사용법:
//   node scripts/recompress-board-blobs.mjs            # 삭제 + 압축 + 재업로드
//   node scripts/recompress-board-blobs.mjs --no-delete # 기존 삭제 생략(덮어쓰기만)
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'
import { put, del, list } from '@vercel/blob'

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

const MANIFEST = join(__dirname, '.board-image-map.json')
const MAX_WIDTH = 1024
const JPEG_Q = 75
const CONCURRENCY = 4
const noDelete = process.argv.includes('--no-delete')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Vercel Blob API 의 rate limit(429, retryAfter) 을 존중하며 재시도.
async function withRetry(fn, label, maxAttempts = 8) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn()
    } catch (e) {
      const ra = e?.retryAfter
      const is429 = ra != null || /rate|429|too many/i.test(String(e?.message || ''))
      if (!is429 || attempt >= maxAttempts) throw e
      const wait = ((ra || 30) + 1) * 1000
      console.log(`  ${label} rate-limited → ${Math.round(wait / 1000)}s 대기(시도 ${attempt})`)
      await sleep(wait)
    }
  }
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN 미설정 — .env.local 확인 필요')
  process.exit(1)
}

function loadManifest() {
  return JSON.parse(readFileSync(MANIFEST, 'utf-8'))
}
function saveManifest(map) {
  writeFileSync(MANIFEST, JSON.stringify(map, null, 2))
}

async function deleteBoardBlobs() {
  console.log('기존 board/ blob 삭제 중...')
  let cursor
  let removed = 0
  do {
    const r = await withRetry(() => list({ prefix: 'board/', cursor, limit: 1000 }), 'list')
    const urls = r.blobs.map((b) => b.url)
    for (let i = 0; i < urls.length; i += 50) {
      const batch = urls.slice(i, i + 50)
      await withRetry(() => del(batch), 'del')
      removed += batch.length
      await sleep(300)
    }
    cursor = r.cursor
  } while (cursor)
  console.log(`  삭제 완료: ${removed}개`)
}

async function compress(buf, ext) {
  // 애니메이션 가능성이 있는 gif 는 건드리지 않고 그대로 둔다.
  if (ext === 'gif') return { out: buf, contentType: 'image/gif' }
  // 그 외(jpg/png 등)는 1024px 이내로 줄여 JPEG 로 통일(최대 압축).
  const out = await sharp(buf, { failOn: 'none' })
    .rotate() // EXIF 회전 반영
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: JPEG_Q, mozjpeg: true })
    .toBuffer()
  return { out, contentType: 'image/jpeg' }
}

async function main() {
  const map = loadManifest()

  if (!noDelete) await deleteBoardBlobs()

  // 로컬 파일이 있는 항목만 재업로드 대상(성공분 + 쿼터실패분). 404는 local=null → 제외.
  const targets = Object.entries(map).filter(
    ([, v]) => v.local && existsSync(join(ROOT, v.local)),
  )
  console.log(`압축·재업로드 대상: ${targets.length}개 (1024px / JPEG q${JPEG_Q})`)

  let i = 0
  let done = 0
  let origBytes = 0
  let newBytes = 0
  let fail = 0

  async function worker() {
    while (i < targets.length) {
      const idx = i++
      const [url, v] = targets[idx]
      const localAbs = join(ROOT, v.local)
      const name = v.local.split('/').pop()
      const ext = (name.split('.').pop() || 'jpg').toLowerCase()
      try {
        const buf = readFileSync(localAbs)
        origBytes += buf.length
        const { out, contentType } = await compress(buf, ext)
        newBytes += out.length
        const res = await withRetry(
          () =>
            put(`board/${name}`, out, {
              access: 'public',
              addRandomSuffix: false,
              allowOverwrite: true,
              contentType,
            }),
          'put',
        )
        map[url] = { blobUrl: res.url, local: v.local, ok: true }
      } catch (e) {
        fail++
        map[url] = { ...v, ok: false, error: String(e.message || e) }
        console.error(`  ! 실패: ${url} (${e.message || e})`)
      }
      done++
      if (done % 100 === 0) {
        console.log(
          `  ... ${done}/${targets.length}  (원본 ${(origBytes / 1048576).toFixed(0)}MB → 압축 ${(newBytes / 1048576).toFixed(0)}MB)`,
        )
        saveManifest(map)
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  saveManifest(map)

  const mb = (x) => (x / 1048576).toFixed(1) + 'MB'
  console.log('─'.repeat(48))
  console.log(`재업로드 성공: ${done - fail} / 실패: ${fail}`)
  console.log(`원본 합계: ${mb(origBytes)} → 압축 합계: ${mb(newBytes)}`)
  console.log('이제: node scripts/migrate-board-images.mjs --rewrite 로 .blob.sql 재생성')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
