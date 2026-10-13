// app/page.tsx
import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { QuickLinksSection } from '@/components/home/QuickLinksSection'
import { ProgramsSection } from '@/components/home/ProgramsSection'
import { PhotoGallerySection } from '@/components/home/PhotoGallerySection'
import { NewsSection } from '@/components/home/NewsSection'
import { CtaSection } from '@/components/home/CtaSection'
import { getCachedPrograms } from '@/lib/cache'
import { getRecentPosts } from '@/lib/repositories/posts'
import { getPublishedHeroSlides } from '@/lib/repositories/heroSlides'

export const metadata: Metadata = {
  title: '아름다운생명사랑 | 생명을 사랑하는 의료복지단체',
  description: '저소득 어르신, 취약계층 어린이, 이주민, 해외 빈민을 위한 의료복지 비영리단체',
}

// 관리자 화면에서 고치면 revalidatePath·updateTag 로 즉시 갱신되므로, 시간 기반 재생성은 길게 둔다.
export const revalidate = 3600

export default async function HomePage() {
  const [programs, activityPosts, noticePost, newsPost, pressPost, photoPosts, heroSlides] = await Promise.all([
    getCachedPrograms(),
    getRecentPosts(3, ['activity']),
    getRecentPosts(6, ['notice']),
    getRecentPosts(6, ['activity']),
    getRecentPosts(6, ['press']),
    getRecentPosts(12, ['photo']),
    getPublishedHeroSlides(),
  ])

  const slides = heroSlides.map(s => ({ src: s.imageUrl, alt: s.alt, title: s.title, subtitle: s.subtitle }))

  return (
    <>
      <HeroSection slides={slides} />
      <QuickLinksSection />
      <ProgramsSection programs={programs} />
      <PhotoGallerySection photos={photoPosts} />
      <NewsSection posts={activityPosts} noticePost={noticePost} newsPost={newsPost} pressPost={pressPost} />
      <CtaSection />
    </>
  )
}
