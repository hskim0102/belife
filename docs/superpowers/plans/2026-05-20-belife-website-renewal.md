# belife 홈페이지 리뉴얼 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js + Sanity.io + Tailwind CSS로 아름다운생명사랑(belife) 홈페이지를 전면 재구축한다.

**Architecture:** Next.js App Router를 사용해 서버 컴포넌트 기반으로 각 페이지를 구성하고, Sanity.io Headless CMS로 소식·사업·발자취·사람들 등 콘텐츠를 관리한다. ISR(60초)로 소식 페이지를 최신 상태로 유지하며 Vercel에 무료 배포한다.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Sanity.io, Vitest + React Testing Library, Vercel

---

## 파일 구조

```
belife/
├── app/
│   ├── layout.tsx                  # 루트 레이아웃 (Nav + Footer 포함)
│   ├── page.tsx                    # 홈페이지
│   ├── globals.css                 # 전역 스타일
│   ├── intro/
│   │   ├── page.tsx                # 소명 & 핵심가치
│   │   ├── history/page.tsx        # 발자취 타임라인
│   │   └── people/page.tsx         # 함께하는 사람들
│   ├── programs/
│   │   ├── page.tsx                # 사업 목록 (탭 필터)
│   │   └── [slug]/page.tsx         # 사업 상세
│   ├── news/
│   │   ├── page.tsx                # 소식 목록
│   │   └── [slug]/page.tsx         # 소식 상세
│   ├── support/page.tsx            # 후원·참여
│   ├── contact/page.tsx            # 문의
│   └── studio/[[...tool]]/page.tsx # Sanity Studio 내장
├── components/
│   ├── layout/
│   │   ├── Header.tsx              # 네비게이션
│   │   └── Footer.tsx              # 푸터
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── MissionSection.tsx
│   │   ├── ProgramsSection.tsx
│   │   ├── ImpactSection.tsx
│   │   ├── NewsSection.tsx
│   │   └── CtaSection.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── SectionLabel.tsx
│       ├── ProgramCard.tsx
│       └── NewsCard.tsx
├── lib/
│   ├── sanity/
│   │   ├── client.ts               # Sanity 클라이언트
│   │   ├── queries.ts              # GROQ 쿼리 모음
│   │   └── types.ts                # Sanity 응답 TypeScript 타입
│   └── utils.ts                    # 날짜 포맷 등 유틸
├── sanity/
│   ├── sanity.config.ts
│   └── schemas/
│       ├── index.ts
│       ├── post.ts
│       ├── program.ts
│       ├── milestone.ts
│       ├── member.ts
│       ├── impactStat.ts
│       └── siteSettings.ts
├── __tests__/
│   ├── components/
│   │   ├── Button.test.tsx
│   │   ├── SectionLabel.test.tsx
│   │   ├── Header.test.tsx
│   │   └── Footer.test.tsx
│   └── lib/
│       └── utils.test.ts
├── tailwind.config.ts
├── next.config.ts
├── vitest.config.ts
└── sanity.cli.ts
```

---

## Task 1: Next.js 프로젝트 초기화

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `app/globals.css`

- [ ] **Step 1: 현재 디렉토리에 Next.js 프로젝트 초기화**

```bash
cd D:/Project/belife
npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir=false --import-alias="@/*"
```

프롬프트 응답:
- Would you like to use `src/` directory? → **No**
- Would you like to use App Router? → **Yes**
- Would you like to customize the default import alias? → **No**

- [ ] **Step 2: 테스트 의존성 설치**

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: vitest.config.ts 작성**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

- [ ] **Step 4: vitest.setup.ts 작성**

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: package.json scripts에 test 추가**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest",
  "test:run": "vitest run"
}
```

- [ ] **Step 6: .gitignore에 `.superpowers/` 추가**

```
# Superpowers brainstorm files
.superpowers/
```

- [ ] **Step 7: 기본 실행 확인**

```bash
npm run dev
```

Expected: `http://localhost:3000` 에서 Next.js 기본 페이지 표시

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "feat: initialize Next.js project with TypeScript, Tailwind, Vitest"
```

---

## Task 2: Tailwind 디자인 토큰 설정

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: tailwind.config.ts에 belife 디자인 토큰 추가**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16a34a',
          dark: '#14532d',
          darker: '#052e16',
          light: '#f0fdf4',
          lighter: '#dcfce7',
          accent: '#4ade80',
          muted: '#bbf7d0',
        },
        text: {
          DEFAULT: '#1a1a1a',
          subtle: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        'card-lg': '16px',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: globals.css에 Pretendard 폰트 및 기본 스타일 설정**

```css
/* app/globals.css */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    @apply font-sans text-text bg-white;
  }
}
```

- [ ] **Step 3: 커밋**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: add belife design tokens to Tailwind config"
```

---

## Task 3: Sanity 프로젝트 설정

**Files:**
- Create: `sanity/sanity.config.ts`
- Create: `sanity.cli.ts`
- Create: `app/studio/[[...tool]]/page.tsx`
- Modify: `next.config.ts`

- [ ] **Step 1: Sanity 패키지 설치**

```bash
npm install next-sanity @sanity/image-url
npm install -D @sanity/types
```

- [ ] **Step 2: Sanity 프로젝트 생성 (Sanity.io 계정 필요)**

```bash
npx sanity@latest init --project belife-website --dataset production
```

이 명령이 출력하는 `projectId`를 메모해둔다 (예: `abc123de`).

- [ ] **Step 3: sanity.cli.ts 작성**

```typescript
// sanity.cli.ts
import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  },
})
```

- [ ] **Step 4: .env.local 작성**

```bash
# .env.local
NEXT_PUBLIC_SANITY_PROJECT_ID=여기에_프로젝트_ID_입력
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=  # Sanity 대시보드에서 발급 (선택, draft 조회 시 필요)
```

- [ ] **Step 5: .gitignore에 .env.local 추가 확인**

```bash
grep ".env.local" .gitignore
```

Expected: `.env.local` 라인이 있어야 함. 없으면 추가.

- [ ] **Step 6: sanity/sanity.config.ts 작성 (스키마는 Task 4에서 추가)**

```typescript
// sanity/sanity.config.ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemas } from './schemas'

export default defineConfig({
  name: 'belife',
  title: '아름다운생명사랑',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemas },
})
```

- [ ] **Step 7: app/studio/[[...tool]]/page.tsx 작성**

