// 옛 belife 호스팅(Apache) 원본 이미지·첨부파일 로컬 백업
//
// 배경: Vercel Blob Hobby 한도 초과로 Blob 접근이 막혔고, 로컬 사본은 다른 PC에 있다.
// 마이그레이션 매니페스트(.activity-image-map.json / .board-image-map.json /
// .board-file-map.json)에 "옛 사이트 원본 URL → 로컬 파일명"이 남아 있으므로,
// 아직 살아 있는 옛 서버에서 원본을 다시 받아 같은 로컬 경로에 저장한다.
//
// www.belife.org DNS 는 이미 Vercel 을 가리키므로 옛 서버 IP 로 직접 접속하고
// Host 헤더만 www.belife.org 로 보낸다(가상호스트라 IP 단독 요청은 403).
//
// 이미 받은 파일은 건너뛰므로 중단 후 다시 실행해도 된다.
//
// 사용법:
//   node scripts/backup-old-site.mjs                # 이미지 + 첨부 전부
//   node scripts/backup-old-site.mjs activity board # 일부만 (activity | board | files)
import http from 'node:http'
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const OLD_IP = process.env.OLD_SITE_IP || '115.68.168.108'
const OLD_HOST = 'www.belife.org'
const UA = 'Mozilla/5.0 (compatible; belife-archiver/1.0)'
const CONCURRENCY = 6
const TIMEOUT_MS = 60_000

const SETS = {
  activity: { manifest: '.activity-image-map.json', dir: 'belife-activity-images', file: e => e.local?.split('/').pop() },
  board: { manifest: '.board-image-map.json', dir: 'belife-board-images', file: e => e.local?.split('/').pop() },
  files: { manifest: '.board-file-map.json', dir: 'belife-board-files', file: e => e.name },
}

// 첨부파일(download.php)은 로그인 세션이 필요하다. .env.local 의 BELIFE_ID / BELIFE_PW 사용.
try {
  const env = readFileSync(join(ROOT, '.env.local'), 'utf-8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
} catch {
  /* ambient env */
}

let sessionCookie = ''

function mergeCookies(setCookie = []) {
  const jar = new Map(sessionCookie.split('; ').filter(Boolean).map(p => [p.slice(0, p.indexOf('=')), p]))
  for (const c of setCookie) {
    const pair = c.split(';')[0].trim()
    const i = pair.indexOf('=')
    if (i > 0) jar.set(pair.slice(0, i), pair)
  }
  sessionCookie = [...jar.values()].join('; ')
}

/** 옛 사이트(그누보드) 로그인. 계정 정보가 없으면 false. */
function login() {
  const id = process.env.BELIFE_ID
  const pw = process.env.BELIFE_PW
  if (!id || !pw) return Promise.resolve(false)
  const body = new URLSearchParams({ url: `http://${OLD_HOST}/belife/index.php`, mb_id: id, mb_password: pw }).toString()
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: OLD_IP,
        port: 80,
        path: '/belife/bbs/login_check.php',
        method: 'POST',
        headers: {
          Host: OLD_HOST,
          'User-Agent': UA,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
          Referer: `http://${OLD_HOST}/belife/bbs/login.php`,
        },
      },
      res => {
        res.resume()
        mergeCookies(res.headers['set-cookie'])
        resolve(Boolean(sessionCookie))
      },
    )
    req.setTimeout(TIMEOUT_MS, () => req.destroy(new Error('timeout')))
    req.on('error', reject)
    req.end(body)
  })
}

/** 옛 서버에서 path 를 받아 Buffer 로 돌려준다. 같은 서버 안의 리다이렉트는 따라간다. */
function download(path, referer, redirects = 0) {
  return new Promise((resolve, reject) => {
    const reqHeaders = { Host: OLD_HOST, 'User-Agent': UA }
    if (sessionCookie) reqHeaders.Cookie = sessionCookie
    if (referer) reqHeaders.Referer = referer
    const req = http.request(
      { host: OLD_IP, port: 80, path, method: 'GET', headers: reqHeaders },
      res => {
        const { statusCode = 0, headers } = res
        mergeCookies(headers['set-cookie'])
        if (statusCode >= 300 && statusCode < 400 && headers.location && redirects < 5) {
          res.resume()
          const loc = new URL(headers.location, `http://${OLD_HOST}${path}`)
          if (!/(^|\.)belife\.org$/i.test(loc.hostname)) {
            return reject(new Error(`외부 리다이렉트: ${loc.href}`))
          }
          return resolve(download(loc.pathname + loc.search, referer, redirects + 1))
        }
        if (statusCode !== 200) {
          res.resume()
          return reject(new Error(`HTTP ${statusCode}`))
        }
        const chunks = []
        res.on('data', c => chunks.push(c))
        res.on('end', () => resolve({ body: Buffer.concat(chunks), type: headers['content-type'] || '' }))
        res.on('error', reject)
      },
    )
    req.setTimeout(TIMEOUT_MS, () => req.destroy(new Error('timeout')))
    req.on('error', reject)
    req.end()
  })
}

