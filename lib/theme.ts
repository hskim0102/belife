/**
 * 사이트 테마 색상 정의.
 * 관리자 페이지에서 선택한 테마 키(theme_color)와 밝기(theme_brightness)가
 * site_settings에 저장되고, 루트 레이아웃이 해당 팔레트로 globals.css의 CSS 변수를 덮어쓴다.
 */

export const THEME_KEYS = ['green', 'pink', 'blue', 'amber', 'violet'] as const
export type ThemeKey = (typeof THEME_KEYS)[number]

export const DEFAULT_THEME: ThemeKey = 'green'

/**
 * 색상 밝기(농도) 슬라이더 값.
 * 100 = 기본 파스텔(중립), 0 = 가장 진하고 깊은 색, 150 = 기본보다 더 연한 색.
 * 관리자 페이지에서 슬라이더로 조절한다.
 */
export const MIN_BRIGHTNESS = 0
export const MAX_BRIGHTNESS = 150
export const NEUTRAL_BRIGHTNESS = 100 // 기본 팔레트 그대로인 지점
export const BRIGHTNESS_STEP = 5
export const DEFAULT_BRIGHTNESS = NEUTRAL_BRIGHTNESS

/** 슬라이더 입력값을 유효 범위(0~150 정수)로 정규화 */
export function clampBrightness(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_BRIGHTNESS
  return Math.min(MAX_BRIGHTNESS, Math.max(MIN_BRIGHTNESS, Math.round(value)))
}

/** globals.css @theme 블록과 동일한 변수 목록 */
export interface ThemePalette {
  primary: string
  primaryDark: string
  primaryDarker: string
  primaryLight: string
  primaryLighter: string
  primaryAccent: string
  primaryMuted: string
  navyFooter: string
}

export interface ThemeDefinition {
  key: ThemeKey
  label: string
  description: string
  palette: ThemePalette
}

export const THEMES: Record<ThemeKey, ThemeDefinition> = {
  green: {
    key: 'green',
    label: '파스텔 그린',
    description: '맑고 산뜻한 기본 테마',
    palette: {
      primary: '#3f9c6d',
      primaryDark: '#348059',
      primaryDarker: '#2b6b4a',
      primaryLight: '#f4fbf7',
      primaryLighter: '#e0f3e8',
      primaryAccent: '#c2ecd6',
      primaryMuted: '#c3e8d4',
      navyFooter: '#3b5f4d',
    },
  },
  pink: {
    key: 'pink',
    label: '파스텔 핑크',
    description: '따뜻하고 부드러운 분위기',
    palette: {
      primary: '#d96a94',
      primaryDark: '#c4527e',
      primaryDarker: '#a8446a',
      primaryLight: '#fdf6f9',
      primaryLighter: '#fbe8f0',
      primaryAccent: '#f8d5e4',
      primaryMuted: '#f6d3e1',
      navyFooter: '#5c4350',
    },
  },
  blue: {
    key: 'blue',
    label: '파스텔 블루',
    description: '차분하고 신뢰감 있는 느낌',
    palette: {
      primary: '#5b84c4',
      primaryDark: '#4a6ea8',
      primaryDarker: '#3d5c8c',
      primaryLight: '#f5f8fd',
      primaryLighter: '#e6eef9',
      primaryAccent: '#cfe1f7',
      primaryMuted: '#cfdff2',
      navyFooter: '#44536b',
    },
  },
  amber: {
    key: 'amber',
    label: '파스텔 살구',
    description: '활기차고 친근한 느낌',
    palette: {
      primary: '#c98046',
      primaryDark: '#b06a36',
      primaryDarker: '#92572c',
      primaryLight: '#fdf9f4',
      primaryLighter: '#faeddf',
      primaryAccent: '#f6e0c4',
      primaryMuted: '#f3dcc4',
      navyFooter: '#5c4a3a',
    },
  },
  violet: {
    key: 'violet',
    label: '파스텔 라벤더',
    description: '은은하고 우아한 분위기',
    palette: {
      primary: '#8f6fd0',
      primaryDark: '#7757b8',
      primaryDarker: '#614899',
      primaryLight: '#f9f7fd',
      primaryLighter: '#efe9fa',
      primaryAccent: '#dcd2f5',
      primaryMuted: '#ded3f4',
      navyFooter: '#4d445e',
    },
  },
}

export function isThemeKey(value: string): value is ThemeKey {
  return (THEME_KEYS as readonly string[]).includes(value)
}

