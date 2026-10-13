// 백업해 둔 옛 사이트 이미지·첨부파일을 Cloudinary 로 업로드
//
// 배경: Vercel Blob Hobby 한도 초과로 Blob 접근이 막혀 Cloudinary 로 옮긴다.
// 원본은 scripts/backup-old-site.mjs 로 받아 둔 로컬 파일을 쓴다.
//
// 동작:
//   1) 매니페스트(.activity-image-map.json / .board-image-map.json / .board-file-map.json)
//      에서 기존 Blob URL 과 로컬 파일을 짝짓는다.
//   2) 이미지는 sharp 로 긴 변 2000px 이하로 줄인다(작아질 때만). 첨부는 그대로.
//   3) Blob 경로를 그대로 public_id 로 써서 업로드한다.
//        activity/abc.jpg      → belife/activity/abc        (image)
//        board/files/x_문서.hwp → belife/board/files/x_문서.hwp (raw, 확장자 포함)
//   4) "Blob URL → Cloudinary URL" 을 scripts/.cloudinary-map.json 에 기록한다.
//      DB 의 URL 치환은 이 맵으로 별도 수행한다.
//
// 이미 맵에 있는 항목은 건너뛰므로 중단 후 다시 실행해도 된다.
//
// 사용법:
//   node scripts/migrate-to-cloudinary.mjs                 # 전부
//   node scripts/migrate-to-cloudinary.mjs files --limit 2 # 일부만 (activity | board | files)
import crypto from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'
import sharp from 'sharp'

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

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME
const KEY = process.env.CLOUDINARY_API_KEY
const SECRET = process.env.CLOUDINARY_API_SECRET
if (!CLOUD || !KEY || !SECRET) {
  console.error('CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET 가 필요합니다.')
  process.exit(2)
}

const FOLDER = 'belife'
const MAX_SIDE = 2000
const MAX_BYTES = 10 * 1024 * 1024 // 무료 플랜 파일당 상한
const CONCURRENCY = 4
const MAP_FILE = join(__dirname, '.cloudinary-map.json')

const SETS = {
  activity: { manifest: '.activity-image-map.json', dir: 'belife-activity-images', file: e => e.local?.split('/').pop(), raw: false },
  board: { manifest: '.board-image-map.json', dir: 'belife-board-images', file: e => e.local?.split('/').pop(), raw: false },
  files: { manifest: '.board-file-map.json', dir: 'belife-board-files', file: e => e.name, raw: true },
}

const map = existsSync(MAP_FILE) ? JSON.parse(readFileSync(MAP_FILE, 'utf-8')) : {}
const saveMap = () => writeFileSync(MAP_FILE, JSON.stringify(map, null, 2))

/** Blob URL → Cloudinary public_id. 이미지는 확장자 제외, raw 는 확장자 포함. */
function publicIdFor(blobUrl, raw) {
  const path = decodeURIComponent(new URL(blobUrl).pathname).replace(/^\//, '')
  return `${FOLDER}/${raw ? path : path.slice(0, path.length - extname(path).length)}`
}

/** 긴 변이 MAX_SIDE 를 넘는 이미지만 줄인다. 결과가 더 크면 원본 유지. GIF 는 건드리지 않는다. */
async function shrink(buf, name) {
  if (/\.gif$/i.test(name)) return buf
  try {
    const img = sharp(buf, { failOn: 'none' }).rotate()
    const { width = 0, height = 0, format } = await img.metadata()
    if (Math.max(width, height) <= MAX_SIDE && buf.length <= 2 * 1024 * 1024) return buf
    let out = img.resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
    out = format === 'png' ? out.png({ compressionLevel: 9 }) : format === 'webp' ? out.webp({ quality: 82 }) : out.jpeg({ quality: 82, mozjpeg: true })
    const res = await out.toBuffer()
    return res.length < buf.length ? res : buf
  } catch {
    return buf // 손상/특이 포맷은 원본 그대로 올려 Cloudinary 판단에 맡긴다.
  }
}

async function upload(buf, filename, publicId, raw) {
  const timestamp = Math.floor(Date.now() / 1000)
  const params = { overwrite: 'true', public_id: publicId, timestamp: String(timestamp) }
  const toSign = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&')
  const signature = crypto.createHash('sha1').update(toSign + SECRET).digest('hex')

  const form = new FormData()
  form.append('file', new Blob([buf]), filename)
  for (const [k, v] of Object.entries(params)) form.append(k, v)
  form.append('api_key', KEY)
  form.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/${raw ? 'raw' : 'image'}/upload`, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(120_000),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error?.message || `HTTP ${res.status}`)
  return json.secure_url
}

async function withRetry(fn, tries = 3) {
  let last
  for (let i = 0; i < tries; i++) {
    try {
      return await fn()
    } catch (e) {
      last = e
      if (/limit|too large|Invalid|exceeds/i.test(e.message)) break
      await new Promise(r => setTimeout(r, 2000 * (i + 1)))
    }
  }
  throw last
}

async function migrateSet(key, limit) {
  const set = SETS[key]
  const manifest = JSON.parse(readFileSync(join(__dirname, set.manifest), 'utf-8'))
  let jobs = Object.values(manifest)
    .filter(e => e.ok && e.blobUrl && set.file(e))
    .map(e => ({ blobUrl: e.blobUrl, name: set.file(e) }))
    .filter(j => !map[j.blobUrl])
  if (limit) jobs = jobs.slice(0, limit)

  const stats = { total: jobs.length, done: 0, failed: 0, bytesIn: 0, bytesOut: 0 }
  const failures = []
  let next = 0

  async function worker() {
    while (next < jobs.length) {
      const job = jobs[next++]
      try {
        const src = join(ROOT, set.dir, job.name)
        if (!existsSync(src)) throw new Error('로컬 파일 없음')
        const orig = readFileSync(src)
        const buf = set.raw ? orig : await shrink(orig, job.name)
        if (buf.length > MAX_BYTES) throw new Error(`10MB 초과 (${(buf.length / 1048576).toFixed(1)}MB)`)
        const url = await withRetry(() => upload(buf, job.name, publicIdFor(job.blobUrl, set.raw), set.raw))
        map[job.blobUrl] = url
        stats.done++
        stats.bytesIn += orig.length
        stats.bytesOut += buf.length
      } catch (e) {
        stats.failed++
        failures.push({ blobUrl: job.blobUrl, name: job.name, error: e.message })
      }
      const n = stats.done + stats.failed
      if (n % 50 === 0 || n === jobs.length) {
        saveMap()
        console.log(`[${key}] ${n}/${jobs.length} (성공 ${stats.done}, 실패 ${stats.failed})`)
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  saveMap()
  return { stats, failures }
}

const args = process.argv.slice(2)
const li = args.indexOf('--limit')
const limit = li >= 0 ? Number(args[li + 1]) : 0
const keys = args.filter(a => SETS[a])
const targets = keys.length ? keys : Object.keys(SETS)

const report = {}
for (const key of targets) {
  report[key] = await migrateSet(key, limit)
  const s = report[key].stats
  console.log(
    `[${key}] 완료: 성공 ${s.done}, 실패 ${s.failed}, ` +
      `${(s.bytesIn / 1048576).toFixed(1)}MB → ${(s.bytesOut / 1048576).toFixed(1)}MB`,
  )
}
writeFileSync(join(__dirname, '.cloudinary-report.json'), JSON.stringify(report, null, 2))
console.log('맵: scripts/.cloudinary-map.json / 실패 목록: scripts/.cloudinary-report.json')
