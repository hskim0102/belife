// app/page.tsx
import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { QuickLinksSection } from '@/components/home/QuickLinksSection'
import { MissionSection } from '@/components/home/MissionSection'
import { ProgramsSection } from '@/components/home/ProgramsSection'
import { ImpactSection } from '@/components/home/ImpactSection'
import { NewsSection } from '@/components/home/NewsSection'
import { CtaSection } from '@/components/home/CtaSection'
import { getAllPrograms } from '@/lib/repositories/programs'
import { getRecentPosts } from '@/lib/repositories/posts'
import { getImpactStats } from '@/lib/repositories/misc'
import { getPublishedHeroSlides } from '@/lib/repositories/heroSlides'
import { getEnabledMissionCards } from '@/lib/repositories/missionCards'

export const metadata: Metadata = {
  title: '아름다운생명사랑 | 생명을 사랑하는 의료복지단체',
  description: '저소득 어르신, 취약계층 어린이, 이주민, 해외 빈민을 위한 의료복지 비영리단체',
}

export const revalidate = 60

export default async function HomePage() {
  const [programs, activityPosts, noticePost, newsPost, pressPost, stats, heroSlides, missionCards] = await Promise.all([
    getAllPrograms(),
    getRecentPosts(3, ['activity']),
    getRecentPosts(6, ['notice']),
    getRecentPosts(6, ['activity']),
    getRecentPosts(6, ['press']),
    getImpactStats(),
    getPublishedHeroSlides(),
    getEnabledMissionCards(),
  ])

  const slides = heroSlides.map(s => ({ src: s.imageUrl, alt: s.alt }))

  return (
    <>
      <HeroSection slides={slides} />
      <QuickLinksSection />
      <MissionSection cards={missionCards} />
      <ProgramsSection programs={programs} />
      <ImpactSection stats={stats} />
      <NewsSection posts={activityPosts} noticePost={noticePost} newsPost={newsPost} pressPost={pressPost} />
      <CtaSection />
    </>
  )
}
