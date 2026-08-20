export type PostCategory =
  | 'notice'
  | 'activity'
  | 'photo'
  | 'webzine'
  | 'video'
  | 'intro'
  | 'press'
  | 'award'
  | 'calendar'
  | 'report'
  | 'office'
  | 'archive'
export type ProgramCategory = 'domestic' | 'overseas' | 'education'
/** CMS 페이지를 붙일 수 있는 상단 메뉴: 아름다운생명사랑은(intro) / 사업 소개(programs) */
export type MenuKey = 'intro' | 'programs'
/** 함께하는 사람들 구분 키. 목록은 member_groups 테이블에서 관리한다. */
export type MemberGroup = string

export interface HeroSlide {
  id: number
  imageUrl: string
  alt: string
  /** 메인에 표시할 문구(제목). 없으면 홈은 기본 문구로 폴백. 줄바꿈 허용. */
  title: string | null
  /** 제목 아래 설명 문구. 없으면 기본 문구로 폴백. 줄바꿈 허용. */
  subtitle: string | null
  order: number
  published: boolean
  blobPathname: string | null
  createdAt: string
  updatedAt: string
}

export interface Post {
  id: number
  slug: string
  title: string
  category: PostCategory
  publishedAt: string
  thumbnail: string | null
  excerpt: string | null
  body: string | null
  /** 분류 태그(활동소식 sca: 가정방문/어린이/마음건강 등). 없으면 빈 배열. */
  tags: string[]
}

/** 관리자가 메뉴 아래에 등록·수정하는 CMS 페이지. */
export interface MenuPage {
  id: number
  menu: MenuKey
  slug: string
  title: string
  body: string | null
  order: number
  published: boolean
  createdAt: string
  updatedAt: string
}

export interface Program {
  id: number
  slug: string
  name: string
  category: ProgramCategory
  order: number
  thumbnail: string | null
  description: string
  body: string | null
}

export interface Milestone {
  id: number
  year: number
  month: number
  content: string
}

export interface Member {
  id: number
  group: MemberGroup
  name: string
  position: string | null
  order: number
}

export interface ImpactStat {
  id: number
  value: string
  unit: string | null
  label: string
  order: number
}

export interface SiteSettings {
  donationBank: string | null
  donationAccount: string | null
  donationHolder: string | null
  contactEmail: string | null
  phoneNumber: string | null
  address: string | null
}

/** 팝업 알림 */
export interface Notification {
  id: number
  title: string
  body: string | null
  type: 'info' | 'success' | 'warning' | 'error'
  enabled: boolean
  showFrequency: 'always' | 'daily'
  order: number
  createdAt: string
  updatedAt: string
}
