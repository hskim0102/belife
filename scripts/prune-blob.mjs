// Vercel Blob 정리: DB 가 참조하지 않는 파일 삭제 (기준 A)
//
// 사이트 파일은 Cloudinary 로 옮겼고 DB 도 Cloudinary 주소를 가리킨다. Blob 에는 Cloudinary
// 무료 한도(10MB)를 넘어 못 옮긴 첨부처럼 DB 가 아직 참조하는 파일만 남기고 나머지를 지운다.
//
//  - 남김: Neon DB 의 텍스트 컬럼 어디든 URL(또는 경로)이 등장하는 Blob
//  - 삭제: 그 외 전부. 그중 Cloudinary 맵에도 없는 것(어디에도 사본이 없는 파일)은 따로 보고한다.
//
// 기본은 미리보기. 삭제 목록은 scripts/.blob-prune-plan.json 에 남긴다.
// 실제 삭제는 --apply (del 은 무료이며 되돌릴 수 없다).
//
// 사용법:
//   node scripts/prune-blob.mjs          # 미리보기
//   node scripts/prune-blob.mjs --apply  # 삭제
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'
import { list, del } from '@vercel/blob'

const __dirname = dirname(fileURLToPath(import.meta.url))
for (const line of readFileSync(join(__dirname, '..', '.env.local'), 'utf-8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN 이 필요합니다.')
  process.exit(2)
}
const apply = process.argv.includes('--apply')
const mb = n => `${(n / 1048576).toFixed(1)}MB`

// 1) Blob 전체 목록
const blobs = []
let cursor
do {
  const page = await list({ cursor, limit: 1000 })
  blobs.push(...page.blobs)
  cursor = page.hasMore ? page.cursor : undefined
} while (cursor)

// 2) DB 가 참조하는 Blob 경로
const db = new pg.Client({ connectionString: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL })
await db.connect()
const cols = (
  await db.query(`SELECT table_name, column_name FROM information_schema.columns
                   WHERE table_schema = 'public' AND data_type IN ('text', 'character varying')`)
).rows
const referenced = new Set()
for (const { table_name: t, column_name: c } of cols) {
  const rows = (await db.query(`SELECT "${c}" AS v FROM "${t}" WHERE "${c}" LIKE '%vercel-storage.com%'`)).rows
  for (const { v } of rows) {
    for (const u of v.match(/https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^\s"'<>)]+/gi) ?? []) {
      referenced.add(decodeURIComponent(new URL(u.replace(/&amp;/g, '&')).pathname).replace(/^\//, ''))
    }
  }
}
await db.end()

// 3) 분류
const map = JSON.parse(readFileSync(join(__dirname, '.cloudinary-map.json'), 'utf-8'))
const inCloudinary = new Set(Object.keys(map).map(u => decodeURIComponent(new URL(u).pathname).replace(/^\//, '')))
const keep = blobs.filter(b => referenced.has(b.pathname))
const remove = blobs.filter(b => !referenced.has(b.pathname))
const noCopy = remove.filter(b => !inCloudinary.has(b.pathname))
const sum = arr => arr.reduce((a, b) => a + b.size, 0)

console.log(`Blob 전체 ${blobs.length}개 (${mb(sum(blobs))})`)
console.log(`  남김(DB 참조) ${keep.length}개 (${mb(sum(keep))})`)
for (const b of keep) console.log(`    · ${b.pathname} (${mb(b.size)})`)
console.log(`  삭제 ${remove.length}개 (${mb(sum(remove))})`)
console.log(`    그중 Cloudinary 에 사본 있음 ${remove.length - noCopy.length}개, 사본 없음 ${noCopy.length}개 (${mb(sum(noCopy))})`)
const byFolder = {}
for (const b of noCopy) {
  const f = b.pathname.split('/').slice(0, -1).join('/') || '(root)'
  byFolder[f] = (byFolder[f] ?? 0) + 1
}
if (noCopy.length) console.log('    사본 없는 파일 폴더별:', byFolder)
const missing = [...referenced].filter(p => !blobs.some(b => b.pathname === p))
if (missing.length) console.log(`  (DB 가 참조하지만 Blob 에 없는 경로 ${missing.length}개)`, missing)

writeFileSync(
  join(__dirname, '.blob-prune-plan.json'),
  JSON.stringify({ keep: keep.map(b => b.pathname), remove: remove.map(b => ({ pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt, inCloudinary: inCloudinary.has(b.pathname) })) }, null, 2),
)

if (!apply) {
  console.log('미리보기만 했습니다. 목록: scripts/.blob-prune-plan.json / 삭제하려면 --apply')
  process.exit(0)
}

// 4) 삭제 (100개씩 묶어서)
// Hobby 는 작업 수 기준 분당 한도가 있다(del 도 파일 1개 = 1회). 묶음 사이에 쉬고,
// 한도에 걸리면 안내된 시간만큼 기다렸다가 같은 묶음을 다시 보낸다.
const sleep = ms => new Promise(r => setTimeout(r, ms))
let deleted = 0
for (let i = 0; i < remove.length; i += 100) {
  const batch = remove.slice(i, i + 100).map(b => b.url)
  for (;;) {
    try {
      await del(batch)
      break
    } catch (e) {
      if (e?.name !== 'BlobServiceRateLimited') throw e
      console.log(`  요청 한도 — ${e.retryAfter ?? 60}초 대기`)
      await sleep((e.retryAfter ?? 60) * 1000)
    }
  }
  deleted += batch.length
  console.log(`삭제 ${deleted}/${remove.length}`)
  await sleep(8000) // 분당 약 750개
}
console.log('삭제 완료')