```typescript
// app/studio/[[...tool]]/page.tsx
'use client'
import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity/sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

- [ ] **Step 8: next.config.ts 업데이트**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 9: 커밋**

```bash
git add sanity/ sanity.cli.ts app/studio next.config.ts
git commit -m "feat: add Sanity Studio configuration and embedded studio route"
```

---

## Task 4: Sanity CMS 스키마 작성

**Files:**
- Create: `sanity/schemas/post.ts`
- Create: `sanity/schemas/program.ts`
- Create: `sanity/schemas/milestone.ts`
- Create: `sanity/schemas/member.ts`
- Create: `sanity/schemas/impactStat.ts`
- Create: `sanity/schemas/siteSettings.ts`
- Create: `sanity/schemas/index.ts`

- [ ] **Step 1: post 스키마 (소식)**

```typescript
// sanity/schemas/post.ts
import { defineField, defineType } from 'sanity'

export const post = defineType({
  name: 'post',
  title: '소식',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: '제목', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'URL 슬러그', type: 'slug', options: { source: 'title' }, validation: r => r.required() }),
    defineField({ name: 'category', title: '카테고리', type: 'string', options: { list: [{ title: '공지사항', value: 'notice' }, { title: '활동소식', value: 'activity' }] }, validation: r => r.required() }),
    defineField({ name: 'publishedAt', title: '게시일', type: 'datetime', validation: r => r.required() }),
    defineField({ name: 'thumbnail', title: '썸네일 이미지', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'excerpt', title: '요약', type: 'text', rows: 3 }),
    defineField({ name: 'body', title: '본문', type: 'array', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }] }),
  ],
  orderings: [{ title: '최신순', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'publishedAt', media: 'thumbnail' } },
})
```

- [ ] **Step 2: program 스키마 (사업)**

```typescript
// sanity/schemas/program.ts
import { defineField, defineType } from 'sanity'

export const program = defineType({
  name: 'program',
  title: '사업',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: '사업명', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'URL 슬러그', type: 'slug', options: { source: 'name' }, validation: r => r.required() }),
    defineField({ name: 'category', title: '구분', type: 'string', options: { list: [{ title: '국내', value: 'domestic' }, { title: '해외', value: 'overseas' }, { title: '교육', value: 'education' }] }, validation: r => r.required() }),
    defineField({ name: 'order', title: '정렬 순서', type: 'number' }),
    defineField({ name: 'thumbnail', title: '썸네일', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'description', title: '짧은 설명', type: 'text', rows: 2, validation: r => r.required() }),
    defineField({ name: 'body', title: '상세 내용', type: 'array', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }] }),
  ],
  preview: { select: { title: 'name', subtitle: 'category', media: 'thumbnail' } },
})
```

- [ ] **Step 3: milestone 스키마 (발자취)**

```typescript
// sanity/schemas/milestone.ts
import { defineField, defineType } from 'sanity'

export const milestone = defineType({
  name: 'milestone',
  title: '발자취',
  type: 'document',
  fields: [
    defineField({ name: 'year', title: '연도', type: 'number', validation: r => r.required().min(2006).max(2100) }),
    defineField({ name: 'month', title: '월', type: 'number', validation: r => r.required().min(1).max(12) }),
    defineField({ name: 'content', title: '내용', type: 'text', rows: 2, validation: r => r.required() }),
  ],
  orderings: [{ title: '최신순', name: 'dateDesc', by: [{ field: 'year', direction: 'desc' }, { field: 'month', direction: 'desc' }] }],
  preview: { select: { title: 'content', subtitle: 'year' } },
})
```

- [ ] **Step 4: member 스키마 (함께하는 사람들)**

```typescript
// sanity/schemas/member.ts
import { defineField, defineType } from 'sanity'

export const member = defineType({
  name: 'member',
  title: '함께하는 사람들',
  type: 'document',
  fields: [
    defineField({ name: 'group', title: '구분', type: 'string', options: { list: [{ title: '이사회', value: 'board' }, { title: '감사', value: 'auditor' }, { title: '자문위원', value: 'advisor' }, { title: '상근자', value: 'staff' }] }, validation: r => r.required() }),
    defineField({ name: 'name', title: '이름', type: 'string', validation: r => r.required() }),
    defineField({ name: 'position', title: '직책/소속', type: 'string' }),
    defineField({ name: 'order', title: '정렬 순서', type: 'number' }),
  ],
  preview: { select: { title: 'name', subtitle: 'position' } },
})
```

- [ ] **Step 5: impactStat 스키마 (임팩트 숫자)**

```typescript
// sanity/schemas/impactStat.ts
import { defineField, defineType } from 'sanity'

export const impactStat = defineType({
  name: 'impactStat',
  title: '임팩트 수치',
  type: 'document',
  fields: [
    defineField({ name: 'value', title: '숫자', type: 'string', validation: r => r.required() }),
    defineField({ name: 'unit', title: '단위', type: 'string' }),
    defineField({ name: 'label', title: '설명 라벨', type: 'string', validation: r => r.required() }),
    defineField({ name: 'order', title: '순서', type: 'number' }),
  ],
  preview: { select: { title: 'label', subtitle: 'value' } },
})
```

- [ ] **Step 6: siteSettings 스키마 (공통 설정)**

```typescript
// sanity/schemas/siteSettings.ts
import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: '사이트 설정',
  type: 'document',
  fields: [
    defineField({ name: 'donationBank', title: '후원 은행명', type: 'string' }),
    defineField({ name: 'donationAccount', title: '후원 계좌번호', type: 'string' }),
    defineField({ name: 'donationHolder', title: '예금주', type: 'string' }),
    defineField({ name: 'contactEmail', title: '이메일', type: 'string' }),
    defineField({ name: 'phoneNumber', title: '전화번호', type: 'string' }),
    defineField({ name: 'address', title: '주소', type: 'string' }),
  ],
  preview: { prepare: () => ({ title: '사이트 설정' }) },
})
```

- [ ] **Step 7: schemas/index.ts 작성**

```typescript
// sanity/schemas/index.ts
import { post } from './post'
import { program } from './program'
import { milestone } from './milestone'
import { member } from './member'
import { impactStat } from './impactStat'
import { siteSettings } from './siteSettings'

export const schemas = [post, program, milestone, member, impactStat, siteSettings]
```

- [ ] **Step 8: Sanity Studio 실행 확인**

```bash
npm run dev
```

`http://localhost:3000/studio` 에서 Sanity Studio가 로드되고 6개 스키마가 보이는지 확인.

