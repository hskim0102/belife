/**
 * 사이트 테마 색상 정의.
 * 관리자 페이지에서 선택한 테마 키가 site_settings.theme_color에 저장되고,
 * 루트 레이아웃이 해당 팔레트로 globals.css의 CSS 변수를 덮어쓴다.
 */

export const THEME_KEYS = ['green', 'pink', 'blue', 'amber', 'violet'] as const
export type ThemeKey = (typeof THEME_KEYS)[number]

export const DEFAULT_THEME: ThemeKey = 'green'

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
export function themeCss(key: ThemeKey): string {
  const vars = paletteToCssVars(THEMES[key].palette)
  const body = Object.entries(vars)
    .map(([name, value]) => `${name}:${value}`)
    .join(';')
  return `:root{${body}}`
}
