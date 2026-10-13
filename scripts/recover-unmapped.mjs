// .cloudinary-map.json 에 없는 Blob URL(=Blob 잠김으로 못 받는 파일)을 옛 사이트에서 되살린다.
//
// 이 PC 의 매니페스트가 다른 PC 보다 오래돼, 나중에 옮긴 글의 이미지·첨부가 맵에 없다.
// 마이그레이션 스크립트는 Blob 파일명을 "<sha1(원본URL) 앞 8자>_<원본파일명>" 으로 지었으므로,
// 옛 사이트 경로 후보를 만들어 해시가 일치하는 것을 찾으면 원본 URL 을 정확히 알 수 있다.
//
//   board/<h>_<name>, activity/<h>_<name> : .../data/file/<bo>/<name>, .../data/cheditor4/<yymm>/<name>
//   board/files/<h>_<name>                : .../bbs/download.php?bo_table=<bo>&amp;wr_id=N&amp;no=K
//   board/report/report-YYYY/<name>-<rand> : 옛 zezz 게시판을 다시 읽어 파일명으로 매칭
//
// 찾은 원본은 옛 서버에서 받아(backup-old-site.mjs 와 같은 방식) Cloudinary 에 올리고
// .cloudinary-map.json 에 추가한다. 이후 rewrite-cloudinary-urls.mjs --apply 로 DB 반영.
//
// 사용법: node scripts/recover-unmapped.mjs
import crypto from 'node:crypto'
import http from 'node:http'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
for (const line of readFileSync(join(ROOT, '.env.local'), 'utf-8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
}

const OLD_IP = process.env.OLD_SITE_IP || '115.68.168.108'
const OLD_HOST = 'www.belife.org'
const UA = 'Mozilla/5.0 (compatible; belife-archiver/1.0)'
const { CLOUDINARY_CLOUD_NAME: CLOUD, CLOUDINARY_API_KEY: KEY, CLOUDINARY_API_SECRET: SECRET } = process.env
const MAP_FILE = join(__dirname, '.cloudinary-map.json')
const OUT_DIR = join(ROOT, 'belife-recovered')
mkdirSync(OUT_DIR, { recursive: true })

const map = JSON.parse(readFileSync(MAP_FILE, 'utf-8'))
const unmapped = JSON.parse(readFileSync(join(__dirname, '.cloudinary-unmapped.json'), 'utf-8'))

const sha8 = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8)

// ── 경로 후보 ──────────────────────────────────────────────────────
// 기존 매니페스트의 원본 URL 에서 디렉터리(data/file/<bo>/, data/cheditor4/<yymm>/)와 게시판 코드를 모은다.
const known = [
  ...Object.keys(JSON.parse(readFileSync(join(__dirname, '.activity-image-map.json'), 'utf-8'))),
  ...Object.keys(JSON.parse(readFileSync(join(__dirname, '.board-image-map.json'), 'utf-8'))),
]
const dirs = new Set()
const boards = new Set(['cezz', 'cczz', 'zezz', 'dzzz', 'cazz', 'cbzz'])
for (const u of known) {
  const m = u.match(/^(https?:\/\/(?:www\.)?belife\.org\/belife\/data\/(?:file\/([^/]+)|cheditor\d*\/[^/]+))\//)
  if (m) {
    dirs.add(m[1].replace(/^https?:\/\/(?:www\.)?/, ''))
    if (m[2]) boards.add(m[2])
  }
}
for (const bo of boards) dirs.add(`belife.org/belife/data/file/${bo}`)
// 최근 본문 이미지: 파일명의 유닉스 시각(…_1790575662.38.jpg)으로 cheditor4/<yymm>/ 추정
function cheditorDirs(name) {
  const t = name.match(/_(\d{10})\.\d+\.\w+$/)
  if (!t) return []
  const out = []
  for (const dh of [-40, 0, 40]) {
    const d = new Date((Number(t[1]) + dh * 86400 / 40) * 1000 + 9 * 3600 * 1000) // KST
    out.push(`belife.org/belife/data/cheditor4/${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, '0')}`)
  }
  return out
}
const PREFIXES = ['http://www.', 'http://', 'https://www.', 'https://']

function findImageSource(hash, name) {
  for (const dir of [...cheditorDirs(name), ...dirs]) {
    for (const p of PREFIXES) {
      const url = `${p}${dir}/${name}`
      if (sha8(url) === hash) return url
    }
  }
  return null
}

function findFileSource(hash) {
  for (const bo of boards) {
    for (let wr = 1; wr <= 3000; wr++) {
      for (let no = 0; no < 6; no++) {
        for (const p of ['http://www.', 'http://']) {
          for (const amp of ['&amp;', '&']) {
            const url = `${p}belife.org/belife/bbs/download.php?bo_table=${bo}${amp}wr_id=${wr}${amp}no=${no}`
            if (sha8(url) === hash) return url
          }
        }
      }
    }
  }
  return null
}

// ── 옛 서버 다운로드 (세션 유지, 첨부는 글 보기 → 다운로드) ───────────
let cookie = ''
function mergeCookies(list = []) {
  const jar = new Map(cookie.split('; ').filter(Boolean).map(p => [p.slice(0, p.indexOf('=')), p]))
  for (const c of list) {
    const pair = c.split(';')[0].trim()
    const i = pair.indexOf('=')
    if (i > 0) jar.set(pair.slice(0, i), pair)
  }
  cookie = [...jar.values()].join('; ')
}
function request(path, { method = 'GET', body, referer, redirects = 0 } = {}) {
  return new Promise((resolve, reject) => {
    const headers = { Host: OLD_HOST, 'User-Agent': UA }
    if (cookie) headers.Cookie = cookie
    if (referer) headers.Referer = referer
    if (body) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded'
      headers['Content-Length'] = Buffer.byteLength(body)
    }
    const req = http.request({ host: OLD_IP, port: 80, path, method, headers }, res => {
      mergeCookies(res.headers['set-cookie'])
      if (method === 'GET' && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects < 5) {
        res.resume()
        const loc = new URL(res.headers.location, `http://${OLD_HOST}${path}`)
        return resolve(request(loc.pathname + loc.search, { referer, redirects: redirects + 1 }))
      }
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks), type: res.headers['content-type'] || '' }))
      res.on('error', reject)
    })
    req.setTimeout(60_000, () => req.destroy(new Error('timeout')))
    req.on('error', reject)
    req.end(body)
  })
}
const isErrorHtml = r =>
  /text\/html/i.test(r.type) && r.body.length < 4096 && /^\s*<(!doctype|html|script|meta)/i.test(r.body.subarray(0, 64).toString('latin1'))

