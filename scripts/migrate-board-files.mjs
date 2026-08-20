// belife 게시판 seed 의 **첨부파일(download.php)** 을 Vercel Blob 으로 이전하고
// SQL 안의 링크를 Blob URL 로 치환한다. (이미지는 migrate-board-images.mjs 소관)
//
// 자료실(archive)·사무국(office) 처럼 첨부파일이 본문인 게시판을 위해 만들었다.
// 그누보드 download.php 는 해당 글의 뷰 페이지를 먼저 방문해 받은 세션 쿠키가 있어야
// 파일을 내려준다. 그래서 URL 마다 (뷰 페이지 → 다운로드) 순서로 두 번 요청한다.
//
// 입력:  migrations/seed_<cat>_posts.sql        (crawl_belife_boards.py --attachments 결과)
// 출력:  migrations/seed_<cat>_posts.blob.sql   (이미 있으면 그 파일을 입력으로 이어서 치환)
// 매니페스트: scripts/.board-file-map.json      (중단 후 재개용)
//
// 사용법:
//   node scripts/migrate-board-files.mjs archive
//   node scripts/migrate-board-files.mjs archive office
//   node scripts/migrate-board-files.mjs archive --rewrite   # 업로드 없이 SQL 치환만
//
// 로그인이 필요한 게시판(사무국)은 환경변수로 자격 증명을 넘긴다:
//   BELIFE_ID=... BELIFE_PW=... node scripts/migrate-board-files.mjs office
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import crypto from 'node:crypto'
import { put } from '@vercel/blob'

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

const MIGRATIONS = join(ROOT, 'migrations')
const FILE_DIR = join(ROOT, 'belife-board-files')
const MANIFEST = join(__dirname, '.board-file-map.json')
const BASE = 'http://www.belife.org/belife/'
const UA = 'Mozilla/5.0 (compatible; belife-archiver/1.0)'
const CONCURRENCY = 4

// SQL 안에서는 & 가 &amp; 로 이스케이프돼 있다.
const DL_RE = /https?:\/\/(?:www\.)?belife\.org\/belife\/bbs\/download\.php\?[^\s"'<>]+/gi

/** 확장자 → Content-Type. lib/blob.ts 의 ATTACHMENT_TYPES 와 맞춘다. */
const TYPES = {
  pdf: 'application/pdf',
  hwp: 'application/x-hwp',
  hwpx: 'application/hwp+zip',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  csv: 'text/csv',
  zip: 'application/zip',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
}

const args = process.argv.slice(2)
const rewriteOnly = args.includes('--rewrite')
const categories = args.filter(a => !a.startsWith('--'))
if (categories.length === 0) {
  console.error('카테고리를 지정해 주세요. 예) node scripts/migrate-board-files.mjs archive')
  process.exit(2)
}

function srcSql(cat) {
  // 이미지 치환본이 이미 있으면 그 위에 첨부파일 치환을 얹는다.
  const blob = join(MIGRATIONS, `seed_${cat}_posts.blob.sql`)
  return existsSync(blob) ? blob : join(MIGRATIONS, `seed_${cat}_posts.sql`)
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
  return {} // { [escapedUrl]: { blobUrl, name, ok, error } }
}
const saveManifest = map => writeFileSync(MANIFEST, JSON.stringify(map, null, 2))

/** 로그인이 필요한 게시판용 세션 쿠키. 없으면 빈 문자열. */
let sessionCookie = ''

async function login() {
  const id = process.env.BELIFE_ID
  const pw = process.env.BELIFE_PW
  if (!id || !pw) return false
  const res = await fetch(BASE + 'bbs/login_check.php', {
    method: 'POST',
    headers: {
      'User-Agent': UA,
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: BASE + 'bbs/login.php',
    },
    body: new URLSearchParams({ url: BASE + 'index.php', mb_id: id, mb_password: pw }),
    redirect: 'manual',
  })
  sessionCookie = cookiesFrom(res, sessionCookie)
  return Boolean(sessionCookie)
}

/** 응답의 set-cookie 들을 "k=v; k=v" 형태로 합친다(기존 쿠키 유지). */
function cookiesFrom(res, prev = '') {
  const jar = new Map()
  for (const part of prev.split('; ').filter(Boolean)) {
    const i = part.indexOf('=')
    if (i > 0) jar.set(part.slice(0, i), part.slice(i + 1))
  }
  const raw = res.headers.getSetCookie?.() ?? []
  for (const c of raw) {
    const [pair] = c.split(';')
    const i = pair.indexOf('=')
    if (i > 0) jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim())
  }
  return [...jar].map(([k, v]) => `${k}=${v}`).join('; ')
}

function unescapeHtml(s) {
  return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}

/** download.php URL → 같은 글의 뷰 페이지 URL (세션 쿠키를 받기 위해) */
function viewUrlFor(dlUrl) {
  const u = new URL(unescapeHtml(dlUrl))
  const bo = u.searchParams.get('bo_table')
  const wr = u.searchParams.get('wr_id')
  return `${BASE}bbs/board.php?bo_table=${bo}&wr_id=${wr}`
}

