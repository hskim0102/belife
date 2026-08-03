import type { PostCategory } from './types'

/**
 * belife.org 게시판 카테고리 정의(원본 사이트 메뉴 구조 기준).
 *   공지사항 / 사진게시판 / 홍보자료(웹진·동영상·소개·보도자료·표창·달력)
 *
 * 모두 posts 테이블에 적재되어 있으며(category 값 = key), 활동소식(activity)은
 * 게시판이 아니라 '소식(/news)'에서 다룬다.
 */
export interface BoardCategoryDef {
  /** posts.category 값 = URL 세그먼트(/board/<key>) */
  key: Exclude<PostCategory, 'activity'>
  label: string
  /** 목록 표시 방식: 텍스트 리스트(공지) vs 썸네일 카드 */
  layout: 'list' | 'card'
  /** 상위 묶음(홍보자료 등). 메뉴 그룹핑·랜딩 구획용 */
  group?: string
  /** 랜딩/빈 목록용 장식 이모지 */
  emoji: string
  /** 카드 색상 칩 클래스 */
  chip: string
}

export const BOARD_CATEGORIES: BoardCategoryDef[] = [
  { key: 'notice',   label: '공지사항',            layout: 'list', emoji: '📢', chip: 'bg-blue-100 text-blue-700' },
  { key: 'report',   label: '연례보고',            layout: 'card', emoji: '📊', chip: 'bg-indigo-100 text-indigo-700' },
  { key: 'photo',    label: '사진게시판',          layout: 'card', emoji: '📸', chip: 'bg-rose-100 text-rose-700' },
  { key: 'webzine',  label: '웹진',                layout: 'card', group: '홍보자료', emoji: '📰', chip: 'bg-amber-100 text-amber-700' },
  { key: 'video',    label: '동영상',              layout: 'card', group: '홍보자료', emoji: '🎬', chip: 'bg-purple-100 text-purple-700' },
  { key: 'intro',    label: '아름다운생명사랑소개', layout: 'card', group: '홍보자료', emoji: '💗', chip: 'bg-pink-100 text-pink-700' },
  { key: 'press',    label: '보도자료',            layout: 'card', group: '홍보자료', emoji: '🗞️', chip: 'bg-teal-100 text-teal-700' },
  { key: 'award',    label: '표창',                layout: 'card', group: '홍보자료', emoji: '🏆', chip: 'bg-orange-100 text-orange-700' },
  { key: 'calendar', label: '생명사랑 달력보기',    layout: 'card', group: '홍보자료', emoji: '📅', chip: 'bg-emerald-100 text-emerald-700' },
]

export const BOARD_CATEGORY_KEYS = BOARD_CATEGORIES.map(c => c.key)

/**
 * 소식(활동소식)의 분류 목록. belife.org 활동소식의 sca 분류 기준.
 * posts.tags 에 단일 값으로 저장되며, 작성/수정 시 이 목록에서 선택한다.
 */
export const ACTIVITY_TAGS = [
  '가정방문',
  '어린이',
  '마음건강',
  '이주민보건',
  '동남아시아',
  '북녘어린이',
  '교육연구',
  '강북사랑',
  '사무국',
] as const

export function getBoardCategory(key: string): BoardCategoryDef | undefined {
  return BOARD_CATEGORIES.find(c => c.key === key)
}

/** 게시판 카테고리 여부(소식 activity 와 구분) */
export function isBoardCategory(key: string): key is BoardCategoryDef['key'] {
  return BOARD_CATEGORY_KEYS.includes(key as BoardCategoryDef['key'])
}
