import { describe, it, expect } from 'vitest'
import {
  THEMES,
  derivePalette,
  hexToHsv,
  hsvToHex,
  isThemeColor,
  normalizeHex,
  resolvePalette,
  themeCss,
  type ThemePalette,
} from '@/lib/theme'

function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

/** 두 hex 가 눈으로 구분되지 않을 만큼 가까운지(채널당 오차 허용) */
function expectClose(actual: string, expected: string, tolerance = 8) {
  const a = rgb(actual)
  const e = rgb(expected)
  for (let i = 0; i < 3; i++) {
    expect(Math.abs(a[i] - e[i]),
      `${actual} vs ${expected} (채널 ${i})`).toBeLessThanOrEqual(tolerance)
  }
}

/** hex 의 HSL 명도(0~100) */
function lightness(hex: string): number {
  const [r, g, b] = rgb(hex).map(v => v / 255)
  return ((Math.max(r, g, b) + Math.min(r, g, b)) / 2) * 100
}

describe('normalizeHex', () => {
  it('대소문자와 3자리 축약을 소문자 6자리로 맞춘다', () => {
    expect(normalizeHex('#FF4885')).toBe('#ff4885')
    expect(normalizeHex('FF4885')).toBe('#ff4885')
    expect(normalizeHex('#f48')).toBe('#ff4488')
    expect(normalizeHex('  #ff4885  ')).toBe('#ff4885')
  })

  it('hex 가 아니면 null', () => {
    expect(normalizeHex('green')).toBeNull()
    expect(normalizeHex('#ff48')).toBeNull()
    expect(normalizeHex('#gggggg')).toBeNull()
    expect(normalizeHex('')).toBeNull()
  })
})

describe('isThemeColor', () => {
  it('프리셋 키와 hex 를 모두 받아들인다', () => {
    expect(isThemeColor('green')).toBe(true)
    expect(isThemeColor('#ff4885')).toBe(true)
    expect(isThemeColor('rgb(255,0,0)')).toBe(false)
    expect(isThemeColor('teal')).toBe(false)
  })
})

describe('HSV 변환', () => {
  it('hex → HSV → hex 왕복에서 색이 유지된다', () => {
    for (const hex of ['#ff4885', '#3f9c6d', '#000000', '#ffffff', '#808080']) {
      expectClose(hsvToHex(...(Object.values(hexToHsv(hex)) as [number, number, number])), hex, 1)
    }
  })

  it('무채색은 채도 0 이다', () => {
    expect(hexToHsv('#808080').s).toBe(0)
  })
})

describe('derivePalette', () => {
  it('기본 테마의 대표색을 넣으면 기본 팔레트를 거의 그대로 재현한다', () => {
    const green = THEMES.green.palette
    const derived = derivePalette(green.primary)
    for (const role of Object.keys(green) as (keyof ThemePalette)[]) {
      expectClose(derived[role], green[role])
    }
  })

  it('너무 밝은 색을 골라도 대표색 명도를 흰 글씨가 읽히는 범위로 좁힌다', () => {
    for (const hex of ['#ffff00', '#ffffff', '#000000']) {
      const l = lightness(derivePalette(hex).primary)
      expect(l).toBeGreaterThanOrEqual(31)
      expect(l).toBeLessThanOrEqual(63)
    }
  })

  it('연한 역할은 대표색보다 밝고, 어두운 역할은 더 어둡다', () => {
    const p = derivePalette('#ff4885')
    expect(lightness(p.primaryLight)).toBeGreaterThan(lightness(p.primaryLighter))
    expect(lightness(p.primaryLighter)).toBeGreaterThan(lightness(p.primary))
    expect(lightness(p.primary)).toBeGreaterThan(lightness(p.primaryDark))
    expect(lightness(p.primaryDark)).toBeGreaterThan(lightness(p.primaryDarker))
  })
})

describe('resolvePalette', () => {
  it('프리셋 키는 그대로 쓰고 hex 는 파생한다', () => {
    expect(resolvePalette('green').primary).toBe(THEMES.green.palette.primary)
    expect(resolvePalette('#ff4885').primary).toBe(derivePalette('#ff4885').primary)
  })

  it('알 수 없는 값은 기본 테마로 떨어진다', () => {
    expect(resolvePalette('nope').primary).toBe(THEMES.green.palette.primary)
  })

  it('hex 에도 밝기 조절이 적용된다', () => {
    const neutral = resolvePalette('#ff4885', 100).primary
    const strong = resolvePalette('#ff4885', 0).primary
    const light = resolvePalette('#ff4885', 150).primary
    expect(lightness(strong)).toBeLessThan(lightness(neutral))
    expect(lightness(light)).toBeGreaterThan(lightness(neutral))
  })
})

describe('themeCss', () => {
  it('hex 를 그대로 :root 변수 선언으로 내보낸다', () => {
    const css = themeCss('#ff4885', 100)
    expect(css.startsWith(':root{')).toBe(true)
    expect(css).toContain(`--color-primary:${derivePalette('#ff4885').primary}`)
    expect(css).toContain('--color-navy-footer:')
  })
})