- [ ] **Step 9: 커밋**

```bash
git add sanity/schemas/
git commit -m "feat: add all Sanity CMS schemas (post, program, milestone, member, impactStat, siteSettings)"
```

---

## Task 5: Sanity 클라이언트, 타입, GROQ 쿼리

**Files:**
- Create: `lib/sanity/client.ts`
- Create: `lib/sanity/types.ts`
- Create: `lib/sanity/queries.ts`
- Create: `lib/utils.ts`
- Create: `__tests__/lib/utils.test.ts`

- [ ] **Step 1: Sanity 클라이언트 작성**

```typescript
// lib/sanity/client.ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
})
```

- [ ] **Step 2: TypeScript 타입 정의**

```typescript
// lib/sanity/types.ts
export interface Post {
  _id: string
  title: string
  slug: { current: string }
  category: 'notice' | 'activity'
  publishedAt: string
  thumbnail?: { asset: { _ref: string } }
  excerpt?: string
  body?: unknown[]
}

export interface Program {
  _id: string
  name: string
  slug: { current: string }
  category: 'domestic' | 'overseas' | 'education'
  order?: number
  thumbnail?: { asset: { _ref: string } }
  description: string
  body?: unknown[]
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
```

- [ ] **Step 3: GROQ 쿼리 작성**

```typescript
// lib/sanity/queries.ts
import { client } from './client'
import type { Post, Program, Milestone, Member, ImpactStat, SiteSettings } from './types'

export async function getRecentPosts(limit = 3): Promise<Post[]> {
  return client.fetch(
    `*[_type == "post"] | order(publishedAt desc) [0...$limit] { _id, title, slug, category, publishedAt, thumbnail, excerpt }`,
    { limit: limit - 1 }
  )
}

export async function getAllPosts(): Promise<Post[]> {
  return client.fetch(
    `*[_type == "post"] | order(publishedAt desc) { _id, title, slug, category, publishedAt, thumbnail, excerpt }`
  )
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0]`,
    { slug }
  )
}

export async function getAllPrograms(): Promise<Program[]> {
  return client.fetch(
    `*[_type == "program"] | order(order asc) { _id, name, slug, category, thumbnail, description }`
  )
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  return client.fetch(
    `*[_type == "program" && slug.current == $slug][0]`,
    { slug }
  )
}

export async function getMilestones(): Promise<Milestone[]> {
  return client.fetch(
    `*[_type == "milestone"] | order(year desc, month desc) { _id, year, month, content }`
  )
}

export async function getMembers(): Promise<Member[]> {
  return client.fetch(
    `*[_type == "member"] | order(order asc) { _id, group, name, position }`
  )
}

export async function getImpactStats(): Promise<ImpactStat[]> {
  return client.fetch(
    `*[_type == "impactStat"] | order(order asc) { _id, value, unit, label }`
  )
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.fetch(`*[_type == "siteSettings"][0]`)
}
```

- [ ] **Step 4: utils.ts 작성**

```typescript
// lib/utils.ts
export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`
}

export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    notice: '공지사항',
    activity: '활동소식',
    domestic: '국내',
    overseas: '해외',
    education: '교육',
  }
  return map[category] ?? category
}
```

- [ ] **Step 5: utils 테스트 작성**

```typescript
// __tests__/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate, getCategoryLabel } from '@/lib/utils'

describe('formatDate', () => {
  it('ISO 날짜를 한국 형식으로 변환한다', () => {
    expect(formatDate('2025-05-20T00:00:00Z')).toBe('2025. 05. 20')
  })
  it('한 자리 월/일을 0 패딩한다', () => {
    expect(formatDate('2025-01-05T00:00:00Z')).toBe('2025. 01. 05')
  })
})

describe('getCategoryLabel', () => {
  it('notice → 공지사항', () => {
    expect(getCategoryLabel('notice')).toBe('공지사항')
  })
  it('domestic → 국내', () => {
    expect(getCategoryLabel('domestic')).toBe('국내')
  })
  it('알 수 없는 카테고리는 그대로 반환', () => {
    expect(getCategoryLabel('unknown')).toBe('unknown')
  })
})
```

- [ ] **Step 6: 테스트 실행 확인**

```bash
npm run test:run
```

Expected: `__tests__/lib/utils.test.ts` 5개 테스트 PASS

- [ ] **Step 7: 커밋**

```bash
git add lib/ __tests__/
git commit -m "feat: add Sanity client, types, GROQ queries, and utils"
```

---

## Task 6: UI 기본 컴포넌트

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `components/ui/SectionLabel.tsx`
- Create: `__tests__/components/Button.test.tsx`
- Create: `__tests__/components/SectionLabel.test.tsx`

- [ ] **Step 1: Button 컴포넌트 테스트 작성**

```typescript
// __tests__/components/Button.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('텍스트를 렌더링한다', () => {
    render(<Button>후원하기</Button>)
    expect(screen.getByRole('button', { name: '후원하기' })).toBeInTheDocument()
  })
  it('variant=outline 스타일 클래스가 적용된다', () => {
    render(<Button variant="outline">봉사 신청</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('border')
  })
})
```

- [ ] **Step 2: 테스트 실행 (실패 확인)**

```bash
npm run test:run -- Button
```

Expected: FAIL — "Cannot find module '@/components/ui/Button'"

- [ ] **Step 3: Button 컴포넌트 구현**

```typescript
// components/ui/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-full font-semibold transition-colors cursor-pointer',
        size === 'sm' && 'px-4 py-2 text-sm',
        size === 'md' && 'px-7 py-3 text-base',
        size === 'lg' && 'px-9 py-4 text-lg',
        variant === 'primary' && 'bg-primary text-white hover:bg-primary-dark',
        variant === 'outline' && 'border-2 border-primary text-primary hover:bg-primary-light',
        variant === 'ghost' && 'text-primary hover:bg-primary-light',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 4: cn 유틸 추가 (clsx 기반)**

```bash
npm install clsx
```

```typescript
// lib/cn.ts
import { clsx, type ClassValue } from 'clsx'
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
```

- [ ] **Step 5: SectionLabel 테스트 작성**

```typescript
// __tests__/components/SectionLabel.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionLabel } from '@/components/ui/SectionLabel'

