/**
 * belife.org 레거시 연례보고 게시판(bo_table=zezz, 총회보고서)을
 * 새 사이트의 posts 테이블(category='report')로 크롤링·적재한다.
 *
 * - 커버 이미지·첨부파일(PDF/엑셀 등)을 내려받아 Vercel Blob(board/report/)에 재업로드하고
 *   본문에 링크로 넣는다.
 * - slug = report-<연도> 로 idempotent. 이미 있으면 건너뛴다(--force 로 덮어쓰기).
 *
 * 사용:
 *   node scripts/import-report-posts.mjs --dry-run   # 크롤링·파싱만, 저장 안 함
 *   node scripts/import-report-posts.mjs             # 실제 다운로드·업로드·삽입
 *   node scripts/import-report-posts.mjs --force     # 기존 글도 다시 적재
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'
import { put } from '@vercel/blob'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DRY = process.argv.includes('--dry-run')
const FORCE = process.argv.includes('--force')

// ── env ──────────────────────────────────────────────────────────
try {
  const env = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
} catch {}
if (!process.env.DATABASE_URL) { console.error('DATABASE_URL 없음'); process.exit(1) }
if (!DRY && !process.env.BLOB_READ_WRITE_TOKEN) { console.error('BLOB_READ_WRITE_TOKEN 없음'); process.exit(1) }
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

// ── 원본 사이트 ──────────────────────────────────────────────────
const BASE = 'http://www.belife.org/belife'
const BO = 'zezz'

const CONTENT_TYPES = {
  pdf: 'application/pdf', hwp: 'application/x-hwp', hwpx: 'application/hwp+zip',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  csv: 'text/csv', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', webp: 'image/webp', avif: 'image/avif',
}
const ext = (name) => (name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '')

// ── 쿠키 유지 fetch ──────────────────────────────────────────────
let cookie = ''
async function fetchRaw(url, referer) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 belife-migration',
      ...(cookie ? { Cookie: cookie } : {}),
      ...(referer ? { Referer: referer } : {}),
    },
    redirect: 'follow',
  })
  const sc = res.headers.get('set-cookie')
  if (sc) { const m = sc.match(/PHPSESSID=[^;]+/); if (m) cookie = m[0] }
  return res
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// ── 목록 파싱: {id, title, date} ─────────────────────────────────
async function fetchList() {
  const items = new Map()
  for (const page of [1, 2]) {
    const res = await fetchRaw(`${BASE}/bbs/board.php?bo_table=${BO}&page=${page}`)
    const html = await res.text()
    const re = /wr_id=(\d+)(?:&page=\d+)?'>\s*<span[^>]*>([^<]+)<\/span><\/a>[\s\S]{0,260}?(\d{4}-\d{2}-\d{2})/g
    let m
    while ((m = re.exec(html))) {
      const id = +m[1]
      if (!items.has(id)) items.set(id, { id, title: m[2].trim().replace(/\s+/g, ' '), date: m[3] })
    }
    await sleep(300)
  }
  return [...items.values()].sort((a, b) => a.id - b.id)
}

// ── 뷰 페이지 파싱: 첨부·커버이미지·본문텍스트 ───────────────────
function parseView(html) {
  // 첨부: file_download('./download.php?...&no=N', 'filename')
  const attachments = []
  const attRe = /file_download\('\.\/download\.php\?bo_table=zezz&wr_id=\d+&no=(\d+)',\s*'([^']*)'\)/g
  let a
  while ((a = attRe.exec(html))) attachments.push({ no: +a[1], filename: a[2] })

  // 커버 이미지: 본문에 삽입된 data/file/zezz/ 이미지(사이드바 썸네일 /thumb/ 는 제외).
  // 본문 이미지는 '<!-- 내용 출력 -->' 앞 셀에 있어 영역이 아니라 페이지 전체에서 스캔한다.
  const images = []
  const imgRe = /src=['"]\.\.\/(data\/file\/zezz\/[^'"]+)['"]/g
  let im
  while ((im = imgRe.exec(html))) {
    const p = im[1]
    if (!/\/thumb\//.test(p) && !images.includes(p)) images.push(p)
  }

  // writeContents 텍스트
  const wc = html.match(/id="writeContents">([\s\S]*?)<\/span>/)
  const text = wc ? wc[1].replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() : ''

  return { attachments, images, text }
}

// ── 파일 다운로드 → Blob 업로드 → URL ────────────────────────────
async function rehost(srcUrl, referer, slug, filename) {
  const res = await fetchRaw(srcUrl, referer)
  if (!res.ok) throw new Error(`다운로드 실패 ${res.status}: ${srcUrl}`)
  const disp = res.headers.get('content-disposition') || ''
  const buf = Buffer.from(await res.arrayBuffer())
  // gnuboard 접근거부(작은 html) 감지
  if (!disp && /text\/html/i.test(res.headers.get('content-type') || '') && buf.length < 1024) {
    throw new Error(`파일이 아닌 응답(접근거부?): ${srcUrl}`)
  }
  const e = ext(filename) || 'bin'
  const ct = CONTENT_TYPES[e] || 'application/octet-stream'
  const safe = filename.replace(/[^\w.\-가-힣]+/g, '_')
  const r = await put(`board/report/${slug}/${safe}`, buf, {
    access: 'public', addRandomSuffix: true, contentType: ct, token: BLOB_TOKEN,
  })
  return { url: r.url, size: buf.length }
}

// ── 한 글 처리 ───────────────────────────────────────────────────
async function importPost(item, db) {
  const year = (item.title.match(/(\d{4})/) || [])[1]
  const slug = year ? `report-${year}` : `report-${item.id}`
  const publishedAt = year && item.date.startsWith(year) ? item.date : (year ? `${year}-01-01` : item.date)

  const viewUrl = `${BASE}/bbs/board.php?bo_table=${BO}&wr_id=${item.id}`
  const res = await fetchRaw(viewUrl)
  const html = await res.text()
  const { attachments, images, text } = parseView(html)

  const label = `${slug} (wr_id=${item.id})`
  if (DRY) {
    console.log(`- ${label} | ${publishedAt} | ${item.title}`)
    console.log(`    커버이미지: ${images.length}개, 첨부: ${attachments.map((x) => x.filename).join(', ') || '없음'}`)
    return { slug, skipped: false }
  }

  // 커버 이미지 재업로드
  const coverUrls = []
  for (const path of images) {
    try {
      const { url } = await rehost(`${BASE}/${path}`, viewUrl, slug, path.split('/').pop())
      coverUrls.push(url)
    } catch (e) { console.warn(`    커버 실패: ${e.message}`) }
    await sleep(200)
  }
  // 첨부 재업로드
  const files = []
  for (const att of attachments) {
    try {
      const dl = `${BASE}/bbs/download.php?bo_table=${BO}&wr_id=${item.id}&no=${att.no}`
      const { url, size } = await rehost(dl, viewUrl, slug, att.filename)
      files.push({ name: att.filename, url, size })
    } catch (e) { console.warn(`    첨부 실패(${att.filename}): ${e.message}`) }
    await sleep(200)
  }

  // 본문 구성
  const parts = []
  for (const url of coverUrls) parts.push(`<p><img src="${esc(url)}" alt="${esc(item.title)}"></p>`)
  if (text && text !== item.title) parts.push(`<p>${esc(text)}</p>`)
  if (files.length) {
    parts.push('<p><strong>첨부파일</strong></p><ul>')
    for (const f of files) {
      const kb = (f.size / 1024).toFixed(0)
      parts.push(`<li><a href="${esc(f.url)}" target="_blank" rel="noopener noreferrer">${esc(f.name)}</a> (${kb}KB)</li>`)
    }
    parts.push('</ul>')
  }
  const body = parts.join('\n')
  const thumbnail = coverUrls[0] || files.find((f) => ['jpg','jpeg','png','gif','webp'].includes(ext(f.name)))?.url || null

  await db.query(
    `INSERT INTO posts (slug, title, category, published_at, thumbnail, excerpt, body, tags)
       VALUES ($1,$2,'report',$3,$4,$5,$6,'{}')
     ON CONFLICT (slug) DO UPDATE
       SET title=EXCLUDED.title, published_at=EXCLUDED.published_at,
           thumbnail=EXCLUDED.thumbnail, excerpt=EXCLUDED.excerpt, body=EXCLUDED.body`,
    [slug, item.title, publishedAt, thumbnail, null, body],
  )
  console.log(`✓ ${label} | ${publishedAt} | 커버 ${coverUrls.length} · 첨부 ${files.length}`)
  return { slug, skipped: false }
}

// ── main ─────────────────────────────────────────────────────────
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
})
await db.connect()
try {
  console.log(DRY ? '[DRY-RUN] 저장하지 않음' : '[실행] 다운로드·업로드·삽입')
  const list = await fetchList()
  console.log(`연례보고 게시물 ${list.length}건 발견\n`)

  // 기존 slug 조회(idempotent)
  const existing = new Set(
    (await db.query(`SELECT slug FROM posts WHERE category='report'`)).rows.map((r) => r.slug),
  )

  let done = 0, skipped = 0
  for (const item of list) {
    const year = (item.title.match(/(\d{4})/) || [])[1]
    const slug = year ? `report-${year}` : `report-${item.id}`
    if (!FORCE && !DRY && existing.has(slug)) { console.log(`· ${slug} 이미 있음 → 건너뜀`); skipped++; continue }
    await importPost(item, db)
    done++
    await sleep(300)
  }
  console.log(`\n완료: 처리 ${done}건, 건너뜀 ${skipped}건`)
} catch (err) {
  console.error('실패:', err.stack || err.message)
  process.exitCode = 1
} finally {
  await db.end()
}