async function withRetry(fn, tries = 3) {
  let last
  for (let i = 0; i < tries; i++) {
    try {
      return await fn()
    } catch (e) {
      last = e
      // 404 등 확정 실패는 재시도하지 않는다.
      if (/^HTTP 4\d\d$/.test(e.message)) break
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw last
}

async function backupSet(key) {
  const set = SETS[key]
  const map = JSON.parse(readFileSync(join(__dirname, set.manifest), 'utf-8'))
  const outDir = join(ROOT, set.dir)
  mkdirSync(outDir, { recursive: true })

  const jobs = Object.entries(map)
    .filter(([, e]) => e.ok)
    .map(([url, e]) => ({ url: url.replace(/&amp;/g, '&'), name: set.file(e) }))
    .filter(j => j.name)

  const stats = { total: jobs.length, saved: 0, skipped: 0, failed: 0, bytes: 0 }
  const failures = []
  let next = 0

  async function worker() {
    while (next < jobs.length) {
      const job = jobs[next++]
      const dest = join(outDir, job.name)
      if (existsSync(dest) && statSync(dest).size > 0) {
        stats.skipped++
        continue
      }
      try {
        const u = new URL(job.url)
        let referer
        if (key === 'files') {
          // 그누보드는 글 보기 페이지를 거친 세션에만 첨부 다운로드를 허용한다.
          const view = `/belife/bbs/board.php?bo_table=${u.searchParams.get('bo_table')}&wr_id=${u.searchParams.get('wr_id')}`
          await withRetry(() => download(view))
          referer = `http://${OLD_HOST}${view}`
        }
        const { body, type } = await withRetry(() => download(u.pathname + u.search, referer))
        // 권한/세션 실패 시 그누보드는 짧은 alert HTML 을 준다. 옛 서버는 정상 파일에도
        // Content-Type 을 text/html 로 붙이므로 타입만으로 판단하지 않고 내용을 본다.
        const head = body.subarray(0, 512).toString('latin1').trimStart().toLowerCase()
        if (/text\/html/i.test(type) && body.length < 4096 && /^<(!doctype|html|script|meta)/.test(head)) {
          throw new Error('HTML 응답(권한 필요 또는 삭제된 파일)')
        }
        writeFileSync(dest, body)
        stats.saved++
        stats.bytes += body.length
      } catch (e) {
        stats.failed++
        failures.push({ url: job.url, name: job.name, error: e.message })
      }
      const done = stats.saved + stats.skipped + stats.failed
      if (done % 100 === 0 || done === jobs.length) {
        console.log(`[${key}] ${done}/${jobs.length} (저장 ${stats.saved}, 건너뜀 ${stats.skipped}, 실패 ${stats.failed})`)
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  return { stats, failures }
}

const keys = process.argv.slice(2).filter(a => SETS[a])
const targets = keys.length ? keys : Object.keys(SETS)
if (targets.includes('files')) {
  // 동시 작업들이 각자 새 세션을 받아 서로 덮어쓰지 않도록 세션 하나를 먼저 만든다.
  await download('/belife/index.php').catch(() => {})
  const ok = await login()
  console.log(ok ? '옛 사이트 로그인 성공' : '옛 사이트 계정(BELIFE_ID/BELIFE_PW) 없음 — 첨부파일은 실패할 수 있음')
}

const report = {}
for (const key of targets) {
  report[key] = await backupSet(key)
  const s = report[key].stats
  console.log(`[${key}] 완료: 저장 ${s.saved} (${(s.bytes / 1024 / 1024).toFixed(1)} MB), 건너뜀 ${s.skipped}, 실패 ${s.failed}`)
}
writeFileSync(join(__dirname, '.backup-report.json'), JSON.stringify(report, null, 2))
console.log('실패 목록: scripts/.backup-report.json')