describe('SectionLabel', () => {
  it('텍스트를 렌더링한다', () => {
    render(<SectionLabel>Our Mission</SectionLabel>)
    expect(screen.getByText('Our Mission')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: SectionLabel 구현**

```typescript
// components/ui/SectionLabel.tsx
import { ReactNode } from 'react'

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold text-primary tracking-widest uppercase mb-3">
      {children}
    </p>
  )
}
```

- [ ] **Step 7: 테스트 통과 확인**

```bash
npm run test:run
```

Expected: 모든 테스트 PASS

- [ ] **Step 8: 커밋**

```bash
git add components/ui/ lib/cn.ts __tests__/components/
git commit -m "feat: add Button and SectionLabel UI components with tests"
```

---

## Task 7: Header (네비게이션)

**Files:**
- Create: `components/layout/Header.tsx`
- Create: `__tests__/components/Header.test.tsx`

- [ ] **Step 1: Header 테스트 작성**

```typescript
// __tests__/components/Header.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '@/components/layout/Header'

describe('Header', () => {
  it('로고 텍스트를 렌더링한다', () => {
    render(<Header />)
    expect(screen.getByText('아름다운생명사랑')).toBeInTheDocument()
  })
  it('5개 메뉴를 렌더링한다', () => {
    render(<Header />)
    expect(screen.getByText('소개')).toBeInTheDocument()
    expect(screen.getByText('사업')).toBeInTheDocument()
    expect(screen.getByText('소식')).toBeInTheDocument()
    expect(screen.getByText('후원·참여')).toBeInTheDocument()
    expect(screen.getByText('문의')).toBeInTheDocument()
  })
  it('후원하기 버튼을 렌더링한다', () => {
    render(<Header />)
    expect(screen.getByText('후원하기')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실행 (실패 확인)**

```bash
npm run test:run -- Header
```

Expected: FAIL — "Cannot find module '@/components/layout/Header'"

- [ ] **Step 3: Header 구현**

```typescript
// components/layout/Header.tsx
'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

const navItems = [
  { label: '소개', href: '/intro' },
  { label: '사업', href: '/programs' },
  { label: '소식', href: '/news' },
  { label: '후원·참여', href: '/support' },
  { label: '문의', href: '/contact' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary font-black text-xl">
          <span>🌸</span>
          <span>아름다운생명사랑</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/support" className="hidden md:block">
          <Button size="sm">후원하기</Button>
        </Link>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="메뉴 열기"
        >
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-4">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/support" onClick={() => setMenuOpen(false)}>
            <Button size="sm" className="w-full">후원하기</Button>
          </Link>
        </div>
      )}
    </header>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test:run -- Header
```

Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add components/layout/Header.tsx __tests__/components/Header.test.tsx
git commit -m "feat: add Header component with mobile menu"
```

---

## Task 8: Footer

**Files:**
- Create: `components/layout/Footer.tsx`
- Create: `__tests__/components/Footer.test.tsx`

- [ ] **Step 1: Footer 테스트 작성**

```typescript
// __tests__/components/Footer.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/layout/Footer'

describe('Footer', () => {
  it('단체명을 렌더링한다', () => {
    render(<Footer />)
    expect(screen.getByText('아름다운생명사랑')).toBeInTheDocument()
  })
  it('공익법인 문구를 렌더링한다', () => {
    render(<Footer />)
    expect(screen.getByText(/공익법인/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Footer 구현**

```typescript
// components/layout/Footer.tsx
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-primary-darker text-gray-500 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <p className="text-primary-accent font-black text-lg mb-2">🌸 아름다운생명사랑</p>
            <p className="text-sm leading-7">
              공익법인(구,지정기부금단체) · 대표: 김영진<br />
              belife = beautiful + life · 아름다운 생명
            </p>
          </div>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/intro" className="hover:text-primary-accent transition-colors">소개</Link>
            <Link href="/programs" className="hover:text-primary-accent transition-colors">사업</Link>
            <Link href="/news" className="hover:text-primary-accent transition-colors">소식</Link>
            <Link href="/support" className="hover:text-primary-accent transition-colors">후원·참여</Link>
            <Link href="/contact" className="hover:text-primary-accent transition-colors">문의</Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-center text-gray-600">
          © {new Date().getFullYear()} 아름다운생명사랑. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: 테스트 통과 확인**

```bash
npm run test:run
```

Expected: 모든 테스트 PASS

- [ ] **Step 4: 커밋**

```bash
git add components/layout/Footer.tsx __tests__/components/Footer.test.tsx
git commit -m "feat: add Footer component"
```

---

## Task 9: 루트 레이아웃 + 홈페이지 섹션 컴포넌트

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/home/HeroSection.tsx`
- Create: `components/home/MissionSection.tsx`
- Create: `components/home/ProgramsSection.tsx`
- Create: `components/home/ImpactSection.tsx`
- Create: `components/home/NewsSection.tsx`
- Create: `components/home/CtaSection.tsx`

- [ ] **Step 1: app/layout.tsx 업데이트**

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: { default: '아름다운생명사랑', template: '%s | 아름다운생명사랑' },
  description: '저소득 어르신, 취약계층 어린이, 이주민, 해외 빈민을 위한 의료복지 비영리단체',
  openGraph: {
    siteName: '아름다운생명사랑',
    locale: 'ko_KR',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: HeroSection 구현**

```typescript
// components/home/HeroSection.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-primary-darker via-primary-dark to-primary-dark min-h-[520px] flex items-center px-6 py-20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto w-full">
        <div className="max-w-lg">
          <span className="inline-block bg-white/15 text-primary-muted text-xs font-semibold px-3 py-1 rounded-full tracking-widest mb-5">
            창립 20주년 · 2006–2025
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
            한 생명을<br />
            <span className="text-primary-accent">천하와 같이</span><br />
            사랑합니다
          </h1>
          <p className="text-primary-muted text-base leading-relaxed mb-8">
            저소득 어르신, 취약계층 어린이, 이주민,<br />
            그리고 해외 빈민까지 — 생명을 사랑하는 의료로 함께합니다.
          </p>
          <div className="flex gap-3">
            <Link href="/support">
              <Button variant="primary" className="bg-white text-primary hover:bg-primary-light">후원하기</Button>
            </Link>
            <Link href="/programs">
              <Button variant="outline" className="border-white/40 text-white hover:bg-white/10">활동 보기</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: MissionSection 구현**

```typescript
// components/home/MissionSection.tsx
import { SectionLabel } from '@/components/ui/SectionLabel'

const missions = [
  { icon: '👴', title: '저소득 어르신', desc: '가정방문 보건의료, 건강관리 서비스' },
  { icon: '🧒', title: '취약계층 어린이', desc: '아동 치과치료 연계, 건강 지원' },
  { icon: '🌏', title: '해외 빈민', desc: '필리핀 마닐라 빈민지역 의료·상비약 지원' },
  { icon: '🏠', title: '이주민·결혼이주여성', desc: '의료 접근성 지원, 건강관리' },
  { icon: '🕊️', title: '북한이탈주민', desc: '건강 회복과 정착 지원' },
  { icon: '📚', title: '의료 교육·연구', desc: '생명사랑의료학교 운영, 예비의료인 교육' },
]

export function MissionSection() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <SectionLabel>Our Mission</SectionLabel>
        <h2 className="text-3xl font-black mb-4">우리가 섬기는 이웃들</h2>
        <p className="text-text-subtle max-w-xl mx-auto mb-12 leading-relaxed">
          아름다운생명사랑은 의료의 사각지대에 놓인 이웃들 곁에서<br />
          생명을 사랑하는 마음으로 일합니다.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {missions.map(m => (
            <div key={m.title} className="bg-primary-light rounded-card-lg p-6 text-left border border-primary-lighter">
              <span className="text-3xl mb-3 block">{m.icon}</span>
              <h4 className="font-bold text-primary-dark mb-1">{m.title}</h4>
              <p className="text-sm text-text-subtle leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: ProgramsSection 구현 (Sanity 연동, 홈 미리보기용)**

```typescript
// components/home/ProgramsSection.tsx
import Link from 'next/link'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Program } from '@/lib/sanity/types'
import { getCategoryLabel } from '@/lib/utils'

const categoryColors: Record<string, string> = {
  domestic: 'bg-primary-lighter text-primary',
  overseas: 'bg-blue-100 text-blue-600',
  education: 'bg-yellow-100 text-yellow-700',
}

export function ProgramsSection({ programs }: { programs: Program[] }) {
  return (
    <section className="bg-primary-light py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <SectionLabel>Programs</SectionLabel>
          <h2 className="text-3xl font-black mb-2">주요 사업</h2>
          <p className="text-text-subtle">국내외에서 다양한 방식으로 생명사랑을 실천합니다</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {programs.slice(0, 4).map(p => (
            <Link key={p._id} href={`/programs/${p.slug.current}`}>
              <div className="bg-white rounded-card-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-28 bg-primary-light flex items-center justify-center text-4xl">🏥</div>
                <div className="p-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[p.category]} mb-2 inline-block`}>
                    {getCategoryLabel(p.category)}
                  </span>
                  <h4 className="font-bold text-sm">{p.name}</h4>
                  <p className="text-xs text-text-subtle mt-1 leading-relaxed line-clamp-2">{p.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/programs" className="text-primary font-semibold text-sm hover:underline">전체 사업 보기 →</Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: ImpactSection 구현 (Sanity 연동)**

```typescript
// components/home/ImpactSection.tsx
import { ImpactStat } from '@/lib/sanity/types'

const fallbackStats: ImpactStat[] = [
  { _id: '1', value: '20', unit: '년', label: '활동 역사 (2006~)' },
  { _id: '2', value: '4', unit: '기', label: '생명사랑의료학교 (2025)' },
  { _id: '3', value: '400+', unit: '가구', label: '필리핀 빈민 지원' },
  { _id: '4', value: '50+', unit: '명', label: '이주민 독감예방접종' },
]

export function ImpactSection({ stats }: { stats: ImpactStat[] }) {
  const displayStats = stats.length > 0 ? stats : fallbackStats
  return (
    <section className="bg-primary py-16 px-6 text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-black text-white mb-12">숫자로 보는 아름다운생명사랑</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {displayStats.map(s => (
            <div key={s._id}>
              <p className="text-5xl font-black text-white leading-none">
                {s.value}<span className="text-2xl">{s.unit}</span>
              </p>
              <p className="text-primary-muted text-sm mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: NewsSection 구현 (Sanity 연동)**

```typescript
// components/home/NewsSection.tsx
import Link from 'next/link'
import { Post } from '@/lib/sanity/types'
import { formatDate, getCategoryLabel } from '@/lib/utils'

export function NewsSection({ posts }: { posts: Post[] }) {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black">최근 소식</h2>
          <Link href="/news" className="text-primary text-sm font-semibold hover:underline">전체 보기 →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map(post => (
            <Link key={post._id} href={`/news/${post.slug.current}`}>
              <article className="rounded-card overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                <div className="h-40 bg-primary-light flex items-center justify-center text-4xl">📋</div>
                <div className="p-4">
                  <span className="text-xs text-primary-dark font-semibold">{getCategoryLabel(post.category)}</span>
                  <p className="text-xs text-text-subtle mt-1 mb-2">{formatDate(post.publishedAt)}</p>
                  <h4 className="font-bold text-sm leading-relaxed line-clamp-2">{post.title}</h4>
                </div>
              </article>
            </Link>
          ))}
          {posts.length === 0 && (
            <p className="col-span-3 text-center text-text-subtle py-10">등록된 소식이 없습니다.</p>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 7: CtaSection 구현**

```typescript
// components/home/CtaSection.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CtaSection() {
  return (
    <section className="bg-gradient-to-br from-primary-light to-primary-lighter py-20 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-black mb-4">함께 생명을 사랑해요 💚</h2>
        <p className="text-text-subtle mb-10 leading-relaxed">
          후원 한 번이 한 생명을 살립니다.<br />
          의료인이라면 봉사로, 누구든 후원으로 함께할 수 있습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/support"><Button size="lg">후원하기</Button></Link>
          <Link href="/support"><Button size="lg" variant="outline">봉사 신청하기</Button></Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 8: 커밋**

```bash
git add app/layout.tsx components/home/ components/layout/
git commit -m "feat: add root layout and all homepage section components"
```

---

## Task 10: 홈페이지 조립 (Sanity 데이터 연결)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: app/page.tsx 작성**

```typescript
// app/page.tsx
import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { MissionSection } from '@/components/home/MissionSection'
import { ProgramsSection } from '@/components/home/ProgramsSection'
import { ImpactSection } from '@/components/home/ImpactSection'
import { NewsSection } from '@/components/home/NewsSection'
import { CtaSection } from '@/components/home/CtaSection'
import { getAllPrograms, getRecentPosts, getImpactStats } from '@/lib/sanity/queries'

export const metadata: Metadata = {
  title: '아름다운생명사랑 | 생명을 사랑하는 의료복지단체',
  description: '저소득 어르신, 취약계층 어린이, 이주민, 해외 빈민을 위한 의료복지 비영리단체',
}

export default async function HomePage() {
  const [programs, posts, stats] = await Promise.all([
    getAllPrograms(),
    getRecentPosts(3),
    getImpactStats(),
  ])

  return (
    <>
      <HeroSection />
      <MissionSection />
      <ProgramsSection programs={programs} />
      <ImpactSection stats={stats} />
      <NewsSection posts={posts} />
      <CtaSection />
    </>
  )
}
```

- [ ] **Step 2: 개발 서버에서 홈페이지 확인**

```bash
npm run dev
```

`http://localhost:3000` 방문 → 6개 섹션 모두 렌더링 확인

- [ ] **Step 3: 커밋**

```bash
git add app/page.tsx
git commit -m "feat: assemble homepage with Sanity data integration"
```

---

## Task 11: 소개 페이지 (소명·핵심가치, 발자취, 함께하는 사람들)

**Files:**
- Create: `app/intro/page.tsx`
- Create: `app/intro/history/page.tsx`
- Create: `app/intro/people/page.tsx`

- [ ] **Step 1: 소명·핵심가치 페이지**

```typescript
// app/intro/page.tsx
import type { Metadata } from 'next'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = { title: '소개' }

const visions = [
  '저소득 어르신의 건강을 위해 일한다.',
  '취약계층 어린이들의 건강을 위해 일한다.',
  '동남아시아 이웃의 건강을 위해 일한다.',
  '이주민의 건강을 위해 일한다.',
  '북한이탈주민의 건강을 위해 일한다.',
  '생명을 사랑하는 의료를 교육하고 연구한다.',
  '생명사랑의료센터를 설립하여 생명사랑의료를 실천한다.',
]

const values = [
  '한 생명을 천하와 같이 중히 여기어 사랑한다.',
  '성실과 진실로 봉사하고 연구한다.',
  '생명사랑운동을 이루어 생명사랑운동을 실천한다.',
  '함께하는 단체들과 협력하여 사랑의 그물망을 이룬다.',
]

export default function IntroPage() {
  return (
    <div className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionLabel>About</SectionLabel>
        <h1 className="text-4xl font-black mb-6">아름다운생명사랑은</h1>
        <p className="text-text-subtle leading-relaxed mb-16">
          의료계층을 위한 보건의료문서와 교육 및 연구사업을 통하여 존엄한 생명의 아름다움을 꽃 피우기 위한 생명사랑운동단체입니다.
          2006년 6월 20일 「프레임비고」로 창립하였으며 "한 생명이 천하보다 소중하다"는 생명사랑의 정신을 실현하고자 합니다.
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-xl font-black mb-5 text-primary-dark">소명</h2>
            <ul className="space-y-3">
              {visions.map((v, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="text-primary mt-0.5">♥</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-black mb-5 text-primary-dark">핵심가치</h2>
            <ul className="space-y-3">
              {values.map((v, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="text-primary mt-0.5">♥</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 발자취 페이지 (Sanity 타임라인)**

```typescript
// app/intro/history/page.tsx
import type { Metadata } from 'next'
import { getMilestones } from '@/lib/sanity/queries'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = { title: '발자취' }

export default async function HistoryPage() {
  const milestones = await getMilestones()

  // 연도별 그룹핑
  const byYear = milestones.reduce<Record<number, typeof milestones>>((acc, m) => {
    if (!acc[m.year]) acc[m.year] = []
    acc[m.year].push(m)
    return acc
  }, {})
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)

  return (
    <div className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionLabel>History</SectionLabel>
        <h1 className="text-4xl font-black mb-16">발자취</h1>
        <div className="relative border-l-2 border-primary-lighter pl-8 space-y-12">
          {years.map(year => (
            <div key={year}>
              <h2 className="text-2xl font-black text-primary -ml-10 mb-4">{year}</h2>
              <ul className="space-y-3">
                {byYear[year].sort((a, b) => a.month - b.month).map(m => (
                  <li key={m._id} className="flex gap-3 text-sm leading-relaxed">
                    <span className="font-bold text-primary-dark w-6 shrink-0">{m.month}</span>
                    <span className="text-text-subtle">{m.content}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {years.length === 0 && (
            <p className="text-text-subtle">등록된 발자취가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 함께하는 사람들 페이지 (Sanity)**

```typescript
// app/intro/people/page.tsx
import type { Metadata } from 'next'
import { getMembers } from '@/lib/sanity/queries'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Member } from '@/lib/sanity/types'

export const metadata: Metadata = { title: '함께하는 사람들' }

const groupLabels: Record<string, string> = {
  board: '이사회',
  auditor: '감사',
  advisor: '자문위원',
  staff: '상근자',
}

export default async function PeoplePage() {
  const members = await getMembers()
  const byGroup = members.reduce<Record<string, Member[]>>((acc, m) => {
    if (!acc[m.group]) acc[m.group] = []
    acc[m.group].push(m)
    return acc
  }, {})
  const groupOrder = ['board', 'auditor', 'advisor', 'staff']

  return (
    <div className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionLabel>People</SectionLabel>
        <h1 className="text-4xl font-black mb-16">함께하는 사람들</h1>
        <div className="space-y-12">
          {groupOrder.filter(g => byGroup[g]?.length).map(group => (
            <div key={group}>
              <h2 className="text-lg font-black text-primary-dark mb-4 border-b border-primary-lighter pb-2">
                {groupLabels[group]}
              </h2>
              <ul className="space-y-2">
                {byGroup[group].map(m => (
                  <li key={m._id} className="flex gap-4 text-sm">
                    <span className="font-bold w-20 shrink-0">{m.name}</span>
                    <span className="text-text-subtle">{m.position}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 커밋**

```bash
git add app/intro/
git commit -m "feat: add intro pages (mission, history timeline, people)"
```

---

## Task 12: 사업 페이지 (목록 + 상세)

**Files:**
- Create: `app/programs/page.tsx`
- Create: `app/programs/[slug]/page.tsx`

- [ ] **Step 1: PortableText 패키지 설치**

```bash
npm install @portabletext/react
```

- [ ] **Step 2: 사업 목록 페이지 (탭 필터 — 클라이언트 컴포넌트)**

```typescript
// app/programs/page.tsx
import type { Metadata } from 'next'
import { getAllPrograms } from '@/lib/sanity/queries'
import { ProgramsListClient } from './ProgramsListClient'

export const metadata: Metadata = { title: '사업' }

export default async function ProgramsPage() {
  const programs = await getAllPrograms()
  return (
    <div className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-12">주요 사업</h1>
        <ProgramsListClient programs={programs} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 탭 필터 클라이언트 컴포넌트**

```typescript
// app/programs/ProgramsListClient.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Program } from '@/lib/sanity/types'
import { getCategoryLabel } from '@/lib/utils'
import { cn } from '@/lib/cn'

const tabs = [
  { key: 'all', label: '전체' },
  { key: 'domestic', label: '국내' },
  { key: 'overseas', label: '해외' },
  { key: 'education', label: '교육' },
]

const categoryColors: Record<string, string> = {
  domestic: 'bg-primary-lighter text-primary',
  overseas: 'bg-blue-100 text-blue-600',
  education: 'bg-yellow-100 text-yellow-700',
}

export function ProgramsListClient({ programs }: { programs: Program[] }) {
  const [active, setActive] = useState('all')
  const filtered = active === 'all' ? programs : programs.filter(p => p.category === active)

  return (
    <>
      <div className="flex gap-2 mb-10">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-semibold transition-colors',
              active === t.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-primary-light'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.map(p => (
          <Link key={p._id} href={`/programs/${p.slug.current}`}>
            <div className="bg-white rounded-card-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-36 bg-primary-light flex items-center justify-center text-5xl">🏥</div>
              <div className="p-5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[p.category]} mb-2 inline-block`}>
                  {getCategoryLabel(p.category)}
                </span>
                <h3 className="font-bold mb-1">{p.name}</h3>
                <p className="text-sm text-text-subtle leading-relaxed">{p.description}</p>
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-3 text-center text-text-subtle py-10">해당 사업이 없습니다.</p>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 4: 사업 상세 페이지**

```typescript
// app/programs/[slug]/page.tsx
import { getProgramBySlug, getAllPrograms } from '@/lib/sanity/queries'
import { notFound } from 'next/navigation'
import { getCategoryLabel } from '@/lib/utils'
import { PortableText } from '@portabletext/react'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const programs = await getAllPrograms()
  return programs.map(p => ({ slug: p.slug.current }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const program = await getProgramBySlug(params.slug)
  if (!program) return {}
  return { title: program.name }
}

export default async function ProgramDetailPage({ params }: { params: { slug: string } }) {
  const program = await getProgramBySlug(params.slug)
  if (!program) notFound()

  return (
    <div className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <span className="text-xs font-semibold text-primary">{getCategoryLabel(program.category)}</span>
        <h1 className="text-4xl font-black mt-2 mb-6">{program.name}</h1>
        <p className="text-text-subtle leading-relaxed text-lg mb-10">{program.description}</p>
        {program.body && (
          <div className="prose prose-lg max-w-none text-text leading-relaxed">
            <PortableText value={program.body as Parameters<typeof PortableText>[0]['value']} />
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: 커밋**

```bash
git add app/programs/
git commit -m "feat: add programs list page with tab filter and detail page"
```

---

## Task 13: 소식 페이지 (목록 + 상세)

**Files:**
- Create: `app/news/page.tsx`
- Create: `app/news/[slug]/page.tsx`

- [ ] **Step 1: 소식 목록 페이지**

```typescript
// app/news/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/sanity/queries'
import { formatDate, getCategoryLabel } from '@/lib/utils'

export const metadata: Metadata = { title: '소식' }
export const revalidate = 60

export default async function NewsPage() {
  const posts = await getAllPosts()

  return (
    <div className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-12">소식</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map(post => (
            <Link key={post._id} href={`/news/${post.slug.current}`}>
              <article className="rounded-card overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                <div className="h-44 bg-primary-light flex items-center justify-center text-4xl">📋</div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-primary">{getCategoryLabel(post.category)}</span>
                    <span className="text-xs text-text-subtle">{formatDate(post.publishedAt)}</span>
                  </div>
                  <h2 className="font-bold text-sm leading-relaxed line-clamp-2">{post.title}</h2>
                  {post.excerpt && <p className="text-xs text-text-subtle mt-2 line-clamp-2">{post.excerpt}</p>}
                </div>
              </article>
            </Link>
          ))}
          {posts.length === 0 && (
            <p className="col-span-3 text-center text-text-subtle py-10">등록된 소식이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 소식 상세 페이지**

```typescript
// app/news/[slug]/page.tsx
import { getPostBySlug, getAllPosts } from '@/lib/sanity/queries'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { formatDate, getCategoryLabel } from '@/lib/utils'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map(p => ({ slug: p.slug.current }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return {}
  return { title: post.title, description: post.excerpt }
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  return (
    <div className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-semibold text-primary">{getCategoryLabel(post.category)}</span>
          <span className="text-sm text-text-subtle">{formatDate(post.publishedAt)}</span>
        </div>
        <h1 className="text-3xl font-black mb-10 leading-tight">{post.title}</h1>
        {post.body && (
          <div className="prose prose-lg max-w-none text-text leading-relaxed">
            <PortableText value={post.body as Parameters<typeof PortableText>[0]['value']} />
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 커밋**

```bash
git add app/news/
git commit -m "feat: add news list and detail pages with PortableText rendering"
```

---

## Task 14: 후원·참여 페이지

**Files:**
- Create: `app/support/page.tsx`

- [ ] **Step 1: 후원·참여 페이지 구현**

```typescript
// app/support/page.tsx
import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/sanity/queries'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = { title: '후원·참여' }

export default async function SupportPage() {
  const settings = await getSiteSettings()

  return (
    <div className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionLabel>Support</SectionLabel>
        <h1 className="text-4xl font-black mb-4">후원·참여</h1>
        <p className="text-text-subtle mb-16 leading-relaxed">
          아름다운생명사랑은 공익법인(구 지정기부금단체)으로 후원금에 대해 세액공제 혜택이 주어집니다.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* 정기후원 */}
          <div className="bg-primary-light rounded-card-lg p-8 border border-primary-lighter">
            <h2 className="text-xl font-black text-primary-dark mb-4">정기후원</h2>
            <p className="text-sm text-text-subtle leading-relaxed mb-6">
              매월 일정 금액을 후원하시면 꾸준한 사업 진행에 큰 힘이 됩니다.
            </p>
            <div className="bg-white rounded-card p-4 text-sm">
              <p className="font-bold mb-1">후원 계좌</p>
              <p className="text-primary font-mono text-lg">{settings?.donationBank} {settings?.donationAccount}</p>
              <p className="text-text-subtle mt-1">예금주: {settings?.donationHolder}</p>
            </div>
          </div>

          {/* 의료봉사 */}
          <div className="bg-white rounded-card-lg p-8 border border-gray-200">
            <h2 className="text-xl font-black text-primary-dark mb-4">의료봉사 신청</h2>
            <p className="text-sm text-text-subtle leading-relaxed mb-6">
              의료인·예비의료인이라면 생명사랑의료학교 및 의료봉사 활동에 참여하실 수 있습니다.
            </p>
            <a
              href={`mailto:${settings?.contactEmail ?? 'belife@belife.org'}`}
              className="inline-block bg-primary text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              이메일로 문의하기
            </a>
          </div>
        </div>

        <div className="bg-gray-50 rounded-card-lg p-6 text-sm text-text-subtle leading-relaxed">
          <p className="font-bold text-text mb-2">세액공제 안내</p>
          <p>아름다운생명사랑은 공익법인(구 지정기부금단체)으로 지정되어 있습니다.<br />
          개인 기부자: 기부금의 15%(1,000만 원 초과분 30%) 세액공제<br />
          법인 기부자: 법인 소득의 10% 한도 내 손금 산입</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add app/support/
git commit -m "feat: add support page with donation info and volunteer CTA"
```

---

## Task 15: 문의 페이지 + siteSettings 데이터 연결

**Files:**
- Create: `app/contact/page.tsx`

- [ ] **Step 1: 문의 페이지 구현**

```typescript
// app/contact/page.tsx
import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/sanity/queries'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = { title: '문의' }

export default async function ContactPage() {
  const settings = await getSiteSettings()

  return (
    <div className="py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <SectionLabel>Contact</SectionLabel>
        <h1 className="text-4xl font-black mb-4">문의</h1>
        <p className="text-text-subtle mb-12 leading-relaxed">
          사업 협력, 후원, 봉사 문의는 아래 연락처로 연락해주세요.
        </p>

        <div className="space-y-5">
          {settings?.phoneNumber && (
            <div className="flex gap-4 items-start">
              <span className="text-2xl">📞</span>
              <div>
                <p className="font-bold text-sm mb-0.5">전화</p>
                <p className="text-text-subtle">{settings.phoneNumber}</p>
              </div>
            </div>
          )}
          {settings?.contactEmail && (
            <div className="flex gap-4 items-start">
              <span className="text-2xl">✉️</span>
              <div>
                <p className="font-bold text-sm mb-0.5">이메일</p>
                <a href={`mailto:${settings.contactEmail}`} className="text-primary hover:underline">
                  {settings.contactEmail}
                </a>
              </div>
            </div>
          )}
          {settings?.address && (
            <div className="flex gap-4 items-start">
              <span className="text-2xl">📍</span>
              <div>
                <p className="font-bold text-sm mb-0.5">주소</p>
                <p className="text-text-subtle">{settings.address}</p>
              </div>
            </div>
          )}
          {!settings && (
            <p className="text-text-subtle">Sanity Studio에서 사이트 설정을 입력해주세요.</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add app/contact/
git commit -m "feat: add contact page with Sanity siteSettings integration"
```

---

## Task 16: SEO 메타데이터 + 마무리

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/not-found.tsx`

- [ ] **Step 1: 루트 레이아웃 OG 메타데이터 보강**

```typescript
// app/layout.tsx의 metadata 수정
export const metadata: Metadata = {
  title: { default: '아름다운생명사랑', template: '%s | 아름다운생명사랑' },
  description: '저소득 어르신, 취약계층 어린이, 이주민, 해외 빈민을 위한 의료복지 비영리단체',
  keywords: ['아름다운생명사랑', 'belife', '비영리', '의료복지', '후원', '봉사'],
  openGraph: {
    type: 'website',
    siteName: '아름다운생명사랑',
    locale: 'ko_KR',
    url: 'https://belife.org',
  },
  robots: { index: true, follow: true },
}
```

- [ ] **Step 2: 404 페이지**

```typescript
// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-6xl font-black text-primary-lighter">404</h1>
      <p className="text-text-subtle">페이지를 찾을 수 없습니다.</p>
      <Link href="/" className="text-primary font-semibold hover:underline">홈으로 돌아가기</Link>
    </div>
  )
}
```

- [ ] **Step 3: 전체 테스트 실행**

```bash
npm run test:run
```

Expected: 모든 테스트 PASS

- [ ] **Step 4: 빌드 확인**

```bash
npm run build
```

Expected: 에러 없이 빌드 완료

- [ ] **Step 5: 최종 커밋**

```bash
git add .
git commit -m "feat: add SEO metadata, 404 page, and complete build verification"
```

---

## Task 17: Vercel 배포 + Sanity 초기 데이터 입력

- [ ] **Step 1: Vercel 배포**

```bash
npx vercel --prod
```

Vercel 대시보드에서 환경변수 설정:
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`

- [ ] **Step 2: Sanity Studio에서 초기 데이터 입력**

`https://your-vercel-url/studio` 또는 `http://localhost:3000/studio` 접속 후:

1. **사이트 설정** — 후원 계좌, 연락처, 주소 입력
2. **임팩트 수치** — 4개 항목 (20년 역사, 의료학교 기수, 필리핀 가구수, 이주민 수)
3. **사업** — 4개 이상 사업 입력 (국내/해외/교육 구분)
4. **발자취** — 2015~2025 연도별 주요 사업 입력 (Images 폴더 자료 참고)
5. **함께하는 사람들** — 이사회, 감사, 자문위원, 상근자 입력 (Images 폴더 자료 참고)

- [ ] **Step 3: 사이트 동작 확인**

배포된 URL에서 체크:
- [ ] 홈페이지 6개 섹션 렌더링
- [ ] 소개 → 소명·핵심가치 페이지
- [ ] 소개 → 발자취 타임라인
- [ ] 소개 → 함께하는 사람들
- [ ] 사업 목록 탭 필터
- [ ] 소식 목록 + 상세
- [ ] 후원·참여 계좌 표시
- [ ] 문의 연락처 표시
- [ ] 모바일 반응형 확인 (햄버거 메뉴)
- [ ] 메타태그 확인 (브라우저 탭 타이틀)
