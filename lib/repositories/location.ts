import 'server-only'
import type { QueryResultRow } from 'pg'
import { query, queryOne } from '@/lib/db'

interface LocationRow extends QueryResultRow {
  hero_subtitle: string | null
  address: string | null
  map_query: string | null
  map_embed: string | null
  transit_body: string | null
  car_body: string | null
  map_image: string | null
  map_image_alt: string | null
}

export interface LocationSettings {
  /** 페이지 상단 안내 문구 */
  heroSubtitle: string
  /** 화면에 표시하는 주소 */
  address: string
  /** 지도·내비게이션 검색용 도로명 주소 */
  mapQuery: string
  /** 구글 지도 embed iframe 의 src (https://www.google.com/maps/embed?... ) */
  mapEmbed: string
  /** 대중교통 안내 (HTML) */
  transitBody: string
  /** 자동차 안내 (HTML) */
  carBody: string
  /** 약도 이미지 URL */
  mapImage: string
  /** 약도 이미지 대체 텍스트 */
  mapImageAlt: string
}

/**
 * 마이그레이션(018) 적용 전이거나 값이 비어 있을 때 쓰는 기본값.
 * 기존에 페이지에 하드코딩돼 있던 내용과 동일하다.
 */
export const DEFAULT_LOCATION: LocationSettings = {
  heroSubtitle: '아름다운생명사랑을 찾아오시는 방법을 안내해 드립니다.',
  address: '서울시 강북구 인수봉로55가길 16-15 하늘평화센터 2층',
  mapQuery: '서울시 강북구 인수봉로55가길 16-15',
  mapEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3162!2d127.0098867!3d37.6359269!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z!5e0!3m2!1sko!2skr!4v1700000000000!5m2!1sko!2skr',
  transitBody:
    '<h3>1) 지하철 4호선 수유역</h3><p>3번 출구 앞 마을버스 <strong>강북02</strong> 승차 → 세븐일레븐 정류장(구 형제슈퍼) 하차 → 세븐일레븐 골목 200m 직진 → 동익빌라 앞에서 우회전</p><h3>2) 우이신설 경전철 화계역</h3><p>2번 출구 하차 → 송암교회 방면으로 횡단보도를 건넌 후, 이디야 앞 <strong>송암교회·화계사거리(09-803)</strong> 정류장에서 마을버스 <strong>강북02</strong> 승차 → 세븐일레븐 정류장(구 형제슈퍼) 하차 → 세븐일레븐 골목 200m 직진 → 동익빌라 앞에서 우회전</p>',
  carBody:
    '<p>내비게이션에 <strong>‘서울시 강북구 인수봉로55가길 16-15’</strong>를 입력해 주세요.</p><p>※ 주차 공간이 협소하니 가급적 대중교통 이용을 권장드립니다.</p>',
  mapImage: '/directions-map.png',
  mapImageAlt:
    '아름다운생명사랑 찾아오시는 약도 — 수유역 3번 출구 또는 화계역 2번 출구에서 마을버스 강북02 승차 후 세븐일레븐(구 형제슈퍼) 정류장 하차, 도보 200m',
}

const COLUMNS = `hero_subtitle, address, map_query, map_embed, transit_body, car_body, map_image, map_image_alt`

/** 마이그레이션 미적용(테이블/컬럼 없음) 시 폴백 */
function isMissingRelation(err: unknown): boolean {
  const code = typeof err === 'object' && err !== null ? (err as { code?: string }).code : undefined
  return code === '42P01' || code === '42703'
}

function pick(value: string | null | undefined, fallback: string): string {
  const v = value?.trim()
  return v ? v : fallback
}

function toSettings(row: LocationRow): LocationSettings {
  return {
    heroSubtitle: pick(row.hero_subtitle, DEFAULT_LOCATION.heroSubtitle),
    address: pick(row.address, DEFAULT_LOCATION.address),
    mapQuery: pick(row.map_query, DEFAULT_LOCATION.mapQuery),
    mapEmbed: pick(row.map_embed, DEFAULT_LOCATION.mapEmbed),
    transitBody: pick(row.transit_body, DEFAULT_LOCATION.transitBody),
    carBody: pick(row.car_body, DEFAULT_LOCATION.carBody),
    mapImage: pick(row.map_image, DEFAULT_LOCATION.mapImage),
    mapImageAlt: pick(row.map_image_alt, DEFAULT_LOCATION.mapImageAlt),
  }
}

/** '오시는 길' 페이지 내용. 조회 실패 시 기본값으로 폴백해 페이지 렌더링을 막지 않는다. */
export async function getLocationSettings(): Promise<LocationSettings> {
  try {
    const row = await queryOne<LocationRow>(
      `SELECT ${COLUMNS} FROM location_settings WHERE id = 1 LIMIT 1`,
    )
    return row ? toSettings(row) : DEFAULT_LOCATION
  } catch (err) {
    if (isMissingRelation(err)) return DEFAULT_LOCATION
    throw err
  }
}

export async function updateLocationSettings(input: LocationSettings): Promise<void> {
  await query(
    `INSERT INTO location_settings
       (id, hero_subtitle, address, map_query, map_embed, transit_body, car_body, map_image, map_image_alt, updated_at)
     VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, now())
     ON CONFLICT (id) DO UPDATE SET
       hero_subtitle = EXCLUDED.hero_subtitle,
       address       = EXCLUDED.address,
       map_query     = EXCLUDED.map_query,
       map_embed     = EXCLUDED.map_embed,
       transit_body  = EXCLUDED.transit_body,
       car_body      = EXCLUDED.car_body,
       map_image     = EXCLUDED.map_image,
       map_image_alt = EXCLUDED.map_image_alt,
       updated_at    = now()`,
    [
      input.heroSubtitle,
      input.address,
      input.mapQuery,
      input.mapEmbed,
      input.transitBody,
      input.carBody,
      input.mapImage,
      input.mapImageAlt,
    ],
  )
}