function filenameFrom(res, fallback) {
  const cd = res.headers.get('content-disposition') || ''
  const m = cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)
  if (!m) return fallback
  try {
    return decodeURIComponent(m[1])
  } catch {
    return m[1]
  }
}

function blobKey(url, filename) {
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 8)
  const safe = filename.replace(/[^\w.\-가-힣]/g, '_')
  return `${hash}_${safe}`
}

async function migrateOne(escapedUrl, map) {
  if (map[escapedUrl]?.ok) return
  const url = unescapeHtml(escapedUrl)
  try {
    // 1) 뷰 페이지 방문 → 세션 쿠키 확보
    const view = await fetch(viewUrlFor(escapedUrl), {
      headers: { 'User-Agent': UA, ...(sessionCookie ? { Cookie: sessionCookie } : {}) },
      signal: AbortSignal.timeout(30000),
    })
    const cookie = cookiesFrom(view, sessionCookie)

    // 2) 같은 쿠키로 첨부파일 다운로드
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Cookie: cookie, Referer: viewUrlFor(escapedUrl) },
      signal: AbortSignal.timeout(60000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const ctype = res.headers.get('content-type') || ''
    const buf = Buffer.from(await res.arrayBuffer())
    // 권한/세션 실패 시 그누보드는 alert HTML 을 준다.
    if (ctype.includes('text/html') && buf.length < 4096) {
      throw new Error('다운로드 거부(권한 또는 세션): ' + buf.toString('utf-8').slice(0, 80))
    }

    const filename = filenameFrom(res, `file-${crypto.randomUUID().slice(0, 8)}`)
    const name = blobKey(url, filename)
    writeFileSync(join(FILE_DIR, name), buf)
    const ext = (filename.split('.').pop() || '').toLowerCase()
    const result = await put(`board/files/${name}`, buf, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: TYPES[ext] || 'application/octet-stream',
    })
    map[escapedUrl] = { blobUrl: result.url, name, filename, bytes: buf.length, ok: true }
  } catch (e) {
    map[escapedUrl] = { blobUrl: null, ok: false, error: String(e.message || e) }
    console.error(`  ! 실패: ${url} (${e.message || e})`)
  }
}

async function runPool(urls, map) {
  let i = 0
  let done = 0
  async function worker() {
    while (i < urls.length) {
      const u = urls[i++]
      await migrateOne(u, map)
      done++
      if (done % 10 === 0) {
        console.log(`  ... ${done}/${urls.length}`)
        saveManifest(map)
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  saveManifest(map)
}

function collectUrls() {
  const set = new Set()
  for (const cat of categories) {
    const src = srcSql(cat)
    if (!existsSync(src)) {
      console.warn(`(건너뜀) ${src} 없음`)
      continue
    }
    for (const u of readFileSync(src, 'utf-8').match(DL_RE) || []) set.add(u)
  }
  return [...set]
}

function rewriteSqlFor(cat, map) {
  const src = srcSql(cat)
  if (!existsSync(src)) return null
  let sql = readFileSync(src, 'utf-8')
  let count = 0
  const entries = Object.entries(map)
    .filter(([, v]) => v.ok && v.blobUrl)
    .sort((a, b) => b[0].length - a[0].length)
  for (const [orig, v] of entries) {
    const parts = sql.split(orig)
    if (parts.length > 1) {
      count += parts.length - 1
      sql = parts.join(v.blobUrl)
    }
  }
  if (!sql.startsWith('-- [첨부파일')) {
    sql = `-- [첨부파일 Vercel Blob 이전 적용본 — 원본: seed_${cat}_posts.sql]\n` + sql
  }
  writeFileSync(outSql(cat), sql)
  return count
}

async function main() {
  if (!existsSync(FILE_DIR)) mkdirSync(FILE_DIR, { recursive: true })
  const map = loadManifest()
  const urls = collectUrls()
  console.log(`대상 카테고리: ${categories.join(', ')}`)
  console.log(`고유 첨부파일 URL: ${urls.length}개`)

  if (!rewriteOnly && urls.length) {
    if (process.env.BELIFE_ID && process.env.BELIFE_PW) {
      console.log(await login() ? '로그인 세션 확보' : '로그인 실패(비회원으로 계속)')
    }
    const todo = urls.filter(u => !map[u]?.ok)
    console.log(`업로드 대상: ${todo.length}개 (완료분 ${urls.length - todo.length}개 건너뜀)`)
    await runPool(todo, map)
  }

  for (const cat of categories) {
    const n = rewriteSqlFor(cat, map)
    if (n !== null) console.log(`[${cat}] 링크 ${n}개 치환 → ${outSql(cat)}`)
  }

  const failed = Object.values(map).filter(v => !v.ok).length
  console.log(`완료. 성공 ${Object.values(map).filter(v => v.ok).length}건, 실패 ${failed}건`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
