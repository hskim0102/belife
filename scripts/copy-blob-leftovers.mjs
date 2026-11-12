// Blob 에만 남아 있던 파일(.cloudinary-unmapped.json)을 Cloudinary 로 복사
//
// 관리자 화면에서 직접 올린 히어로 배너·사업 이미지(hero/, board/uploads/)는 옛 사이트에 원본이
// 없어 Blob 잠금이 풀린 뒤에야 옮길 수 있다. Blob 에서 받아 migrate-to-cloudinary.mjs 와 같은
// 규칙(public_id = belife/<Blob 경로>, 이미지는 긴 변 2000px)으로 올리고 .cloudinary-map.json 에 추가한다.
// DB 반영은 rewrite-cloudinary-urls.mjs --apply.
//
// 사용법: node scripts/copy-blob-leftovers.mjs
import crypto from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
for (const line of readFileSync(join(__dirname, '..', '.env.local'), 'utf-8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
}
const { CLOUDINARY_CLOUD_NAME: CLOUD, CLOUDINARY_API_KEY: KEY, CLOUDINARY_API_SECRET: SECRET } = process.env
const MAP_FILE = join(__dirname, '.cloudinary-map.json')
const MAX_BYTES = 10 * 1024 * 1024 // 무료 플랜 파일당 상한

const map = JSON.parse(readFileSync(MAP_FILE, 'utf-8'))
const unmapped = JSON.parse(readFileSync(join(__dirname, '.cloudinary-unmapped.json'), 'utf-8'))

async function shrink(buf, name) {
  if (/\.gif$/i.test(name)) return buf
  const img = sharp(buf, { failOn: 'none' }).rotate()
  const { width = 0, height = 0, format } = await img.metadata()
  if (Math.max(width, height) <= 2000 && buf.length <= 2 * 1024 * 1024) return buf
  let out = img.resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
  out = format === 'png' ? out.png({ compressionLevel: 9 }) : out.jpeg({ quality: 82, mozjpeg: true })
  const res = await out.toBuffer()
  return res.length < buf.length ? res : buf
}

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

const done = []
const failed = []
for (const blobUrl of unmapped) {
  if (map[blobUrl]) continue
  const path = decodeURIComponent(new URL(blobUrl).pathname).replace(/^\//, '')
  const name = path.split('/').pop()
  const raw = !/\.(jpe?g|png|gif|webp|avif)$/i.test(name)
  try {
    const res = await fetch(blobUrl, { signal: AbortSignal.timeout(120_000) })
    if (!res.ok) throw new Error(`Blob 응답 ${res.status}`)
    const orig = Buffer.from(await res.arrayBuffer())
    const buf = raw ? orig : await shrink(orig, name)
    if (buf.length > MAX_BYTES) throw new Error(`10MB 초과 (${(buf.length / 1048576).toFixed(1)}MB)`)
    const publicId = `belife/${raw ? path : path.slice(0, path.length - extname(path).length)}`
    map[blobUrl] = await upload(buf, name, publicId, raw)
    writeFileSync(MAP_FILE, JSON.stringify(map, null, 2))
    done.push(`${path} (${(orig.length / 1024) | 0}KB → ${(buf.length / 1024) | 0}KB)`)
  } catch (e) {
    failed.push(`${path}: ${e.message}`)
  }
}
console.log(`복사 ${done.length}, 실패 ${failed.length}`)
for (const d of done) console.log('  ✓', d)
for (const f of failed) console.log('  ✗', f)
