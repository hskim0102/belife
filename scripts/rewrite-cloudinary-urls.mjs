// DB 안의 Vercel Blob URL 을 Cloudinary URL 로 치환
//
// scripts/migrate-to-cloudinary.mjs 가 만든 맵(.cloudinary-map.json: Blob URL → Cloudinary URL)
// 을 써서, public 스키마의 모든 텍스트 컬럼에서 vercel-storage.com URL 을 찾아 바꾼다.
// 맵에 없는 URL(관리자 화면에서 새로 올린 히어로·약도·본문 이미지 등)은 그대로 두고 목록만 보고한다.
//
// 기본은 미리보기(dry-run): 바뀔 행 수와 맵에 없는 URL 만 출력한다.
// 실제 반영은 --apply. 한 트랜잭션으로 처리하므로 중간에 실패하면 전부 되돌아간다.
//
// 사용법:
//   node scripts/rewrite-cloudinary-urls.mjs          # 미리보기
//   node scripts/rewrite-cloudinary-urls.mjs --apply  # 반영
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

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

const apply = process.argv.includes('--apply')
const map = JSON.parse(readFileSync(join(__dirname, '.cloudinary-map.json'), 'utf-8'))

// DB 에는 같은 URL 이 퍼센트 인코딩/디코딩 두 형태로 들어 있을 수 있어 둘 다 키로 등록한다.
const lookup = new Map()
for (const [blob, cdn] of Object.entries(map)) {
  lookup.set(blob, cdn)
  try {
    lookup.set(decodeURI(blob), cdn)
  } catch {
    /* 잘못된 인코딩은 원형만 */
  }
}

const URL_RE = /https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^\s"'<>)]+/gi

function rewrite(text, unmapped) {
  return text.replace(URL_RE, url => {
    const hit = lookup.get(url) ?? lookup.get(url.replace(/&amp;/g, '&'))
    if (hit) return hit
    unmapped.add(url)
    return url
  })
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

const cols = (
  await client.query(
    `SELECT table_name, column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND data_type IN ('text', 'character varying')`,
  )
).rows

const unmapped = new Set()
const summary = []
try {
  if (apply) await client.query('BEGIN')
  for (const { table_name: t, column_name: c } of cols) {
    const pk = (
      await client.query(
        `SELECT a.attname FROM pg_index i JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
         WHERE i.indrelid = $1::regclass AND i.indisprimary`,
        [`"${t}"`],
      )
    ).rows.map(r => r.attname)
    if (pk.length !== 1) continue

    const rows = (
      await client.query(`SELECT "${pk[0]}" AS id, "${c}" AS v FROM "${t}" WHERE "${c}" LIKE '%vercel-storage.com%'`)
    ).rows
    let changed = 0
    for (const row of rows) {
      const next = rewrite(row.v, unmapped)
      if (next === row.v) continue
      changed++
      if (apply) await client.query(`UPDATE "${t}" SET "${c}" = $1 WHERE "${pk[0]}" = $2`, [next, row.id])
    }
    if (rows.length) summary.push({ table: t, column: c, rowsWithBlob: rows.length, changed })
  }
  if (apply) await client.query('COMMIT')
} catch (e) {
  if (apply) await client.query('ROLLBACK')
  throw e
} finally {
  await client.end()
}

console.table(summary)
writeFileSync(join(__dirname, '.cloudinary-unmapped.json'), JSON.stringify([...unmapped], null, 2))
console.log(`맵에 없는 Blob URL ${unmapped.size}개 → scripts/.cloudinary-unmapped.json`)
console.log(apply ? '반영 완료' : '미리보기만 했습니다. 반영하려면 --apply')
