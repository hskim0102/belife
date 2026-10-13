// Prisma(DATABASE_URL) 와 Neon(NEON_DATABASE_URL) 의 public 테이블별 행 수 비교.
//   node scripts/compare-db-counts.mjs
import { readFileSync } from 'node:fs'
import pg from 'pg'
for (const l of readFileSync(new URL('../.env.local', import.meta.url), 'utf-8').split('\n')) {
  const m = l.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/)
  if (m) process.env[m[1]] ??= m[2]
}
async function counts(url) {
  const c = new pg.Client({ connectionString: url })
  await c.connect()
  const tables = (await c.query(`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1`)).rows
  const out = {}
  for (const { tablename: t } of tables) out[t] = (await c.query(`SELECT count(*)::int n FROM "${t}"`)).rows[0].n
  await c.end()
  return out
}
const [src, dst] = await Promise.all([counts(process.env.DATABASE_URL), counts(process.env.NEON_DATABASE_URL)])
const rows = [...new Set([...Object.keys(src), ...Object.keys(dst)])].sort().map(t => ({
  table: t, prisma: src[t] ?? '-', neon: dst[t] ?? '-', ok: src[t] === dst[t] ? '✓' : '✗',
}))
console.table(rows)
console.log(rows.every(r => r.ok === '✓') ? '모든 테이블 일치' : '불일치 있음')