// ── 색상 유틸: 밝기(농도) 조절을 위한 HSL 변환 ─────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ]
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  const d = max - min
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h /= 6
  }
  return [h * 360, s * 100, l * 100]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360
  s /= 100
  l /= 100
  if (s === 0) {
    const v = l * 255
    return [v, v, v]
  }
  const hue = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [hue(p, q, h + 1 / 3) * 255, hue(p, q, h) * 255, hue(p, q, h - 1 / 3) * 255]
}

/** 채도 배수·명도 증감을 적용한 hex 반환 */
function adjust(hex: string, satMul: number, lightDelta: number): string {
  const [r, g, b] = hexToRgb(hex)
  const [h, s, l] = rgbToHsl(r, g, b)
  const [nr, ng, nb] = hslToRgb(h, clamp(s * satMul, 0, 100), clamp(l + lightDelta, 0, 100))
  return rgbToHex(nr, ng, nb)
}

/** 가장 진한(밝기 0) 상태의 역할별 변환 계수: [채도 배수, 명도 증감] */
const STRONG_ADJUST: Record<keyof ThemePalette, [number, number]> = {
  primary: [1.18, -8],
  primaryDark: [1.18, -8],
  primaryDarker: [1.18, -7],
  primaryAccent: [1.3, -12],
  primaryMuted: [1.3, -12],
  primaryLight: [1.7, -3],
  primaryLighter: [1.6, -5],
  navyFooter: [1.15, -6],
}

/** 가장 연한(밝기 150) 상태의 역할별 변환 계수: [채도 배수, 명도 증감]. 채도↓·명도↑ */
const LIGHT_ADJUST: Record<keyof ThemePalette, [number, number]> = {
  primary: [0.78, 14],
  primaryDark: [0.8, 12],
  primaryDarker: [0.82, 8], // 어두운 역할(푸터·테두리)은 흰 글자 대비 유지를 위해 완만히
  primaryAccent: [0.85, 6],
  primaryMuted: [0.85, 6],
  primaryLight: [0.9, 1], // 이미 흰색에 가까우므로 거의 유지
  primaryLighter: [0.85, 3],
  navyFooter: [0.85, 7],
}

/**
 * 선택한 색상·밝기에 해당하는 최종 팔레트.
 * 밝기 100(중립)은 원본 파스텔, 0은 가장 진한 색, 150은 기본보다 더 연한 색이며
 * 각 구간을 선형 보간한다.
 */
export function resolvePalette(key: ThemeKey, brightness: number = DEFAULT_BRIGHTNESS): ThemePalette {
  const base = THEMES[key].palette
  const b = clampBrightness(brightness)
  if (b === NEUTRAL_BRIGHTNESS) return base
  // 진하게(<100)면 STRONG, 연하게(>100)면 LIGHT 방향으로 t(0~1)만큼 보간
  const darken = b < NEUTRAL_BRIGHTNESS
  const table = darken ? STRONG_ADJUST : LIGHT_ADJUST
  const t = darken
    ? (NEUTRAL_BRIGHTNESS - b) / (NEUTRAL_BRIGHTNESS - MIN_BRIGHTNESS)
    : (b - NEUTRAL_BRIGHTNESS) / (MAX_BRIGHTNESS - NEUTRAL_BRIGHTNESS)
  const out = {} as ThemePalette
  for (const role of Object.keys(base) as (keyof ThemePalette)[]) {
    const [satMul, lightDelta] = table[role]
    out[role] = adjust(base[role], 1 + (satMul - 1) * t, lightDelta * t)
  }
  return out
}

/** 팔레트를 CSS 변수 선언으로 변환 (React style 객체/스타일 태그 공용) */
export function paletteToCssVars(palette: ThemePalette): Record<string, string> {
  return {
    '--color-primary': palette.primary,
    '--color-primary-dark': palette.primaryDark,
    '--color-primary-darker': palette.primaryDarker,
    '--color-primary-light': palette.primaryLight,
    '--color-primary-lighter': palette.primaryLighter,
    '--color-primary-accent': palette.primaryAccent,
    '--color-primary-muted': palette.primaryMuted,
    '--color-navy-footer': palette.navyFooter,
  }
}

/** 루트 레이아웃에서 주입할 :root CSS 문자열 */
export function themeCss(key: ThemeKey, brightness: number = DEFAULT_BRIGHTNESS): string {
  const vars = paletteToCssVars(resolvePalette(key, brightness))
  const body = Object.entries(vars)
    .map(([name, value]) => `${name}:${value}`)
    .join(';')
  return `:root{${body}}`
}
