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
