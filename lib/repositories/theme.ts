import 'server-only'
import { query, queryOne } from '@/lib/db'
import { DEFAULT_THEME, isThemeKey, type ThemeKey } from '@/lib/theme'

/** 마이그레이션 미적용(테이블/컬럼 없음) 시 폴백 */
function isMissingRelation(err: unknown): boolean {
  const code = typeof err === 'object' && err !== null ? (err as { code?: string }).code : undefined
  return code === '42P01' || code === '42703'
}

/** 현재 사이트 테마 키. 조회 실패 시 기본 테마로 폴백해 사이트 렌더링을 막지 않는다. */
export async function getThemeColor(): Promise<ThemeKey> {
  try {
    const row = await queryOne<{ theme_color: string | null }>(
      `SELECT theme_color FROM site_settings WHERE id = 1 LIMIT 1`,
    )
    const value = row?.theme_color
    return value && isThemeKey(value) ? value : DEFAULT_THEME
  } catch (err) {
    if (isMissingRelation(err)) return DEFAULT_THEME
    throw err
  }
}

export async function updateThemeColor(key: ThemeKey): Promise<void> {
  await query(
    `INSERT INTO site_settings (id, theme_color) VALUES (1, $1)
       ON CONFLICT (id) DO UPDATE SET theme_color = EXCLUDED.theme_color`,
    [key],
  )
}