async function fetchOld(srcUrl) {
  const u = new URL(srcUrl.replace(/&amp;/g, '&'))
  let referer
  if (u.pathname.endsWith('/download.php')) {
    const view = `/belife/bbs/board.php?bo_table=${u.searchParams.get('bo_table')}&wr_id=${u.searchParams.get('wr_id')}`
    await request(view)
    referer = `http://${OLD_HOST}${view}`
  }
  const r = await request(u.pathname + u.search, { referer })
  if (r.status !== 200 || isErrorHtml(r)) throw new Error(`옛 서버 응답 ${r.status}`)
  return r.body
}

// ── Cloudinary 업로드 (migrate-to-cloudinary.mjs 와 같은 public_id 규칙) ──
async function upload(buf, filename, publicId, raw) {
  const params = { overwrite: 'true', public_id: publicId, timestamp: String(Math.floor(Date.now() / 1000)) }
  const toSign = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&')
  const form = new FormData()
  form.append('file', new Blob([buf]), filename)
  for (const [k, v] of Object.entries(params)) form.append(k, v)
  form.append('api_key', KEY)
  form.append('signature', crypto.createHash('sha1').update(toSign + SECRET).digest('hex'))
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/${raw ? 'raw' : 'image'}/upload`, { method: 'POST', body: form })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error?.message || `HTTP ${res.status}`)
  return json.secure_url
}
async function shrink(buf, name) {
  if (/\.gif$/i.test(name)) return buf
  try {
    const img = sharp(buf, { failOn: 'none' }).rotate()
    const { width = 0, height = 0, format } = await img.metadata()
    if (Math.max(width, height) <= 2000 && buf.length <= 2 * 1024 * 1024) return buf
    let out = img.resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
    out = format === 'png' ? out.png({ compressionLevel: 9 }) : out.jpeg({ quality: 82, mozjpeg: true })
    const res = await out.toBuffer()
    return res.length < buf.length ? res : buf
  } catch {
    return buf
  }
}

// ── 실행 ─────────────────────────────────────────────────────────
if (process.env.BELIFE_ID && process.env.BELIFE_PW) {
  await request('/belife/index.php')
  const body = new URLSearchParams({ url: `http://${OLD_HOST}/belife/index.php`, mb_id: process.env.BELIFE_ID, mb_password: process.env.BELIFE_PW }).toString()
  await request('/belife/bbs/login_check.php', { method: 'POST', body, referer: `http://${OLD_HOST}/belife/bbs/login.php` })
}

