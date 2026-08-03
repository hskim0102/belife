import 'server-only'
import { query, queryOne } from '@/lib/db'
import { clampBrightness, DEFAULT_BRIGHTNESS, DEFAULT_THEME, isThemeKey, type ThemeKey } from '@/lib/theme'

export interface ThemeSettings {
  color: ThemeKey
  brightness: number
}

/** 마이그레이션 미적용(테이블/컬럼 없음) 시 폴백 */
function isMissingRelation(err: unknown): boolean {
  const code = typeof err === 'object' && err !== null ? (err as { code?: string }).code : undefined
  return code === '42P01' || code === '42703'
}

/** 현재 사이트 테마(색상·밝기). 조회 실패 시 기본값으로 폴백해 사이트 렌더링을 막지 않는다. */
export async function getThemeSettings(): Promise<ThemeSettings> {
  // theme_brightness 컬럼이 없을 수 있으므로(마이그레이션 미적용) 색상 조회와 분리해 시도한다.
  const color = await getThemeColor()
  let brightness = DEFAULT_BRIGHTNESS
  try {
    const row = await queryOne<{ theme_brightness: number | null }>(
      `SELECT theme_brightness FROM site_settings WHERE id = 1 LIMIT 1`,
    )
    if (row?.theme_brightness != null) brightness = clampBrightness(Number(row.theme_brightness))
  } catch (err) {
    if (!isMissingRelation(err)) throw err
  }
  return { color, brightness }
}

/** 현재 사이트 테마 색상 키. 조회 실패 시 기본 테마로 폴백. */
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

export async function updateThemeSettings(color: ThemeKey, brightness: number): Promise<void> {
  await query(
    `INSERT INTO site_settings (id, theme_color, theme_brightness) VALUES (1, $1, $2)
       ON CONFLICT (id) DO UPDATE SET theme_color = EXCLUDED.theme_color, theme_brightness = EXCLUDED.theme_brightness`,
    [color, clampBrightness(brightness)],
  )
}
