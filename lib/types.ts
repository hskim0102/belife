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
export type ProgramCategory = 'domestic' | 'overseas' | 'education'
export type MemberGroup = 'board' | 'auditor' | 'advisor' | 'staff'
export type BoardCategory = 'notice' | 'general' | 'faq'

export interface HeroSlide {
  id: number
  imageUrl: string
  alt: string
  order: number
  published: boolean
  blobPathname: string | null
  createdAt: string
  updatedAt: string
}

export interface BoardPost {
  id: number
  category: BoardCategory
  title: string
  author: string
  body: string
  pinned: boolean
  published: boolean
  views: number
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