// 연간 보고서(board/report/report-YYYY/<파일명>-<무작위>.<확장자>)는 해시가 없으므로,
// 옛 zezz 게시판을 다시 읽어 "연도 + 정리된 파일명" 으로 짝을 맞춘다(import-report-posts.mjs 와 같은 규칙).
const safeName = f => f.replace(/[^\w.\-가-힣]+/g, '_')
async function reportSources() {
  const out = new Map() // "report-YYYY/<safe 확장자 제외>" → 원본 URL
  const ids = new Set()
  for (const page of [1, 2]) {
    const html = (await request(`/belife/bbs/board.php?bo_table=zezz&page=${page}`)).body.toString('utf-8')
    for (const m of html.matchAll(/wr_id=(\d+)(?:&page=\d+)?'>\s*<span[^>]*>([^<]+)<\/span>/g)) ids.add(`${m[1]}|${m[2]}`)
  }
  for (const entry of ids) {
    const [id, title] = entry.split('|')
    const year = (title.match(/(\d{4})/) || [])[1]
    const slug = year ? `report-${year}` : `report-${id}`
    const view = `/belife/bbs/board.php?bo_table=zezz&wr_id=${id}`
    const html = (await request(view)).body.toString('utf-8')
    for (const a of html.matchAll(/file_download\('\.\/download\.php\?bo_table=zezz&wr_id=\d+&no=(\d+)',\s*'([^']*)'\)/g)) {
      const base = safeName(a[2]).replace(/\.[^.]+$/, '')
      out.set(`${slug}/${base}`, `http://${OLD_HOST}/belife/bbs/download.php?bo_table=zezz&wr_id=${id}&no=${a[1]}`)
    }
    for (const im of html.matchAll(/src=['"]\.\.\/(data\/file\/zezz\/[^'"]+)['"]/g)) {
      if (/\/thumb\//.test(im[1])) continue
      const base = safeName(im[1].split('/').pop()).replace(/\.[^.]+$/, '')
      out.set(`${slug}/${base}`, `http://${OLD_HOST}/belife/${im[1]}`)
    }
  }
  return out
}
const reports = unmapped.some(u => u.includes('/board/report/')) ? await reportSources() : new Map()

const result = { recovered: [], notFound: [], failed: [], skipped: [] }
for (const blobUrl of unmapped) {
  if (map[blobUrl]) continue
  const path = decodeURIComponent(new URL(blobUrl).pathname).replace(/^\//, '')
  const rep = path.match(/^board\/report\/(report-[^/]+)\/(.+)-[A-Za-z0-9]{30}(\.[^.]+)$/)
  if (rep) {
    const src = reports.get(`${rep[1]}/${rep[2]}`)
    if (!src) {
      result.notFound.push(path)
      continue
    }
    try {
      const orig = await fetchOld(src)
      const raw = !/\.(jpe?g|png|gif|webp)$/i.test(rep[3])
      const buf = raw ? orig : await shrink(orig, rep[3])
      if (buf.length > 10 * 1024 * 1024) throw new Error(`10MB 초과 (${(buf.length / 1048576).toFixed(1)}MB)`)
      const publicId = `belife/${raw ? path : path.slice(0, path.length - rep[3].length)}`
      map[blobUrl] = await upload(buf, `${rep[2]}${rep[3]}`, publicId, raw)
      result.recovered.push(path)
      writeFileSync(MAP_FILE, JSON.stringify(map, null, 2))
    } catch (e) {
      result.failed.push({ path, src, error: e.message })
    }
    continue
  }
  const m = path.match(/^(board\/files|board|activity)\/([0-9a-f]{8})_(.+)$/)
  if (!m) {
    result.skipped.push(path) // hero/, board/uploads/, board/report/ 등: 해시 규칙이 아님
    continue
  }
  const [, folder, hash, name] = m
  const raw = folder === 'board/files'
  const src = raw ? findFileSource(hash) : findImageSource(hash, name)
  if (!src) {
    result.notFound.push(path)
    continue
  }
  try {
    const orig = await fetchOld(src)
    writeFileSync(join(OUT_DIR, `${hash}_${name}`), orig)
    const buf = raw ? orig : await shrink(orig, name)
    if (buf.length > 10 * 1024 * 1024) throw new Error(`10MB 초과 (${(buf.length / 1048576).toFixed(1)}MB)`)
    const publicId = `belife/${raw ? path : path.slice(0, path.length - extname(path).length)}`
    map[blobUrl] = await upload(buf, name, publicId, raw)
    result.recovered.push(path)
    writeFileSync(MAP_FILE, JSON.stringify(map, null, 2))
  } catch (e) {
    result.failed.push({ path, src, error: e.message })
  }
}
writeFileSync(join(__dirname, '.recover-report.json'), JSON.stringify(result, null, 2))
console.log(`복구 ${result.recovered.length}, 원본 못 찾음 ${result.notFound.length}, 실패 ${result.failed.length}, 대상 아님 ${result.skipped.length}`)
for (const f of result.failed) console.log('  실패', f.path, f.error)
for (const p of result.notFound) console.log('  못 찾음', p)
