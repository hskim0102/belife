import type { PortableTextBlock } from '@portabletext/types'

export interface Post {
  _id: string
  title: string
  slug: { current: string }
  category: 'notice' | 'activity'
  publishedAt: string
  thumbnail?: { asset: { _ref: string } }
  excerpt?: string
  body?: PortableTextBlock[]
}

export interface Program {
  _id: string
  name: string
  slug: { current: string }
  category: 'domestic' | 'overseas' | 'education'
  order?: number
  thumbnail?: { asset: { _ref: string } }
  description: string
  body?: PortableTextBlock[]
}

export interface Milestone {
  _id: string
  year: number
  month: number
  content: string
}

export interface Member {
  _id: string
  group: 'board' | 'auditor' | 'advisor' | 'staff'
  name: string
  position?: string
  order?: number
}

export interface ImpactStat {
  _id: string
  value: string
  unit?: string
  label: string
  order?: number
}

export interface SiteSettings {
  donationBank?: string
  donationAccount?: string
  donationHolder?: string
  contactEmail?: string
  phoneNumber?: string
  address?: string
}
